import mongoose from "mongoose";

const riderDocumentSchema = new mongoose.Schema(
  {
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "aadhaar_front",
        "aadhaar_back",
        "pan",
        "license",
        "vehicle_rc",
        "insurance",
        "profile_photo",
      ],
      required: true,
    },
    fileUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    rejectionReason: String,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    verifiedAt: Date,
  },
  { timestamps: true },
);

riderDocumentSchema.index({ riderId: 1, type: 1 }, { unique: true });

const RiderDocument =
  mongoose.models.RiderDocument ||
  mongoose.model("RiderDocument", riderDocumentSchema);
export default RiderDocument;
