import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  X,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  LoaderCircle,
  Utensils,
  List,
  ChevronDown,
  Sparkles,
  FolderOpen,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { useVendor } from "../../src/context/VendorContext";
import {
  getVendorItems,
  addVendorItem,
  updateVendorItem,
  deleteVendorItem,
  getVendorCategories,
  addVendorCategory,
  updateVendorCategory,
  deleteVendorCategory,
  getGlobalCategories,
} from "../../src/api/vendorApi";
import { getIcons } from "../../src/api/iconApi";

// ─── Helper: Build full image URL ──────────────────────────
const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const baseUrl = import.meta.env.VITE_STATIC_BASE || "http://localhost:9000";
  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${baseUrl}${path}`;
};

// ─── Helper: Get category icon URL ──────────────────────────
const getCategoryIconUrl = (cat) => {
  if (!cat || !cat.icon) return null;
  if (typeof cat.icon === "string") {
    return buildImageUrl(cat.icon);
  }
  if (cat.icon.image) {
    return buildImageUrl(cat.icon.image);
  }
  return null;
};

// ─── Status Badge ─────────────────────────────────────────────
const StatusBadge = React.memo(({ active }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        active
          ? "border-green-200 bg-green-50 text-green-600"
          : "border-red-200 bg-red-50 text-red-500"
      }`}
    >
      {active ? (
        <CheckCircle className="w-3 h-3" />
      ) : (
        <AlertCircle className="w-3 h-3" />
      )}
      {active ? "Active" : "Inactive"}
    </span>
  );
});
StatusBadge.displayName = "StatusBadge";

// ─── Stat Card ─────────────────────────────────────────────
const StatCard = React.memo(
  ({ label, value, icon: Icon, color = "orange", change, changeType }) => {
    const colorMap = {
      orange: "from-orange-50 to-amber-50 border-orange-200 text-orange-600",
      green: "from-green-50 to-emerald-50 border-green-200 text-green-600",
      red: "from-red-50 to-rose-50 border-red-200 text-red-600",
      purple: "from-purple-50 to-violet-50 border-purple-200 text-purple-600",
      blue: "from-blue-50 to-indigo-50 border-blue-200 text-blue-600",
    };
    const bgClass = colorMap[color] || colorMap.orange;

    return (
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-sm ${bgClass}`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {label}
            </p>
            <p className="mt-0.5 text-2xl font-black text-gray-900">{value}</p>
            {change && (
              <div className="flex items-center gap-1 mt-1 text-xs font-medium">
                {changeType === "up" ? (
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span
                  className={
                    changeType === "up" ? "text-emerald-600" : "text-red-600"
                  }
                >
                  {change}
                </span>
                <span className="text-gray-400">vs last period</span>
              </div>
            )}
          </div>
          <div
            className={`rounded-xl bg-white/60 p-2.5 backdrop-blur-sm ${bgClass.split(" ")[2]}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </motion.div>
    );
  },
);
StatCard.displayName = "StatCard";

