import asyncHandler from "../utils/asyncHandler.js";
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  capturePayment,
} from "../services/paymentService.js";
import Order from "../models/order.js";
import Payment from "../models/payment.js";

// Create Razorpay order for a customer order
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const customerId = req.user._id; // assuming customer auth

  const order = await Order.findOne({ _id: orderId, customerId });
  if (!order) throw new ApiError(404, "Order not found");

  const rzpOrder = await createRazorpayOrder(orderId);
  res.status(200).json({
    success: true,
    data: {
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
    },
  });
});

// Verify payment after frontend success
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const customerId = req.user._id;

  // Verify signature
  const isValid = verifyPaymentSignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  );
  if (!isValid) {
    throw new ApiError(400, "Invalid payment signature");
  }

  // Find order and ensure it belongs to customer
  const order = await Order.findOne({ razorpayOrderId, customerId });
  if (!order) throw new ApiError(404, "Order not found");

  // Capture payment – this will create all financial records
  const payment = await capturePayment(razorpayPaymentId, razorpayOrderId);

  res.status(200).json({
    success: true,
    message: "Payment verified and captured",
    data: { payment },
  });
});

// Get payment details (customer)
export const getPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const payment = await Payment.findOne({
    _id: paymentId,
    customerId: req.user._id,
  });
  if (!payment) throw new ApiError(404, "Payment not found");
  res.status(200).json({ success: true, data: { payment } });
});
