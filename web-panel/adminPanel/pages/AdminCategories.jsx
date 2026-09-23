// // pages/AdminCategories.js
// import React, { useState, useEffect, useCallback, useRef } from "react";
// import {
//   Plus,
//   Search,
//   X,
//   Edit,
//   Trash2,
//   ChevronLeft,
//   ChevronRight,
//   AlertCircle,
//   CheckCircle,
//   Image as ImageIcon,
// } from "lucide-react";
// import {
//   getFoodCategories,
//   createFoodCategory,
//   updateFoodCategory,
//   deleteFoodCategory,
// } from "../../src/api/adminApi";

// // ─── Icon dropdown options ──────────────────────────────────
// const ICON_OPTIONS = [
//   { value: "🍕", label: "🍕 Pizza" },
//   { value: "🍔", label: "🍔 Burger" },
//   { value: "🌮", label: "🌮 Taco" },
//   { value: "🥗", label: "🥗 Salad" },
//   { value: "🍣", label: "🍣 Sushi" },
//   { value: "🍜", label: "🍜 Noodles" },
//   { value: "🍰", label: "🍰 Cake" },
//   { value: "🧁", label: "🧁 Cupcake" },
//   { value: "🍦", label: "🍦 Ice Cream" },
//   { value: "☕", label: "☕ Coffee" },
//   { value: "🍵", label: "🍵 Tea" },
//   { value: "🍷", label: "🍷 Wine" },
//   { value: "🍺", label: "🍺 Beer" },
//   { value: "🍚", label: "🍚 Rice" },
//   { value: "🍱", label: "🍱 Bento" },
//   { value: "🥘", label: "🥘 Paella" },
//   { value: "🌭", label: "🌭 Hot Dog" },
//   { value: "🥪", label: "🥪 Sandwich" },
//   { value: "🥙", label: "🥙 Wrap" },
//   { value: "🧆", label: "🧆 Falafel" },
//   { value: "🥮", label: "🥮 Mooncake" },
//   { value: "🍡", label: "🍡 Dango" },
//   { value: "🍢", label: "🍢 Oden" },
//   { value: "🍥", label: "🍥 Fish Cake" },
//   { value: "🍨", label: "🍨 Sundae" },
//   { value: "🍩", label: "🍩 Donut" },
//   { value: "🍪", label: "🍪 Cookie" },
//   { value: "🥨", label: "🥨 Pretzel" },
//   { value: "🥖", label: "🥖 Baguette" },
//   { value: "🥐", label: "🥐 Croissant" },
//   { value: "🧇", label: "🧇 Waffle" },
//   { value: "🥞", label: "🥞 Pancake" },
// ];

// export default function AdminCategories() {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [modal, setModal] = useState({ open: false, editing: null });
//   const [form, setForm] = useState({
//     name: "",
//     icon: "🍕",
//     image: null, // File object
//     imagePreview: null, // for preview
//     displayOrder: 0,
//     isActive: true,
//   });
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");
//   const fileInputRef = useRef(null);

//   const limit = 8;

//   // ─── Fetch categories ──────────────────────────────────────
//   const fetchCategories = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await getFoodCategories({
//         page: currentPage,
//         limit,
//         search: searchTerm,
//       });
//       setCategories(res.data || []);
//       setTotalPages(res.totalPages || 1);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to load categories");
//     } finally {
//       setLoading(false);
//     }
//   }, [currentPage, searchTerm]);

//   useEffect(() => {
//     fetchCategories();
//   }, [fetchCategories]);