// ─── Item Form Modal ──────────────────────────────────────
function ItemFormModal({
  item,
  categories,
  globalCategories,
  icons,
  onClose,
  onSave,
  onManageCategories,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    foodCategory: "",
    price: "",
    image: null,
    isAvailable: true,
    preparationTime: 10,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        description: item.description || "",
        categoryId: item.categoryId?._id || item.categoryId || "",
        foodCategory: item.foodCategory?._id || item.foodCategory || "",
        price: item.price?.toString() || "",
        image: null,
        isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
        preparationTime: item.preparationTime || 10,
      });
      setImagePreview(item.image ? buildImageUrl(item.image) : "");
    } else {
      setFormData({
        name: "",
        description: "",
        categoryId: "",
        foodCategory: "",
        price: "",
        image: null,
        isAvailable: true,
        preparationTime: 10,
      });
      setImagePreview("");
    }
  }, [item]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.categoryId) {
      alert("Please fill all required fields.");
      return;
    }
    if (!formData.foodCategory) {
      alert("Please select a global category.");
      return;
    }
    setLoading(true);

    const submitData = new FormData();
    submitData.append("name", formData.name.trim());
    submitData.append("description", formData.description.trim());
    submitData.append("categoryId", formData.categoryId);
    submitData.append("foodCategory", formData.foodCategory);
    submitData.append("price", parseFloat(formData.price));
    submitData.append("isAvailable", formData.isAvailable);
    submitData.append("preparationTime", formData.preparationTime || 10);
    if (formData.image instanceof File) {
      submitData.append("image", formData.image);
    }

    onSave(submitData).finally(() => {
      setLoading(false);
      onClose();
    });
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview("");
  };

  const selectedCategory = categories.find(
    (c) => c._id === formData.categoryId,
  );
  const selectedCategoryIcon = selectedCategory
    ? getCategoryIconUrl(selectedCategory)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur-md border border-white/30"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-gray-100 p-1.5 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 text-orange-500 bg-orange-100 rounded-full">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">
              {item ? "Edit Menu Item" : "Add New Item"}
            </h2>
            <p className="text-xs text-gray-400">
              {item ? "Update item details" : "Create a new menu item"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              Item Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Butter Chicken"
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              placeholder="Brief description..."
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {/* Vendor Category Dropdown */}
          <div>
            <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              Vendor Category *
            </label>
            <div className="relative mt-1" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className={`flex w-full items-center justify-between rounded-xl border bg-white px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                  selectedCategory ? "border-gray-300" : "border-gray-200"
                }`}
              >
                <span className="flex items-center gap-2">
                  {selectedCategoryIcon && (
                    <img
                      src={selectedCategoryIcon}
                      alt=""
                      className="object-contain w-5 h-5"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  )}
                  <span
                    className={
                      selectedCategory ? "text-gray-900" : "text-gray-400"
                    }
                  >
                    {selectedCategory
                      ? selectedCategory.name
                      : "Select a category"}
                  </span>
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {isCategoryOpen && (
                <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-200 shadow-xl max-h-60 rounded-xl">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm">
                    <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                      Categories
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCategoryOpen(false);
                        onManageCategories();
                      }}
                      className="text-xs font-bold text-orange-500 hover:underline"
                    >
                      Manage
                    </button>
                  </div>
                  {categories.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400">
                      No categories – add one via "Manage"
                    </div>
                  ) : (
                    categories.map((cat) => {
                      const iconUrl = getCategoryIconUrl(cat);
                      const isSelected = cat._id === formData.categoryId;
                      return (
                        <button
                          key={cat._id}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              categoryId: cat._id,
                            }));
                            setIsCategoryOpen(false);
                          }}
                          className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm text-left transition hover:bg-orange-50 ${
                            isSelected
                              ? "bg-orange-50 text-orange-600"
                              : "text-gray-700"
                          }`}
                        >
                          {iconUrl && (
                            <img
                              src={iconUrl}
                              alt=""
                              className="object-contain w-5 h-5"
                              onError={(e) => (e.target.style.display = "none")}
                            />
                          )}
                          <span>{cat.name}</span>
                          {isSelected && (
                            <CheckCircle className="w-4 h-4 ml-auto text-orange-500" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Global Category Dropdown */}
          <div>
            <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              Global Category *
            </label>
            <select
              value={formData.foodCategory}
              onChange={(e) =>
                setFormData({ ...formData, foodCategory: e.target.value })
              }
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              required
            >
              <option value="">Select a global category</option>
              {globalCategories.map((gc) => (
                <option key={gc._id} value={gc._id}>
                  {gc.icon} {gc.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[10px] text-gray-400">
              This links your item to the main food category shown on the
              customer home screen.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                Prep Time (min)
              </label>
              <input
                type="number"
                name="preparationTime"
                value={formData.preparationTime}
                onChange={handleChange}
                min="1"
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              Image
            </label>
            <div className="flex items-center gap-4 mt-1">
              {imagePreview ? (
                <div className="relative w-16 h-16 overflow-hidden border border-gray-200 rounded-xl">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white shadow-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-16 h-16 text-gray-400 bg-gray-100 rounded-xl">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}
              <label className="px-4 py-2 text-sm font-medium text-gray-600 transition bg-gray-100 cursor-pointer rounded-xl hover:bg-gray-200">
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
            />
            <label className="text-sm font-medium text-gray-700">
              Item is available
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-2.5 text-sm font-bold text-white shadow-sm transition hover:shadow-md disabled:opacity-50"
            >
              {loading && <LoaderCircle className="w-4 h-4 animate-spin" />}
              {item ? "Update" : "Add"} Item
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Category Manager Modal ─────────────────────────────────
function CategoryManagerModal({
  isOpen,
  onClose,
  categories,
  icons,
  onUpdateCategory,
  onDeleteCategory,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [editIconId, setEditIconId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const filtered = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this category? This will also delete all items in it.",
      )
    )
      return;
    setDeleteLoading(id);
    try {
      await onDeleteCategory(id);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditIconId(cat.icon?._id || "");
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      alert("Category name is required");
      return;
    }
    if (!editIconId) {
      alert("Please select an icon");
      return;
    }
    setSubmitting(true);
    try {
      await onUpdateCategory(editingCategory._id, {
        name: editName.trim(),
        icon: editIconId,
      });
      setEditingCategory(null);
      setEditName("");
      setEditIconId("");
    } catch (err) {
      alert("Update failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur-md border border-white/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-gray-900">
              Manage Categories
            </h2>
            <p className="text-sm text-gray-400">
              Create, edit, or delete your menu categories
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 transition bg-gray-100 rounded-full hover:bg-gray-200 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              <FolderOpen className="w-12 h-12 mx-auto text-gray-300" />
              <p className="mt-2 text-sm">No categories found</p>
            </div>
          ) : (
            filtered.map((cat) => {
              const iconUrl = getCategoryIconUrl(cat);
              const isDeleting = deleteLoading === cat._id;
              if (editingCategory && editingCategory._id === cat._id) {
                return (
                  <form
                    key={cat._id}
                    onSubmit={handleUpdateCategory}
                    className="flex flex-wrap items-center gap-2 p-3 border border-orange-200 rounded-xl bg-orange-50/70 backdrop-blur-sm"
                  >
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 min-w-[120px] rounded-xl border border-gray-200 px-3 py-1.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      placeholder="Category name"
                    />
                    <select
                      value={editIconId}
                      onChange={(e) => setEditIconId(e.target.value)}
                      className="min-w-[100px] rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    >
                      <option value="">Select icon</option>
                      {icons.map((icon) => (
                        <option key={icon._id} value={icon._id}>
                          {icon.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-xl bg-orange-500 px-4 py-1.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      className="rounded-xl bg-gray-100 px-4 py-1.5 text-sm font-bold text-gray-600 transition hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </form>
                );
              }
              return (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 transition border rounded-xl border-gray-200/60 bg-white/80 backdrop-blur-sm hover:border-orange-200 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    {iconUrl ? (
                      <img
                        src={iconUrl}
                        alt=""
                        className="object-contain w-6 h-6"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    )}
                    <span className="font-semibold text-gray-900">
                      {cat.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {cat.items ? `${cat.items.length} items` : "0 items"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="rounded-lg p-1.5 text-blue-500 transition hover:bg-blue-50 hover:scale-110"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      disabled={isDeleting}
                      className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 hover:scale-110 disabled:opacity-50"
                      title="Delete"
                    >
                      {isDeleting ? (
                        <LoaderCircle className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function VendorMenu() {
  const { vendor, loading: vendorLoading, isAuthenticated } = useVendor();

  const vendorId = vendor?._id || vendor?.id;

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [globalCategories, setGlobalCategories] = useState([]);
  const [icons, setIcons] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const initialFetchDone = useRef(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // ─── Fetch data ────────────────────────────────────────────
  const fetchData = useCallback(
    async (showLoading = true) => {
      if (!vendorId) {
        setLoading(false);
        setError("Vendor not found. Please login again.");
        return;
      }
      try {
        if (showLoading) setLoading(true);
        else setRefreshing(true);

        const [itemsRes, categoriesRes, iconsRes, globalRes] =
          await Promise.all([
            getVendorItems(vendorId),
            getVendorCategories(vendorId),
            getIcons(),
            getGlobalCategories(),
          ]);

        setItems(itemsRes.data.items || []);
        setCategories(categoriesRes.data.categories || []);
        setIcons(iconsRes.data.icons || []);
        setGlobalCategories(globalRes.data || []);
        setError("");
      } catch (err) {
        console.error("❌ VendorMenu: Failed to fetch data:", err);
        setError(
          err?.response?.data?.message ||
            "Failed to load data. Please try again.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [vendorId],
  );

  useEffect(() => {
    if (!vendorId) {
      setLoading(false);
      setError("Vendor not found. Please login again.");
      return;
    }
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchData(true);
    }
  }, [vendorId, fetchData]);

  // ─── Category CRUD ─────────────────────────────────────────
  const handleAddCategory = async (name, iconId) => {
    if (!vendorId) return;
    try {
      await addVendorCategory(vendorId, { name, icon: iconId });
      await fetchData(false);
    } catch (err) {
      console.error("Failed to add category:", err);
      throw err;
    }
  };

  const handleUpdateCategory = async (categoryId, data) => {
    if (!vendorId) return;
    try {
      await updateVendorCategory(vendorId, categoryId, data);
      await fetchData(false);
    } catch (err) {
      console.error("Failed to update category:", err);
      throw err;
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!vendorId) return;
    try {
      await deleteVendorCategory(vendorId, categoryId);
      await fetchData(false);
    } catch (err) {
      console.error("Failed to delete category:", err);
      throw err;
    }
  };

  // ─── Search filter ─────────────────────────────────────────
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.trim().toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.categoryId?.name || "").toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q),
    );
  }, [items, searchQuery]);

  // ─── Item CRUD ─────────────────────────────────────────────
  const addItem = async (formData) => {
    try {
      await addVendorItem(vendorId, formData);
      await fetchData(false);
    } catch (err) {
      console.error("Failed to add item:", err);
      alert(
        err?.response?.data?.message || "Failed to add item. Please try again.",
      );
      throw err;
    }
  };

  const updateItem = async (itemId, formData) => {
    try {
      await updateVendorItem(vendorId, itemId, formData);
      await fetchData(false);
    } catch (err) {
      console.error("Failed to update item:", err);
      alert(
        err?.response?.data?.message ||
          "Failed to update item. Please try again.",
      );
      throw err;
    }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteVendorItem(vendorId, itemId);
      await fetchData(false);
    } catch (err) {
      console.error("Failed to delete item:", err);
      alert(
        err?.response?.data?.message ||
          "Failed to delete item. Please try again.",
      );
    }
  };

  const toggleActive = async (item) => {
    try {
      const formData = new FormData();
      formData.append("isAvailable", !item.isAvailable);
      await updateVendorItem(vendorId, item._id, formData);
      await fetchData(false);
    } catch (err) {
      console.error("Failed to toggle item status:", err);
      alert(
        err?.response?.data?.message ||
          "Failed to update item status. Please try again.",
      );
    }
  };

  const handleSave = (formData) => {
    if (selectedItem) {
      return updateItem(selectedItem._id, formData);
    } else {
      return addItem(formData);
    }
  };

  const openAddModal = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // ─── Stats ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((i) => i.isAvailable).length;
    const inactive = total - active;
    const uniqueCategories = new Set(
      items.map((i) => i.categoryId?.name || "").filter(Boolean),
    ).size;
    return { total, active, inactive, uniqueCategories };
  }, [items]);

  // ─── Render states ────────────────────────────────────────
  if (vendorLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Utensils className="w-6 h-6 text-orange-500" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !vendor) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-gray-500">
        <AlertCircle className="w-10 h-10 mb-3" />
        <p className="text-lg font-semibold">Vendor not authenticated</p>
        <p className="text-sm">Please login to manage your menu.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Utensils className="w-6 h-6 text-orange-500" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !vendor) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-red-500">
        <AlertCircle className="w-10 h-10 mb-3" />
        <p className="text-lg font-semibold">{error}</p>
        <button
          onClick={() => fetchData(true)}
          className="px-6 py-2 mt-4 text-sm font-bold text-white transition bg-orange-500 rounded-xl hover:bg-orange-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!vendorId) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-gray-500">
        <AlertCircle className="w-10 h-10 mb-3" />
        <p className="text-lg font-semibold">Vendor not authenticated</p>
        <p className="text-sm">Please login to manage your menu.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 mx-auto space-y-6 max-w-7xl sm:px-6">
      {/* ─── Header ─────────────────────────────────────────── */}
      <div className="relative p-6 overflow-hidden shadow-xl rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-500/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Menu Management
            </h1>
            <p className="mt-1 text-sm text-orange-100">
              Manage your restaurant items – add, edit, or remove.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowCategoryManager(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/30 hover:scale-105"
            >
              <List className="w-4 h-4" /> Manage Categories
            </button>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-orange-600 shadow-lg transition hover:scale-105 hover:shadow-xl"
            >
              <Plus className="w-4 h-4" /> Add New Item
            </button>
          </div>
        </div>
      </div>

      {/* ─── Stats ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Items"
          value={stats.total}
          icon={Utensils}
          color="orange"
          change="+8%"
          changeType="up"
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={CheckCircle}
          color="green"
          change="+5%"
          changeType="up"
        />
        <StatCard
          label="Inactive"
          value={stats.inactive}
          icon={AlertCircle}
          color="red"
          change="-2%"
          changeType="down"
        />
        <StatCard
          label="Categories"
          value={stats.uniqueCategories}
          icon={List}
          color="purple"
          change="+3%"
          changeType="up"
        />
      </div>

      {/* ─── Search ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, category, description..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="text-xs text-gray-400">
          {filteredItems.length} items found
        </div>
        {refreshing && (
          <LoaderCircle className="w-4 h-4 text-orange-500 animate-spin" />
        )}
      </div>

      {/* ─── Table ──────────────────────────────────────────── */}
      <div className="overflow-hidden border shadow-lg rounded-3xl border-gray-200/60 bg-white/80 shadow-gray-200/40 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100/80">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100/60">
              <AnimatePresence>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Utensils className="w-12 h-12 text-gray-300" />
                        <p className="mt-2 text-sm font-medium">
                          No items found
                        </p>
                        <p className="text-xs">
                          Try adjusting your search or add a new item.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const imageUrl = buildImageUrl(item.image);
                    const categoryIconUrl = item.categoryId
                      ? getCategoryIconUrl(item.categoryId)
                      : null;
                    return (
                      <motion.tr
                        key={item._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="transition-colors cursor-pointer group hover:bg-orange-50/40"
                        onClick={() => openEditModal(item)}
                      >
                        <td className="px-4 py-3">
                          <div className="w-12 h-12 overflow-hidden border border-gray-200 shadow-sm rounded-xl bg-gray-50">
                            {item.image ? (
                              <img
                                src={imageUrl}
                                alt={item.name}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full text-gray-400">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {item.name}
                            </div>
                            <div className="truncate text-xs text-gray-400 max-w-[200px]">
                              {item.description || ""}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-gray-600">
                            {categoryIconUrl && (
                              <img
                                src={categoryIconUrl}
                                alt=""
                                className="object-contain w-3 h-3"
                                onError={(e) =>
                                  (e.target.style.display = "none")
                                }
                              />
                            )}
                            {item.categoryId?.name || "Uncategorized"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-gray-900">
                            ₹{item.price.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge active={item.isAvailable} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div
                            className="flex items-center justify-end gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => toggleActive(item)}
                              className={`rounded-lg p-1.5 transition-colors ${
                                item.isAvailable
                                  ? "text-green-500 hover:bg-green-50 hover:scale-110"
                                  : "text-gray-400 hover:bg-gray-100 hover:scale-110"
                              }`}
                              title={
                                item.isAvailable ? "Deactivate" : "Activate"
                              }
                            >
                              {item.isAvailable ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => openEditModal(item)}
                              className="rounded-lg p-1.5 text-blue-500 transition hover:bg-blue-50 hover:scale-110"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteItem(item._id)}
                              className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 hover:scale-110"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modals ──────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <ItemFormModal
            item={selectedItem}
            categories={categories}
            globalCategories={globalCategories}
            icons={icons}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedItem(null);
            }}
            onSave={handleSave}
            onManageCategories={() => {
              setIsModalOpen(false);
              setShowCategoryManager(true);
            }}
          />
        )}
        {showCategoryManager && (
          <CategoryManagerModal
            isOpen={showCategoryManager}
            onClose={() => {
              setShowCategoryManager(false);
              fetchData(false);
            }}
            categories={categories}
            icons={icons}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
