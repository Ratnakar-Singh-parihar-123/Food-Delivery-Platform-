import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    issue: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    type: {
      type: String,
      enum: ["Order", "Payment", "Delivery", "Vendor", "Rider", "General"],
      default: "General",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    resolvedAt: Date,
    resolution: String,
  },
  { timestamps: true },
);

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);
export default SupportTicket;
