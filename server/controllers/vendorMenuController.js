import MenuItem from "../models/MenuItem.js";
import Category from "../models/VendorCategory.js";

// ─── Get menu items (public) ──────────────────────────────
export const getMenuItems = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const {
      categoryId,
      limit = 50,
      page = 1,
      sort = "sortOrder",
      isAvailable,
    } = req.query;

    const filter = { vendorId };
    if (categoryId) filter.categoryId = categoryId;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const items = await MenuItem.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .populate("categoryId", "name description");

    const total = await MenuItem.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        items,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get menu items error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Get a single menu item (public) ──────────────────────
export const getMenuItemById = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await MenuItem.findById(itemId)
      .populate("categoryId", "name description")
      .populate("vendorId", "businessName profileImage");
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }
    res.status(200).json({ success: true, data: { item } });
  } catch (error) {
    console.error("Get item by ID error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Add menu item (protected) ────────────────────────────
export const addMenuItem = async (req, res) => {
  try {
    // Authenticated vendor from middleware
    const vendorId = req.vendor._id;
    const {
      categoryId,
      name,
      description,
      price,
      isAvailable,
      preparationTime,
      sortOrder,
    } = req.body;

    // ─── Validation ──────────────────────────────────────
    if (!categoryId) {
      return res
        .status(400)
        .json({ success: false, message: "Category ID is required" });
    }
    if (!name?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Item name is required" });
    }
    if (!price || isNaN(price) || price < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Valid price is required" });
    }

    // ─── Verify category belongs to vendor ─────────────
    const category = await Category.findOne({ _id: categoryId, vendorId });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found for this vendor",
      });
    }

    // ─── Prepare item data ─────────────────────────────
    const itemData = {
      vendorId,
      categoryId,
      name: name.trim(),
      description: description?.trim() || "",
      price: parseFloat(price),
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      preparationTime: preparationTime || 10,
      sortOrder: sortOrder || 0,
      image: req.file ? `/uploads/vendors/menu/${req.file.filename}` : "",
    };

    const item = new MenuItem(itemData);
    await item.save();

    res.status(201).json({
      success: true,
      message: "Menu item added successfully",
      data: { item },
    });
  } catch (error) {
    console.error("Add menu item error:", error);
    // Handle duplicate key or other DB errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Item with this name already exists",
      });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Update menu item (protected) ─────────────────────────
export const updateMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const vendorId = req.vendor._id;

    const item = await MenuItem.findOne({ _id: itemId, vendorId });
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    const updates = { ...req.body };
    if (req.file) {
      updates.image = `/uploads/vendors/menu/${req.file.filename}`;
    }
    // Remove fields that shouldn't be updated
    delete updates._id;
    delete updates.vendorId;

    const updated = await MenuItem.findByIdAndUpdate(itemId, updates, {
      new: true,
    });
    res.status(200).json({
      success: true,
      message: "Item updated successfully",
      data: { item: updated },
    });
  } catch (error) {
    console.error("Update menu item error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Delete menu item (protected) ─────────────────────────
export const deleteMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const vendorId = req.vendor._id;

    const item = await MenuItem.findOne({ _id: itemId, vendorId });
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    await item.deleteOne();
    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Delete menu item error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