//   // ─── Form handlers ──────────────────────────────────────
//   const resetForm = () => {
//     setForm({
//       name: "",
//       icon: "🍕",
//       image: null,
//       imagePreview: null,
//       displayOrder: 0,
//       isActive: true,
//     });
//     setModal({ open: false, editing: null });
//     setError("");
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   const openCreateModal = () => {
//     resetForm();
//     setModal({ open: true, editing: null });
//   };

//   const openEditModal = (category) => {
//     setForm({
//       name: category.name,
//       icon: category.icon || "🍕",
//       image: null,
//       imagePreview: category.image || null,
//       displayOrder: category.displayOrder || 0,
//       isActive: category.isActive !== undefined ? category.isActive : true,
//     });
//     setModal({ open: true, editing: category });
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setForm((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleIconSelect = (e) => {
//     setForm((prev) => ({ ...prev, icon: e.target.value }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
//     if (!allowedTypes.includes(file.type)) {
//       setError("Only JPG, PNG, and WEBP images are allowed");
//       return;
//     }
//     if (file.size > 2 * 1024 * 1024) {
//       setError("Image size must be less than 2MB");
//       return;
//     }
//     setForm((prev) => ({
//       ...prev,
//       image: file,
//       imagePreview: URL.createObjectURL(file),
//     }));
//     setError("");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.name.trim()) {
//       setError("Category name is required");
//       return;
//     }
//     try {
//       setSubmitting(true);
//       const formData = new FormData();
//       formData.append("name", form.name.trim());
//       formData.append("icon", form.icon);
//       formData.append("displayOrder", String(form.displayOrder));
//       formData.append("isActive", String(form.isActive));
//       if (form.image) {
//         formData.append("image", form.image);
//       }
//       if (modal.editing) {
//         await updateFoodCategory(modal.editing._id, formData);
//       } else {
//         await createFoodCategory(formData);
//       }
//       fetchCategories();
//       resetForm();
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to save category");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this category permanently?")) return;
//     try {
//       await deleteFoodCategory(id);
//       fetchCategories();
//     } catch (err) {
//       alert("Delete failed: " + (err.response?.data?.message || err.message));
//     }
//   };

//   // ─── Helper to get full image URL ──────────────────────
//   const getImageUrl = (path) => {
//     if (!path) return null;
//     if (path.startsWith("http")) return path;
//     const base = import.meta.env.VITE_STATIC_BASE || "http://localhost:9000";
//     return `${base}${path}`;
//   };

//   // ─── Loading skeleton ──────────────────────────────────
//   if (loading && categories.length === 0) {
//     return (
//       <div className="flex items-center justify-center min-h-screen p-6">
//         <div className="w-8 h-8 border-2 border-orange-500 rounded-full border-t-transparent animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 mx-auto max-w-7xl">
//       {/* ─── Header ───────────────────────────────────────── */}
//       <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">Food Categories</h1>
//           <p className="text-sm text-gray-500">
//             Manage categories shown in the "What's on your mind?" section
//           </p>
//         </div>
//         <button
//           onClick={openCreateModal}
//           className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white transition bg-orange-500 rounded-lg shadow-sm hover:bg-orange-600"
//         >
//           <Plus className="w-4 h-4" /> Add Category
//         </button>
//       </div>

//       {/* ─── Search ───────────────────────────────────────── */}
//       <div className="flex flex-wrap items-center gap-3 mb-4">
//         <div className="relative flex-1 min-w-[200px]">
//           <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
//           <input
//             type="text"
//             value={searchTerm}
//             onChange={(e) => {
//               setSearchTerm(e.target.value);
//               setCurrentPage(1);
//             }}
//             placeholder="Search by name..."
//             className="w-full py-2 pr-4 text-sm border border-gray-200 rounded-lg pl-9 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//           />
//           {searchTerm && (
//             <button
//               onClick={() => setSearchTerm("")}
//               className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
//             >
//               <X className="w-4 h-4" />
//             </button>
//           )}
//         </div>
//         <span className="text-sm text-gray-500 whitespace-nowrap">
//           {categories.length} categories
//         </span>
//       </div>

//       {/* ─── Table ─────────────────────────────────────────── */}
//       <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50/80">
//               <tr>
//                 <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-500 uppercase">
//                   Icon
//                 </th>
//                 <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-500 uppercase">
//                   Image
//                 </th>
//                 <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-500 uppercase">
//                   Name
//                 </th>
//                 <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-500 uppercase">
//                   Order
//                 </th>
//                 <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-500 uppercase">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-xs font-bold tracking-wider text-right text-gray-500 uppercase">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-100">
//               {categories.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan="6"
//                     className="px-6 py-12 text-center text-gray-400"
//                   >
//                     <div className="flex flex-col items-center">
//                       <AlertCircle className="w-12 h-12 text-gray-300" />
//                       <p className="mt-2 text-sm">No categories found</p>
//                       <button
//                         onClick={openCreateModal}
//                         className="mt-2 text-sm font-medium text-orange-500 hover:text-orange-600"
//                       >
//                         Create your first category →
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 categories.map((cat) => (
//                   <tr
//                     key={cat._id}
//                     className="transition-colors hover:bg-gray-50/50"
//                   >
//                     <td className="px-6 py-4 text-2xl">{cat.icon || "🍽️"}</td>
//                     <td className="px-6 py-4">
//                       {cat.image ? (
//                         <img
//                           src={getImageUrl(cat.image)}
//                           alt={cat.name}
//                           className="object-cover w-12 h-12 border border-gray-200 rounded-lg"
//                         />
//                       ) : (
//                         <div className="flex items-center justify-center w-12 h-12 text-gray-400 bg-gray-100 rounded-lg">
//                           <ImageIcon className="w-6 h-6" />
//                         </div>
//                       )}
//                     </td>
//                     <td className="px-6 py-4 font-medium text-gray-900">
//                       {cat.name}
//                     </td>
//                     <td className="px-6 py-4 text-gray-600">
//                       {cat.displayOrder || 0}
//                     </td>
//                     <td className="px-6 py-4">
//                       <span
//                         className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
//                           cat.isActive
//                             ? "bg-green-100 text-green-700"
//                             : "bg-red-100 text-red-700"
//                         }`}
//                       >
//                         {cat.isActive ? (
//                           <CheckCircle className="w-3 h-3" />
//                         ) : (
//                           <AlertCircle className="w-3 h-3" />
//                         )}
//                         {cat.isActive ? "Active" : "Inactive"}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 space-x-3 text-right">
//                       <button
//                         onClick={() => openEditModal(cat)}
//                         className="text-blue-500 transition hover:text-blue-700"
//                         title="Edit"
//                       >
//                         <Edit className="w-4 h-4" />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(cat._id)}
//                         className="text-red-400 transition hover:text-red-600"
//                         title="Delete"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* ─── Pagination ────────────────────────────────────── */}
//       {totalPages > 1 && (
//         <div className="flex items-center justify-between gap-4 mt-4">
//           <button
//             onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//             disabled={currentPage === 1}
//             className="inline-flex items-center gap-1 px-3 py-1 text-sm text-gray-600 border border-gray-200 rounded-lg disabled:opacity-50"
//           >
//             <ChevronLeft className="w-4 h-4" /> Previous
//           </button>
//           <span className="text-sm text-gray-500">
//             Page {currentPage} of {totalPages}
//           </span>
//           <button
//             onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//             disabled={currentPage === totalPages}
//             className="inline-flex items-center gap-1 px-3 py-1 text-sm text-gray-600 border border-gray-200 rounded-lg disabled:opacity-50"
//           >
//             Next <ChevronRight className="w-4 h-4" />
//           </button>
//         </div>
//       )}

//       {/* ─── Modal ──────────────────────────────────────────── */}
//       {modal.open && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
//           onClick={() => resetForm()}
//         >
//           <div
//             className="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold text-gray-800">
//                 {modal.editing ? "Edit Category" : "Add Category"}
//               </h2>
//               <button
//                 onClick={resetForm}
//                 className="p-1 text-gray-400 transition hover:text-gray-600"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Name *
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={form.name}
//                   onChange={handleChange}
//                   placeholder="e.g. Pizza"
//                   className="w-full px-3 py-2 mt-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Icon (emoji)
//                 </label>
//                 <select
//                   name="icon"
//                   value={form.icon}
//                   onChange={handleIconSelect}
//                   className="w-full px-3 py-2 mt-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//                 >
//                   {ICON_OPTIONS.map((opt) => (
//                     <option key={opt.value} value={opt.value}>
//                       {opt.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Image (category thumbnail)
//                 </label>
//                 <div className="flex items-center gap-3 mt-1">
//                   <button
//                     type="button"
//                     onClick={() => fileInputRef.current?.click()}
//                     className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
//                   >
//                     Choose File
//                   </button>
//                   <span className="text-sm text-gray-500">
//                     {form.image ? form.image.name : "No file chosen"}
//                   </span>
//                 </div>
//                 <input
//                   type="file"
//                   ref={fileInputRef}
//                   accept="image/*"
//                   onChange={handleFileChange}
//                   className="hidden"
//                 />
//                 {form.imagePreview && (
//                   <div className="mt-2">
//                     <img
//                       src={form.imagePreview}
//                       alt="Preview"
//                       className="object-cover w-20 h-20 border border-gray-200 rounded-lg"
//                     />
//                   </div>
//                 )}
//                 {form.imagePreview && modal.editing && !form.image && (
//                   <p className="mt-1 text-xs text-gray-400">
//                     Current image (unchanged)
//                   </p>
//                 )}
//               </div>

//               <div className="flex gap-4">
//                 <div className="flex-1">
//                   <label className="block text-sm font-medium text-gray-700">
//                     Display Order
//                   </label>
//                   <input
//                     type="number"
//                     name="displayOrder"
//                     value={form.displayOrder}
//                     onChange={handleChange}
//                     min="0"
//                     className="w-full px-3 py-2 mt-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//                   />
//                 </div>
//                 <div className="flex items-center mt-6">
//                   <input
//                     type="checkbox"
//                     name="isActive"
//                     checked={form.isActive}
//                     onChange={handleChange}
//                     className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
//                   />
//                   <label className="ml-2 text-sm text-gray-700">Active</label>
//                 </div>
//               </div>

//               {error && (
//                 <div className="px-3 py-2 text-sm text-red-600 rounded-lg bg-red-50">
//                   {error}
//                 </div>
//               )}

//               <div className="flex justify-end gap-3 pt-2">
//                 <button
//                   type="button"
//                   onClick={resetForm}
//                   className="px-4 py-2 text-sm font-medium text-gray-600 transition bg-gray-100 rounded-lg hover:bg-gray-200"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={submitting}
//                   className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white transition bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50"
//                 >
//                   {submitting && (
//                     <span className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
//                   )}
//                   {modal.editing ? "Update" : "Create"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// pages/AdminCategories.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  X,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  TrendingUp,
  TrendingDown,
  Store,
  Package,
  Eye,
  Clock,
} from "lucide-react";
import {
  getFoodCategories,
  createFoodCategory,
  updateFoodCategory,
  deleteFoodCategory,
} from "../../src/api/adminApi";

// ─── Icon dropdown options ──────────────────────────────────
const ICON_OPTIONS = [
  { value: "🍕", label: "🍕 Pizza" },
  { value: "🍔", label: "🍔 Burger" },
  { value: "🌮", label: "🌮 Taco" },
  { value: "🥗", label: "🥗 Salad" },
  { value: "🍣", label: "🍣 Sushi" },
  { value: "🍜", label: "🍜 Noodles" },
  { value: "🍰", label: "🍰 Cake" },
  { value: "🧁", label: "🧁 Cupcake" },
  { value: "🍦", label: "🍦 Ice Cream" },
  { value: "☕", label: "☕ Coffee" },
  { value: "🍵", label: "🍵 Tea" },
  { value: "🍷", label: "🍷 Wine" },
  { value: "🍺", label: "🍺 Beer" },
  { value: "🍚", label: "🍚 Rice" },
  { value: "🍱", label: "🍱 Bento" },
  { value: "🥘", label: "🥘 Paella" },
  { value: "🌭", label: "🌭 Hot Dog" },
  { value: "🥪", label: "🥪 Sandwich" },
  { value: "🥙", label: "🥙 Wrap" },
  { value: "🧆", label: "🧆 Falafel" },
  { value: "🥮", label: "🥮 Mooncake" },
  { value: "🍡", label: "🍡 Dango" },
  { value: "🍢", label: "🍢 Oden" },
  { value: "🍥", label: "🍥 Fish Cake" },
  { value: "🍨", label: "🍨 Sundae" },
  { value: "🍩", label: "🍩 Donut" },
  { value: "🍪", label: "🍪 Cookie" },
  { value: "🥨", label: "🥨 Pretzel" },
  { value: "🥖", label: "🥖 Baguette" },
  { value: "🥐", label: "🥐 Croissant" },
  { value: "🧇", label: "🧇 Waffle" },
  { value: "🥞", label: "🥞 Pancake" },
];

// ─── Stat Card Component ────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, change, changeType }) {
  const gradientMap = {
    gray: "from-gray-50 to-gray-100 border-gray-200",
    amber: "from-amber-50 to-amber-100 border-amber-200",
    purple: "from-purple-50 to-purple-100 border-purple-200",
    green: "from-green-50 to-green-100 border-green-200",
    emerald: "from-emerald-50 to-emerald-100 border-emerald-200",
    red: "from-red-50 to-red-100 border-red-200",
    blue: "from-blue-50 to-blue-100 border-blue-200",
    orange: "from-orange-50 to-orange-100 border-orange-200",
  };
  const colorMap = {
    gray: "text-gray-600",
    amber: "text-amber-600",
    purple: "text-purple-600",
    green: "text-green-600",
    emerald: "text-emerald-600",
    red: "text-red-600",
    blue: "text-blue-600",
    orange: "text-orange-600",
  };
  const bg = gradientMap[color] || gradientMap.gray;
  const textColor = colorMap[color] || colorMap.gray;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-sm ${bg}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
            {label}
          </p>
          <p className="mt-1 text-2xl font-black text-gray-900">{value}</p>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 backdrop-blur-sm ${textColor}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {change && (
        <div className="flex items-center gap-1 mt-2 text-xs font-medium">
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
    </motion.div>
  );
}

// ─── Category Detail Modal ──────────────────────────────────
function CategoryDetailModal({ category, onClose }) {
  if (!category) return null;

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const base = import.meta.env.VITE_STATIC_BASE || "http://localhost:9000";
    return `${base}${path}`;
  };

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
        className="relative w-full max-w-md p-6 border shadow-2xl rounded-3xl bg-white/95 backdrop-blur-md border-white/30"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute z-10 p-2 text-gray-400 transition rounded-full shadow-sm top-4 right-4 bg-white/80 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="relative">
            {category.image ? (
              <img
                src={getImageUrl(category.image)}
                alt={category.name}
                className="object-cover w-24 h-24 border-2 border-orange-200 shadow-md rounded-2xl"
              />
            ) : (
              <div className="flex items-center justify-center w-24 h-24 bg-orange-100 rounded-2xl">
                <Store className="w-12 h-12 text-orange-500" />
              </div>
            )}
            <div className="absolute p-1 bg-white rounded-full shadow-md -bottom-2 -right-2">
              <span className="text-2xl">{category.icon || "🍽️"}</span>
            </div>
          </div>
          <h2 className="mt-4 text-2xl font-black text-gray-900">
            {category.name}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {category.description || "No description provided"}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                category.isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  category.isActive ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
              {category.isActive ? "Active" : "Inactive"}
            </span>
            <span className="text-xs text-gray-400">
              Order #{category.displayOrder || 0}
            </span>
          </div>
          {category.createdAt && (
            <p className="mt-2 text-xs text-gray-400">
              Created: {new Date(category.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState({ open: false, editing: null });
  const [form, setForm] = useState({
    name: "",
    icon: "🍕",
    description: "",
    image: null,
    imagePreview: null,
    displayOrder: 0,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const limit = 8;

  // ─── Fetch categories ──────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getFoodCategories({
        page: currentPage,
        limit,
        search: searchTerm,
      });
      setCategories(res.data || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ─── Stats ──────────────────────────────────────────────
  const stats = {
    total: categories.length,
    active: categories.filter((c) => c.isActive).length,
    inactive: categories.filter((c) => !c.isActive).length,
  };

  // ─── Form handlers ──────────────────────────────────────
  const resetForm = () => {
    setForm({
      name: "",
      icon: "🍕",
      description: "",
      image: null,
      imagePreview: null,
      displayOrder: 0,
      isActive: true,
    });
    setModal({ open: false, editing: null });
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openCreateModal = () => {
    resetForm();
    setModal({ open: true, editing: null });
  };

  const openEditModal = (category) => {
    setForm({
      name: category.name,
      icon: category.icon || "🍕",
      description: category.description || "",
      image: null,
      imagePreview: category.image || null,
      displayOrder: category.displayOrder || 0,
      isActive: category.isActive !== undefined ? category.isActive : true,
    });
    setModal({ open: true, editing: category });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleIconSelect = (e) => {
    setForm((prev) => ({ ...prev, icon: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, and WEBP images are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2MB");
      return;
    }
    setForm((prev) => ({
      ...prev,
      image: file,
      imagePreview: URL.createObjectURL(file),
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Category name is required");
      return;
    }
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("icon", form.icon);
      formData.append("description", form.description.trim() || "");
      formData.append("displayOrder", String(form.displayOrder));
      formData.append("isActive", String(form.isActive));
      if (form.image) {
        formData.append("image", form.image);
      }
      if (modal.editing) {
        await updateFoodCategory(modal.editing._id, formData);
      } else {
        await createFoodCategory(formData);
      }
      fetchCategories();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this category permanently?")) return;
    try {
      await deleteFoodCategory(id);
      fetchCategories();
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleRowClick = (category) => {
    setSelectedCategory(category);
    setDetailModalOpen(true);
  };

  // ─── Helper to get full image URL ──────────────────────
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const base = import.meta.env.VITE_STATIC_BASE || "http://localhost:9000";
    return `${base}${path}`;
  };

  // ─── Loading skeleton ──────────────────────────────────
  if (loading && categories.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Store className="w-6 h-6 text-orange-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 mx-auto max-w-7xl sm:p-6">
      {/* ─── Header ───────────────────────────────────────── */}
      <div className="relative p-6 mb-6 overflow-hidden shadow-xl rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-500/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Food Categories
            </h1>
            <p className="mt-1 text-sm text-orange-100">
              Manage categories shown in the "What's on your mind?" section
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/30 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>
      </div>

      {/* ─── Stats Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-6 sm:gap-4">
        <StatCard
          label="Total Categories"
          value={stats.total}
          icon={Store}
          color="gray"
          change="+12%"
          changeType="up"
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={CheckCircle}
          color="emerald"
          change="+8%"
          changeType="up"
        />
        <StatCard
          label="Inactive"
          value={stats.inactive}
          icon={AlertCircle}
          color="red"
          change="-3%"
          changeType="down"
        />
      </div>

      {/* ─── Search ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name..."
            className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <span className="text-sm text-gray-400 whitespace-nowrap">
          {categories.length} categories
        </span>
      </div>

      {/* ─── Table ─────────────────────────────────────────── */}
      <div className="overflow-hidden border shadow-lg rounded-3xl border-gray-200/60 bg-white/80 backdrop-blur-sm shadow-gray-200/40">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100/80">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Icon
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Order
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
                {categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-12 text-center text-gray-400"
                    >
                      <div className="flex flex-col items-center">
                        <AlertCircle className="w-12 h-12 text-gray-300" />
                        <p className="mt-2 text-sm">No categories found</p>
                        <button
                          onClick={openCreateModal}
                          className="mt-2 text-sm font-medium text-orange-500 hover:underline"
                        >
                          Create your first category →
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  categories.map((cat, index) => (
                    <motion.tr
                      key={cat._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ delay: index * 0.04, duration: 0.2 }}
                      className="transition-colors cursor-pointer group hover:bg-orange-50/40"
                      onClick={() => handleRowClick(cat)}
                    >
                      <td className="px-4 py-3 text-2xl">{cat.icon || "🍽️"}</td>
                      <td className="px-4 py-3">
                        {cat.image ? (
                          <img
                            src={getImageUrl(cat.image)}
                            alt={cat.name}
                            className="object-cover w-12 h-12 border border-gray-200 shadow-sm rounded-xl"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-12 h-12 text-gray-400 bg-gray-100 rounded-xl">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {cat.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium">
                          #{cat.displayOrder || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            cat.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              cat.isActive ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          />
                          {cat.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(cat);
                            }}
                            className="rounded-lg p-1.5 text-blue-500 transition hover:bg-blue-50 hover:scale-110"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(cat._id, e)}
                            className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 hover:scale-110"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Pagination ────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── Create/Edit Modal ────────────────────────────── */}
      <AnimatePresence>
        {modal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => resetForm()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-full max-w-md p-6 border shadow-2xl rounded-3xl bg-white/95 backdrop-blur-md border-white/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-gray-900">
                  {modal.editing ? "Edit Category" : "Add Category"}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 transition bg-gray-100 rounded-full hover:bg-gray-200 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Pizza"
                    className="mt-1 block w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Icon (emoji)
                  </label>
                  <select
                    name="icon"
                    value={form.icon}
                    onChange={handleIconSelect}
                    className="mt-1 block w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Optional description..."
                    className="mt-1 block w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Image
                  </label>
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 text-sm font-medium text-gray-700 transition bg-gray-100 rounded-xl hover:bg-gray-200"
                    >
                      Choose File
                    </button>
                    <span className="text-sm text-gray-500">
                      {form.image ? form.image.name : "No file chosen"}
                    </span>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {form.imagePreview && (
                    <div className="mt-2">
                      <img
                        src={form.imagePreview}
                        alt="Preview"
                        className="object-cover w-20 h-20 border border-gray-200 rounded-xl"
                      />
                    </div>
                  )}
                  {form.imagePreview && modal.editing && !form.image && (
                    <p className="mt-1 text-xs text-gray-400">
                      Current image (unchanged)
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="displayOrder"
                      value={form.displayOrder}
                      onChange={handleChange}
                      min="0"
                      className="block w-full px-3 py-2 mt-1 text-sm transition border border-gray-200 outline-none rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                  <div className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700">
                      Active
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="px-3 py-2 text-sm text-red-600 rounded-xl bg-red-50">
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2 text-sm font-medium text-gray-700 transition bg-gray-100 rounded-xl hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-2 text-sm font-bold text-white transition shadow-sm rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting && (
                      <span className="w-4 h-4 border-2 rounded-full animate-spin border-white/30 border-t-white" />
                    )}
                    {modal.editing ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Detail Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {detailModalOpen && selectedCategory && (
          <CategoryDetailModal
            category={selectedCategory}
            onClose={() => {
              setDetailModalOpen(false);
              setSelectedCategory(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
