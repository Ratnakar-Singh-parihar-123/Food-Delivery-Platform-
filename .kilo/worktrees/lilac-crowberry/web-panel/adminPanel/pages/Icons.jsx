import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useAdmin } from "../../src/context/AdminContext";
import {
  getIcons,
  createIcon,
  updateIcon,
  deleteIcon,
} from "../../src/api/iconApi";

// ─── Helper: Build full image URL ──────────────────────────
const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  // ✅ Use VITE_STATIC_BASE
  const baseUrl = import.meta.env.VITE_STATIC_BASE || "http://localhost:9000";
  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${baseUrl}${path}`;
};

export default function CategoryIcons() {
  const { vendor } = useAdmin();
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIcon, setEditingIcon] = useState(null);
  const [formData, setFormData] = useState({ name: "", label: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const fetchIcons = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getIcons();
      console.log("📦 Fetched icons response:", response);
      setIcons(response.data.icons || []);
    } catch (err) {
      console.error("❌ Failed to fetch icons:", err);
      setError(err?.response?.data?.message || "Failed to load icons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIcons();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    const trimmedLabel = formData.label.trim();
    if (!trimmedName || !trimmedLabel) {
      alert("Please fill in both fields.");
      return;
    }
    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", trimmedName);
      formDataToSend.append("label", trimmedLabel);
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }
      let response;
      if (editingIcon) {
        response = await updateIcon(editingIcon._id, formDataToSend);
      } else {
        response = await createIcon(formDataToSend);
      }
      console.log("📸 Create/Update response:", response);
      if (response.success) {
        await fetchIcons();
        setModalOpen(false);
        setEditingIcon(null);
        setFormData({ name: "", label: "" });
        setImageFile(null);
        setImagePreview("");
      } else {
        alert(response.message || "Operation failed");
      }
    } catch (err) {
      console.error("❌ Submit error:", err);
      alert(err?.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this icon? This action cannot be undone."))
      return;
    setDeleteLoading(id);
    try {
      const response = await deleteIcon(id);
      if (response.success) await fetchIcons();
      else alert(response.message || "Delete failed");
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    } finally {
      setDeleteLoading(null);
    }
  };

  const filtered = icons.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.label.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderCircle className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
        <AlertCircle className="w-12 h-12 mb-3" />
        <p className="text-lg font-semibold">{error}</p>
        <button
          onClick={fetchIcons}
          className="px-6 py-2 mt-4 text-sm font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="px-4 py-6 mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Icons</h1>
          <p className="text-sm text-gray-400">
            Manage your custom category icons
          </p>
        </div>
        <button
          onClick={() => {
            setEditingIcon(null);
            setFormData({ name: "", label: "" });
            setImageFile(null);
            setImagePreview("");
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Icon
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search icons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full py-2.5 pl-10 pr-4 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
        {filtered.map((icon) => {
          const imageUrl = buildImageUrl(icon.image);
          const isDeleting = deleteLoading === icon._id;
          // Debug: log the image URL
          console.log(`🖼️ Icon ${icon.label} – image URL:`, imageUrl);
          return (
            <motion.div
              key={icon._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="relative p-4 text-center transition-all bg-white border border-gray-200 shadow-sm rounded-2xl hover:shadow-md hover:border-orange-200"
            >
              <div className="flex items-center justify-center h-12 mb-2">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={icon.label}
                    className="object-contain w-8 h-8"
                    onError={(e) => {
                      console.error(`❌ Image failed to load: ${imageUrl}`);
                      e.target.onerror = null; // prevent infinite loop
                      e.target.style.display = "none"; // hide broken image
                      // Show fallback icon
                      const parent = e.target.parentNode;
                      const fallback = document.createElement("div");
                      fallback.className = "w-8 h-8 text-gray-400";
                      fallback.innerHTML =
                        '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>';
                      parent.appendChild(fallback);
                    }}
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="text-sm font-medium text-gray-700 truncate">
                {icon.label}
              </div>
              <div className="flex justify-center gap-2 mt-3">
                <button
                  onClick={() => {
                    setEditingIcon(icon);
                    setFormData({ name: icon.name, label: icon.label });
                    setImageFile(null);
                    setImagePreview(buildImageUrl(icon.image) || "");
                    setModalOpen(true);
                  }}
                  className="p-1.5 text-blue-500 rounded-lg hover:bg-blue-50"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(icon._id)}
                  disabled={isDeleting}
                  className="p-1.5 text-red-400 rounded-lg hover:bg-red-50 disabled:opacity-50"
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
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingIcon ? "Edit Icon" : "Add New Icon"}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 text-gray-400 rounded-lg hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="block mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Icon Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. pizza, coffee (unique identifier)"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="block mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Display Label
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                    placeholder="e.g. Pizza, Coffee"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Icon Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full p-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  {imagePreview && (
                    <div className="flex items-center gap-3 p-2 mt-2 bg-gray-50 rounded-xl">
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="object-contain w-10 h-10"
                        onError={() =>
                          console.error("Preview image failed to load")
                        }
                      />
                      <span className="text-sm text-gray-500">Preview</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 text-sm font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting && (
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                    )}
                    {editingIcon ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
