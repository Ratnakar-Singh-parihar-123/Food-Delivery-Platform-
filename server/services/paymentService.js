import Order from "../models/order.js";
import Payment from "../models/payment.js"; // if exists; else create
import FinancialLedger from "../models/FinancialLedger.js";
import VendorSettlement from "../models/VendorSettlement.js";
import RiderEarning from "../models/RiderEarning.js";
import Refund from "../models/Refund.js";
import Vendor from "../models/vendor.js";
import Razorpay from "razorpay";
import crypto from "crypto";

// Assume razorpay instance is configured
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order for a given orderId
 */
export const createRazorpayOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  // Calculate amount in paisa (Razorpay expects smallest currency unit)
  const amount = Math.round(order.totalAmount * 100); // assuming totalAmount in rupees

  const options = {
    amount,
    currency: "INR",
    receipt: `order_${orderId}`,
    notes: {
      orderId: orderId.toString(),
    },
  };

  const rzpOrder = await razorpay.orders.create(options);

  // Save razorpayOrderId in order
  order.razorpayOrderId = rzpOrder.id;
  await order.save();

  return rzpOrder;
};

/**
 * Verify Razorpay payment signature
 */
export const verifyPaymentSignature = (
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
) => {
  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");
  return expectedSignature === razorpaySignature;
};

/**
 * Capture payment after verification
 * This is called after webhook confirms payment
 */
export const capturePayment = async (razorpayPaymentId, razorpayOrderId) => {
  // Find order by razorpayOrderId
  const order = await Order.findOne({ razorpayOrderId });
  if (!order) throw new Error("Order not found");

  // Check if payment already processed (idempotency)
  const existingPayment = await Payment.findOne({ razorpayPaymentId });
  if (existingPayment) {
    return existingPayment;
  }

  // Fetch payment details from Razorpay to confirm amount
  const payment = await razorpay.payments.fetch(razorpayPaymentId);
  if (payment.status !== "captured") {
    throw new Error("Payment not captured");
  }

  // Create Payment record
  const newPayment = await Payment.create({
    orderId: order._id,
    customerId: order.customerId,
    vendorId: order.vendorId,
    razorpayOrderId,
    razorpayPaymentId,
    amount: payment.amount / 100, // convert back to rupees
    currency: payment.currency,
    paymentMethod: payment.method,
    status: "captured",
    capturedAt: new Date(),
  });

  // Update order payment status
  order.paymentStatus = "paid";
  order.razorpayPaymentId = razorpayPaymentId;
  await order.save();

  // Create financial ledger and settlements
  await createFinancialRecords(order, newPayment);

  return newPayment;
};

/**
 * Create ledger, vendor settlement, rider earning
 */
async function createFinancialRecords(order, payment) {
  // Calculate breakdown (use existing order fields)
  const vendorId = order.vendorId;
  const riderId = order.riderId;

  // Fetch vendor commission
  const vendor = await Vendor.findById(vendorId);
  const commissionPercent = vendor?.commissionPercentage || 15; // fallback

  const customerPaid = order.totalAmount;
  const platformCommission = (customerPaid * commissionPercent) / 100;
  const vendorAmount =
    customerPaid - platformCommission - (order.deliveryFee || 0); // if delivery fee goes to rider
  const riderEarning = order.deliveryFee || 0; // assuming delivery fee = rider earning

  // 1. Financial Ledger
  const ledger = await FinancialLedger.create({
    orderId: order._id,
    paymentId: payment._id,
    customerId: order.customerId,
    vendorId: vendorId,
    riderId: riderId || null,
    customerPaid,
    vendorAmount,
    platformCommission,
    riderEarning,
    discount: order.discount || 0,
    refund: 0,
    adjustment: 0,
    status: "active",
  });

  // 2. Vendor Settlement (net payable = vendorAmount)
  const netVendorPayable = vendorAmount - (order.refundAmount || 0); // if any refund
  await VendorSettlement.create({
    vendorId,
    orderId: order._id,
    paymentId: payment._id,
    grossAmount: customerPaid,
    commission: platformCommission,
    refundAmount: order.refundAmount || 0,
    netPayable: netVendorPayable,
    status: "eligible", // eligible for settlement
  });

  // 3. Rider Earning (if rider exists)
  if (riderId) {
    await RiderEarning.create({
      riderId,
      orderId: order._id,
      amount: riderEarning,
      status: "eligible", // eligible after delivery completed
      earningType: "delivery",
    });
  }
}
