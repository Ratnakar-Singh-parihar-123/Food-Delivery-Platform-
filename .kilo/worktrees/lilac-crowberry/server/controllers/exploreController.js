// controllers/exploreController.js
import mongoose from "mongoose";
import ExploreCategory from "../models/ExploreCategory.js";
import Vendor from "../models/vendor.js";
import MenuItem from "../models/MenuItem.js";

// ─── Helpers ────────────────────────────────────────────────

const validateObjectIds = (ids) => {
  if (!ids || !Array.isArray(ids)) return [];
  return ids
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
};

// ✅ Simplified icon validator – just require 1–2 characters
const isValidIcon = (icon) => {
  if (!icon || typeof icon !== "string") return false;
  const trimmed = icon.trim();
  return trimmed.length > 0 && trimmed.length <= 2;
};

// ─── Admin: Get All Categories ─────────────────────────────
export const adminGetExploreCategories = async (req, res) => {
  try {
    const categories = await ExploreCategory.find()
      .populate("vendors", "businessName name profileImage")
      .populate({
        path: "items",
        populate: { path: "vendorId", select: "businessName" },
      })
      .sort({ displayOrder: 1, createdAt: -1 });

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("❌ adminGetExploreCategories error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories" });
  }
};

// ─── Admin: Create ──────────────────────────────────────────
export const createExploreCategory = async (req, res) => {
  try {
    const { title, icon, description, vendors, items, displayOrder, isActive } =
      req.body;

    // ─── Validation ──────────────────────────────────────
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }
    if (!icon || !icon.trim()) {
      return res.status(400).json({
        success: false,
        message: "Icon is required",
      });
    }
    if (!isValidIcon(icon)) {
      return res.status(400).json({
        success: false,
        message: "Icon must be 1 or 2 characters (e.g., 🔥, ✨, 🍕)",
      });
    }

    // ─── Check duplicate title ──────────────────────────
    const existing = await ExploreCategory.findOne({
      title: { $regex: new RegExp(`^${title.trim()}$`, "i") },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A category with this title already exists",
      });
    }

    const vendorIds = validateObjectIds(vendors);
    const itemIds = validateObjectIds(items);

    const categoryData = {
      title: title.trim(),
      icon: icon.trim(),
      description: description ? description.trim() : "",
      vendors: vendorIds,
      items: itemIds,
      displayOrder: Number(displayOrder) || 0,
      isActive: isActive !== undefined ? isActive : true,
    };

    const category = new ExploreCategory(categoryData);
    await category.save();

    const populated = await ExploreCategory.findById(category._id)
      .populate("vendors", "businessName name profileImage")
      .populate({
        path: "items",
        populate: { path: "vendorId", select: "businessName" },
      });

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error("❌ createExploreCategory error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category title already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create category",
    });
  }
};

// ─── Admin: Update ──────────────────────────────────────────
export const updateExploreCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, icon, description, vendors, items, displayOrder, isActive } =
      req.body;

    const category = await ExploreCategory.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res
          .status(400)
          .json({ success: false, message: "Title cannot be empty" });
      }
      if (title.trim() !== category.title) {
        const existing = await ExploreCategory.findOne({
          title: { $regex: new RegExp(`^${title.trim()}$`, "i") },
          _id: { $ne: id },
        });
        if (existing) {
          return res.status(409).json({
            success: false,
            message: "Another category with this title already exists",
          });
        }
      }
    }

    if (icon !== undefined) {
      if (!icon.trim()) {
        return res
          .status(400)
          .json({ success: false, message: "Icon cannot be empty" });
      }
      if (!isValidIcon(icon)) {
        return res.status(400).json({
          success: false,
          message: "Icon must be 1 or 2 characters (e.g., 🔥, ✨, 🍕)",
        });
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (icon !== undefined) updateData.icon = icon.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (displayOrder !== undefined)
      updateData.displayOrder = Number(displayOrder);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (vendors !== undefined) updateData.vendors = validateObjectIds(vendors);
    if (items !== undefined) updateData.items = validateObjectIds(items);

    const updated = await ExploreCategory.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    const populated = await ExploreCategory.findById(updated._id)
      .populate("vendors", "businessName name profileImage")
      .populate({
        path: "items",
        populate: { path: "vendorId", select: "businessName" },
      });

    res.json({ success: true, data: populated });
  } catch (error) {
    console.error("❌ updateExploreCategory error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category title already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update category",
    });
  }
};

// ─── Admin: Delete ──────────────────────────────────────────
export const deleteExploreCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await ExploreCategory.findByIdAndDelete(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("❌ deleteExploreCategory error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete category",
    });
  }
};

// ─── Customer: Get All (active) ────────────────────────────
export const getExploreCategories = async (req, res) => {
  try {
    const categories = await ExploreCategory.find({ isActive: true })
      .populate({
        path: "vendors",
        select:
          "businessName businessType profileImage rating totalRatings isOnline minimumOrderAmount averagePreparationTime location",
      })
      .populate({
        path: "items",
        populate: { path: "vendorId", select: "businessName" },
      })
      .sort({ displayOrder: 1, createdAt: -1 });

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("❌ getExploreCategories error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Customer: Get By ID ───────────────────────────────────
export const getExploreCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await ExploreCategory.findById(id)
      .populate("vendors")
      .populate({
        path: "items",
        populate: { path: "vendorId", select: "businessName" },
      });

    if (!category || !category.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Category not available" });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    console.error("❌ getExploreCategoryById error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin: Auto‑Suggest ──────────────────────────────────
export const getSuggestions = async (req, res) => {
  try {
    const [topVendors, topItems] = await Promise.all([
      Vendor.find({ isActive: true })
        .sort({ rating: -1 })
        .limit(10)
        .select("_id businessName name rating profileImage"),
      MenuItem.find({ isActive: true })
        .sort({ rating: -1 })
        .limit(10)
        .select("_id name rating vendorId"),
    ]);
    res.json({ success: true, data: { vendors: topVendors, items: topItems } });
  } catch (error) {
    console.error("❌ getSuggestions error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
