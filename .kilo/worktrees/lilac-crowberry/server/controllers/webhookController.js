import { capturePayment } from "../services/paymentService.js";
import crypto from "crypto";

export const handleRazorpayWebhook = async (req, res) => {
  // Verify webhook signature
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== signature) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid signature" });
  }

  const event = req.body.event;
  const payload = req.body.payload;

  // Idempotency: check if payment already processed
  // We'll use razorpayPaymentId to check existence

  try {
    if (event === "payment.captured") {
      const paymentId = payload.payment.entity.id;
      const orderId = payload.payment.entity.notes?.orderId; // or from order reference

      // Find order by razorpayOrderId (you may store in order)
      // We'll call capturePayment which handles idempotency internally
      await capturePayment(paymentId, payload.payment.entity.order_id);
    } else if (event === "payment.failed") {
      // Handle failed payment – update order/payment status
      const paymentId = payload.payment.entity.id;
      // Update Payment status to failed
      await Payment.findOneAndUpdate(
        { razorpayPaymentId: paymentId },
        {
          status: "failed",
          failureReason: payload.payment.entity.error_description,
        },
      );
    } else if (event === "refund.processed") {
      // Handle refund confirmation
      const refundId = payload.refund.entity.id;
      // Update Refund status
      await Refund.findOneAndUpdate(
        { razorpayRefundId: refundId },
        { status: "completed", processedAt: new Date() },
      );
    }
    // Add other events as needed

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    // Return 200 to avoid retry, but log error for manual intervention
    res.status(200).json({ success: false, message: error.message });
  }
};
