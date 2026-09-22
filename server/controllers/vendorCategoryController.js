import Category from "../models/VendorCategory.js";
import MenuItem from "../models/MenuItem.js";

// ─── Helper: build image URL (optional) ─────────────────────
// const buildImageUrl = (imagePath) => { ... } // not needed here

export const addCategory = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { name, description, sortOrder } = req.body;

    // ─── Debug log ──────────────────────────────────────────
    console.log("📸 AddCategory - req.file:", req.file);
    console.log("📸 AddCategory - req.body:", req.body);

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Category name is required" });
    }

    let iconPath = null;
    if (req.file) {
      iconPath = `/uploads/categories/${req.file.filename}`;
      console.log("✅ Icon saved at:", iconPath);
    } else {
      console.log("⚠️ No file uploaded");
    }

    const category = new Category({
      vendorId,
      name: name.trim(),
      description: description?.trim() || "",
      icon: iconPath,
      sortOrder: sortOrder || 0,
    });

    await category.save();
    console.log("✅ Category saved with icon:", category.icon);

    res.status(201).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    console.error("❌ Add category error:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Category name already exists" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Similarly add logs to updateCategory
export const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, sortOrder } = req.body;

    console.log("📸 UpdateCategory - req.file:", req.file);
    console.log("📸 UpdateCategory - req.body:", req.body);

    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    if (req.vendor._id.toString() !== category.vendorId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (name !== undefined) category.name = name.trim();
    if (description !== undefined) category.description = description.trim();
    if (sortOrder !== undefined) category.sortOrder = sortOrder;

    if (req.file) {
      category.icon = `/uploads/categories/${req.file.filename}`;
      console.log("✅ Icon updated to:", category.icon);
    }

    await category.save();
    console.log("✅ Category updated with icon:", category.icon);

    res.status(200).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    console.error("❌ Update category error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ... deleteCategory, getCategories, getCategoryById remain the same

// ─── Delete category (and its items) ─────────────────────────
export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    if (req.vendor._id.toString() !== category.vendorId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Delete all menu items in this category
    await MenuItem.deleteMany({ categoryId });
    // Optionally delete the icon image file from disk (implement if needed)
    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category and its items deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete category error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Get all categories for a vendor (public) ────────────────
export const getCategories = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { includeItems = "false" } = req.query;

    const filter = { vendorId, isActive: true };

    const categories = await Category.find(filter).sort("sortOrder");

    // If includeItems=true, populate items inside each category
    if (includeItems === "true") {
      const categoriesWithItems = await Promise.all(
        categories.map(async (cat) => {
          const items = await MenuItem.find({
            categoryId: cat._id,
            isAvailable: true,
          }).sort("sortOrder");
          return { ...cat.toObject(), items };
        }),
      );
      return res.status(200).json({
        success: true,
        data: { categories: categoriesWithItems },
      });
    }

    res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error("❌ Get categories error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Get a single category by ID (public) ────────────────────
export const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { includeItems = "false" } = req.query;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    if (includeItems === "true") {
      const items = await MenuItem.find({
        categoryId: category._id,
        isAvailable: true,
      }).sort("sortOrder");
      return res.status(200).json({
        success: true,
        data: { category: { ...category.toObject(), items } },
      });
    }

    res.status(200).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    console.error("❌ Get category by ID error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
