import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    subtitle: {
      type: String,
      trim: true,
      maxlength: 250,
      default: "",
    },

    image: {
      type: String,
      required: true,
    },

    /* Customer app / Rider app / Tiffin House */
    target: {
      type: String,
      enum: ["customer", "rider", "tiffin"], // ✅ added "tiffin"
      required: true,
      index: true,
    },

    /* Banner kis type ka hai */
    type: {
      type: String,
      enum: ["general", "promotion", "offer", "announcement", "campaign"],
      default: "general",
    },

    action: {
      label: {
        type: String,
        trim: true,
        default: "",
      },

      url: {
        type: String,
        trim: true,
        default: "",
      },
    },

    /* Customer banner kisi vendor par open kar sakta hai */
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },

    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    /* Lowest sortOrder first */
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    startAt: {
      type: Date,
      default: null,
    },

    endAt: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

bannerSchema.index({
  target: 1,
  isActive: 1,
  sortOrder: 1,
});

bannerSchema.index({
  target: 1,
  createdAt: -1,
});

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
