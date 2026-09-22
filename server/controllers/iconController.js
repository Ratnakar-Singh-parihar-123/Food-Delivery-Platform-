import CategoryIcon from "../models/icons.js";

// ─── Get all icons ──────────────────────────────────────────
export const getIcons = async (req, res) => {
  try {
    const icons = await CategoryIcon.find({ isActive: true }).sort("name");
    res.status(200).json({ success: true, data: { icons } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Create new icon ────────────────────────────────────────
export const createIcon = async (req, res) => {
  try {
    const { name, label } = req.body;
    if (!name || !label) {
      return res
        .status(400)
        .json({ success: false, message: "Name and label are required" });
    }
    // ✅ Save image path if file exists
    const imagePath = req.file ? `/uploads/icons/${req.file.filename}` : "";
    const icon = new CategoryIcon({ name, label, image: imagePath });
    await icon.save();
    res.status(201).json({ success: true, data: { icon } });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Icon name already exists" });
    }
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// ─── Update icon ────────────────────────────────────────────
export const updateIcon = async (req, res) => {
  try {
    const { iconId } = req.params;
    const { name, label, isActive } = req.body;
    const icon = await CategoryIcon.findById(iconId);
    if (!icon)
      return res
        .status(404)
        .json({ success: false, message: "Icon not found" });
    if (name) icon.name = name;
    if (label) icon.label = label;
    if (isActive !== undefined) icon.isActive = isActive;
    if (req.file) icon.image = `/uploads/icons/${req.file.filename}`;
    await icon.save();
    res.status(200).json({ success: true, data: { icon } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Delete icon ────────────────────────────────────────────
export const deleteIcon = async (req, res) => {
  try {
    const { iconId } = req.params;
    const icon = await CategoryIcon.findById(iconId);
    if (!icon) {
      return res
        .status(404)
        .json({ success: false, message: "Icon not found" });
    }
    await icon.deleteOne();
    res.status(200).json({ success: true, message: "Icon deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
