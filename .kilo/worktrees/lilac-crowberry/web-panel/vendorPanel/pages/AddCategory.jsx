// AddCategory.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  X,
  Edit,
  Trash2,
  LoaderCircle,
  AlertCircle,
  Image as ImageIcon,
  ArrowLeft,
  Sparkles,
  FolderOpen,
} from "lucide-react";
import Select from "react-select";
import { useVendor } from "../../src/context/VendorContext";
import {
  getVendorCategories,
  addVendorCategory,
  deleteVendorCategory,
  updateVendorCategory,
  getGlobalCategories,
} from "../../src/api/vendorApi";

// ─── Helper: Build full image URL ──────────────────────────
const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const baseUrl = import.meta.env.VITE_STATIC_BASE || "http://localhost:9000";
  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${baseUrl}${path}?t=${Date.now()}`;
};

export default function AddCategory({ onClose, onSuccess }) {
  const { vendor } = useVendor();
  const vendorId = vendor?._id || vendor?.id;

  const [categories, setCategories] = useState([]);
  const [globalCategories, setGlobalCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    globalCategory: "",
  });
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  // ─── Fetch data ──────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!vendorId) return;
    try {
      setLoading(true);
      const [catsRes, globalRes] = await Promise.all([
        getVendorCategories(vendorId),
        getGlobalCategories(),
      ]);
      setCategories(catsRes.data?.categories || []);
      setGlobalCategories(globalRes.data || []);
      setError("");
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Image handlers ──────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setIconPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setIconFile(null);
    setIconPreview(null);
  };

  // ─── Modal handlers ──────────────────────────────────────
  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", globalCategory: "" });
    setIconFile(null);
    setIconPreview(null);
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      globalCategory: cat.globalCategory?._id || cat.globalCategory || "",
    });
    setIconFile(null);
    setIconPreview(cat.icon ? buildImageUrl(cat.icon) : null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", globalCategory: "" });
    setIconFile(null);
    setIconPreview(null);
  };

  // ─── Submit handler ──────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      alert("Category name is required.");
      return;
    }
    if (!formData.globalCategory) {
      alert("Please select a global category.");
      return;
    }

    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", trimmedName);
      formDataToSend.append("globalCategory", formData.globalCategory);
      if (iconFile) {
        formDataToSend.append("iconImage", iconFile);
      }

      let response;
      if (editingCategory) {
        response = await updateVendorCategory(
          vendorId,
          editingCategory._id,
          formDataToSend,
        );
      } else {
        response = await addVendorCategory(vendorId, formDataToSend);
      }

      if (response.success) {
        await fetchData();
        closeModal();
        if (onSuccess) onSuccess();
      } else {
        alert(response.message || "Operation failed");
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert(err?.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete handler ──────────────────────────────────────
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this category? This will also delete all items in it.",
      )
    )
      return;
    setDeleteLoading(id);
    try {
      const response = await deleteVendorCategory(vendorId, id);
      if (response.success) {
        await fetchData();
        if (onSuccess) onSuccess();
      } else {
        alert(response.message || "Delete failed");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    } finally {
      setDeleteLoading(null);
    }
  };

  // ─── Filter categories ──────────────────────────────────
  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  // ─── Select options ──────────────────────────────────────
  const globalCategoryOptions = globalCategories.map((gc) => ({
    value: gc._id,
    label: (
      <div className="flex items-center gap-2">
        {gc.image ? (
          <img
            src={buildImageUrl(gc.image)}
            alt={gc.name}
            className="object-cover w-6 h-6 rounded"
            onError={(e) => (e.target.style.display = "none")}
          />
        ) : (
          <span className="text-lg">{gc.icon || "🍽️"}</span>
        )}
        <span>{gc.name}</span>
      </div>
    ),
    raw: gc,
  }));

  const filterOption = (option, inputValue) => {
    const searchText = inputValue.toLowerCase();
    return option.data.raw.name.toLowerCase().includes(searchText);
  };

  // ─── Custom Select styles ──────────────────────────────
  const selectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: "0.75rem",
      borderColor: "#e5e7eb",
      padding: "2px 4px",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#f97316",
      },
      minHeight: "44px",
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected ? "#f97316" : isFocused ? "#fff7ed" : "white",
      color: isSelected ? "white" : "#1f2937",
      borderRadius: "0.5rem",
      padding: "8px 12px",
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "0.75rem",
      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
      border: "1px solid #e5e7eb",
      padding: "4px",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9ca3af",
    }),
  };

  // ─── Loading state ──────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-orange-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6">
      {/* ─── Header ─────────────────────────────────────────── */}
      <div className="relative p-6 overflow-hidden shadow-xl rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-500/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Manage Categories
            </h1>
            <p className="mt-1 text-sm text-orange-100">
              Create, edit, and delete categories for your menu
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {onClose && (
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/30 hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-orange-600 shadow-lg transition hover:scale-105 hover:shadow-xl"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>
        </div>
      </div>

      {/* ─── Error Banner ──────────────────────────────────── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 mt-4 text-sm text-red-600 border border-red-200 rounded-2xl bg-red-50/80 backdrop-blur-sm"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
          <button
            onClick={() => setError("")}
            className="ml-auto text-xs font-bold text-red-500 hover:text-red-700"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* ─── Search ─────────────────────────────────────────── */}
      <div className="relative mt-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ─── Category Cards ────────────────────────────────── */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 mt-8 text-center border-2 border-gray-200 border-dashed rounded-3xl bg-gray-50/50 backdrop-blur-sm"
        >
          <FolderOpen className="w-16 h-16 text-gray-300" />
          <p className="mt-3 text-lg font-semibold text-gray-700">
            No categories found
          </p>
          <p className="text-sm text-gray-400">
            Create your first category to get started.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 hover:shadow-md"
          >
            + Add Category
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence>
            {filtered.map((cat, index) => {
              const iconUrl = cat.icon ? buildImageUrl(cat.icon) : null;
              const isDeleting = deleteLoading === cat._id;
              return (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05, duration: 0.25 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="relative p-4 transition border shadow-sm group rounded-2xl border-gray-200/60 bg-white/80 backdrop-blur-sm hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100/50"
                >
                  {/* Accent bar */}
                  <div className="absolute top-0 left-0 w-full h-1 transition-opacity opacity-0 rounded-t-2xl bg-gradient-to-r from-orange-500 to-amber-500 group-hover:opacity-100" />

                  <div className="flex items-center gap-3">
                    {iconUrl ? (
                      <img
                        src={iconUrl}
                        alt={cat.name}
                        className="object-contain w-12 h-12 p-1 border border-gray-200 rounded-xl"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl">
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {cat.items?.length || 0} items
                      </p>
                      {cat.globalCategory && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-orange-500">
                          {cat.globalCategory.image ? (
                            <img
                              src={buildImageUrl(cat.globalCategory.image)}
                              alt={cat.globalCategory.name}
                              className="inline-block object-cover w-4 h-4 rounded"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <span>{cat.globalCategory.icon || "🏷️"}</span>
                          )}
                          <span className="truncate">
                            {cat.globalCategory.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end gap-1.5 border-t border-gray-100/80 pt-3">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="rounded-lg p-1.5 text-blue-500 transition hover:bg-blue-50 hover:scale-110"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      disabled={isDeleting}
                      className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 hover:scale-110 disabled:opacity-50"
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
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ─── Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-full max-w-md p-6 border shadow-2xl rounded-3xl bg-white/95 backdrop-blur-md border-white/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    {editingCategory ? "Edit Category" : "Add Category"}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {editingCategory
                      ? "Update your category details"
                      : "Create a new category for your menu"}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 transition bg-gray-100 rounded-full hover:bg-gray-200 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Name */}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Pizzas, Burgers"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    required
                  />
                </div>

                {/* Global Category Dropdown */}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Global Category *
                  </label>
                  <Select
                    options={globalCategoryOptions}
                    value={
                      formData.globalCategory
                        ? globalCategoryOptions.find(
                            (opt) => opt.value === formData.globalCategory,
                          )
                        : null
                    }
                    onChange={(selected) =>
                      setFormData({
                        ...formData,
                        globalCategory: selected ? selected.value : "",
                      })
                    }
                    placeholder="Select a global category"
                    isClearable
                    filterOption={filterOption}
                    styles={selectStyles}
                    className="mt-1"
                    classNamePrefix="react-select"
                  />
                  <p className="mt-1 text-[10px] text-gray-400">
                    This links your category to the main food category shown on
                    the customer home screen.
                  </p>
                </div>

                {/* Icon Image */}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Icon Image
                  </label>
                  <div className="flex items-center gap-4 mt-1">
                    {iconPreview ? (
                      <div className="relative w-16 h-16 overflow-hidden border border-gray-200 rounded-xl">
                        <img
                          src={iconPreview}
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

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-2.5 text-sm font-bold text-white shadow-sm transition hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting && (
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                    )}
                    {editingCategory ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
