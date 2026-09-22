import asyncHandler from "../utils/asyncHandler.js";
import Payment from "../models/payment.js";
import VendorSettlement from "../models/VendorSettlement.js";
import RiderEarning from "../models/RiderEarning.js";
import RiderPayout from "../models/RiderPayout.js";
import FinancialLedger from "../models/FinancialLedger.js";
import Refund from "../models/Refund.js";
import Order from "../models/order.js";
import mongoose from "mongoose";

// Overview
export const getPaymentOverview = asyncHandler(async (req, res) => {
  const [
    totalCollected,
    vendorPayable,
    riderPayable,
    platformCommission,
    refunds,
  ] = await Promise.all([
    Payment.aggregate([
      { $match: { status: "captured" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    VendorSettlement.aggregate([
      { $match: { status: "eligible" } },
      { $group: { _id: null, total: { $sum: "$netPayable" } } },
    ]),
    RiderEarning.aggregate([
      { $match: { status: "eligible" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    FinancialLedger.aggregate([
      { $group: { _id: null, total: { $sum: "$platformCommission" } } },
    ]),
    Refund.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalCollected: totalCollected[0]?.total || 0,
      vendorPayable: vendorPayable[0]?.total || 0,
      riderPayable: riderPayable[0]?.total || 0,
      platformCommission: platformCommission[0]?.total || 0,
      refunds: refunds[0]?.total || 0,
    },
  });
});

// Vendor Settlements
export const getVendorSettlements = asyncHandler(async (req, res) => {
  const { status, vendorId } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (vendorId) filter.vendorId = vendorId;

  const settlements = await VendorSettlement.find(filter)
    .populate("vendorId", "businessName")
    .populate("orderId", "totalAmount")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: { settlements } });
});

export const processVendorSettlement = asyncHandler(async (req, res) => {
  const { settlementId } = req.params;
  const settlement = await VendorSettlement.findById(settlementId);
  if (!settlement) throw new ApiError(404, "Settlement not found");

  if (settlement.status !== "eligible") {
    throw new ApiError(400, "Settlement not eligible");
  }

  // In a real scenario, you'd call Razorpay Route transfer
  // For now, we just mark as processing
  settlement.status = "processing";
  await settlement.save();

  // Here you would initiate transfer via Razorpay Route
  // ... (pseudo: use razorpay.transfers.create)
  // On success: mark 'paid' and store transferId
  // On failure: mark 'failed' and store failureReason

  // For demo, we'll just mark as paid (replace with actual logic)
  settlement.status = "paid";
  settlement.processedAt = new Date();
  settlement.processedBy = req.admin._id;
  await settlement.save();

  res.status(200).json({ success: true, data: { settlement } });
});

// Rider Earnings & Payouts
export const getRiderEarnings = asyncHandler(async (req, res) => {
  const { riderId } = req.query;
  const filter = {};
  if (riderId) filter.riderId = riderId;

  const earnings = await RiderEarning.find(filter)
    .populate("orderId")
    .sort({ earnedAt: -1 });
  res.status(200).json({ success: true, data: { earnings } });
});

export const getRiderPayouts = asyncHandler(async (req, res) => {
  const { riderId, status } = req.query;
  const filter = {};
  if (riderId) filter.riderId = riderId;
  if (status) filter.status = status;

  const payouts = await RiderPayout.find(filter)
    .populate("riderId", "name phone")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: { payouts } });
});

export const processRiderPayout = asyncHandler(async (req, res) => {
  const { payoutId } = req.params;
  const payout = await RiderPayout.findById(payoutId);
  if (!payout) throw new ApiError(404, "Payout not found");

  if (payout.status !== "approved") {
    throw new ApiError(400, "Payout not approved");
  }

  // Call Razorpay payout API
  // For demo, mark as processing then paid
  payout.status = "paid";
  payout.processedAt = new Date();
  payout.processedBy = req.admin._id;
  await payout.save();

  // Also mark associated rider earnings as paid
  await RiderEarning.updateMany({ payoutId: payout._id }, { status: "paid" });

  res.status(200).json({ success: true, data: { payout } });
});

// Refunds
export const getRefunds = asyncHandler(async (req, res) => {
  const refunds = await Refund.find()
    .populate("orderId")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: { refunds } });
});

// Reconciliation
export const getReconciliation = asyncHandler(async (req, res) => {
  // This is a complex query – we'll aggregate from Razorpay payments vs our Payment records
  // For now, we'll return a summary from our database
  const [captured, refunded, transferred, pending] = await Promise.all([
    Payment.aggregate([
      { $match: { status: "captured" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Refund.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    VendorSettlement.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$netPayable" } } },
    ]),
    VendorSettlement.aggregate([
      { $match: { status: "eligible" } },
      { $group: { _id: null, total: { $sum: "$netPayable" } } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      capturedAmount: captured[0]?.total || 0,
      refundedAmount: refunded[0]?.total || 0,
      transferredAmount: transferred[0]?.total || 0,
      pendingAmount: pending[0]?.total || 0,
    },
  });
});

// Payment Analytics
export const getPaymentAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const match = {};
  if (startDate) match.createdAt = { $gte: new Date(startDate) };
  if (endDate)
    match.createdAt = { ...match.createdAt, $lte: new Date(endDate) };

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalCollected: { $sum: "$amount" },
        successful: {
          $sum: { $cond: [{ $eq: ["$status", "captured"] }, 1, 0] },
        },
        failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
        refunded: { $sum: { $cond: [{ $eq: ["$status", "refunded"] }, 1, 0] } },
      },
    },
  ];

  const [result] = await Payment.aggregate(pipeline);
  // Add payment method breakdown
  const methodBreakdown = await Payment.aggregate([
    { $match: match },
    { $group: { _id: "$paymentMethod", count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      ...result,
      paymentMethodBreakdown: methodBreakdown,
    },
  });
});
