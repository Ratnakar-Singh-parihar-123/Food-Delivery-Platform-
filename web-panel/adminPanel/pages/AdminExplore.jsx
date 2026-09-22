// // pages/AdminExplore.jsx
// import React, { useState, useEffect, useRef } from "react";
// import Select from "react-select";
// import {
//   getExploreCategories,
//   createExploreCategory,
//   updateExploreCategory,
//   deleteExploreCategory,
//   getSuggestions,
//   getAllVendors,
//   getAllMenuItems,
// } from "../../src/api/adminApi";

// // ─── Emojis ──────────────────────────────────────────────
// const EMOJIS = [
//   "🔥",
//   "✨",
//   "⭐",
//   "💎",
//   "🎯",
//   "🏆",
//   "💯",
//   "🚀",
//   "🍕",
//   "🍔",
//   "🌮",
//   "🥗",
//   "🍣",
//   "🍜",
//   "🍰",
//   "🧁",
//   "🍦",
//   "🍩",
//   "☕",
//   "🍵",
//   "🍷",
//   "🍸",
//   "🍹",
//   "🍺",
//   "🌶️",
//   "🧄",
//   "🧀",
//   "🥩",
//   "🍗",
//   "🍤",
//   "🍚",
//   "🍱",
//   "🥘",
//   "🍲",
//   "🥣",
//   "🧇",
//   "🥞",
//   "🧈",
//   "🥐",
//   "🥖",
//   "🌭",
//   "🥪",
//   "🥙",
//   "🧆",
//   "🥮",
//   "🍡",
//   "🍢",
//   "🍥",
// ];

// // ─── Helper: image URL ──────────────────────────────────
// const getImageUrl = (path) => {
//   if (!path) return null;
//   if (path.startsWith("http://") || path.startsWith("https://")) return path;
//   const base = import.meta.env.VITE_API_BASE || "http://localhost:9000";
//   const cleanPath = path.startsWith("/") ? path : `/${path}`;
//   return `${base}${cleanPath}`;
// };

// export default function AdminExplore() {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [vendors, setVendors] = useState([]);
//   const [menuItems, setMenuItems] = useState([]);
//   const [submitting, setSubmitting] = useState(false);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const emojiPickerRef = useRef(null);
//   const [form, setForm] = useState({
//     title: "",
//     icon: "",
//     description: "",
//     vendors: [],
//     items: [],
//     displayOrder: 0,
//     isActive: true,
//   });

//   // ─── Close emoji picker ──────────────────────────────
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (
//         emojiPickerRef.current &&
//         !emojiPickerRef.current.contains(e.target)
//       ) {
//         setShowEmojiPicker(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // ─── Fetch Data ──────────────────────────────────────
//   const fetchAllData = async () => {
//     try {
//       setLoading(true);
//       const [cats, vend, items] = await Promise.all([
//         getExploreCategories(),
//         getAllVendors(),
//         getAllMenuItems(),
//       ]);

//       const categoriesData = cats?.data || cats || [];
//       setCategories(categoriesData);

//       const vendorsData = vend?.data?.vendors || vend?.data || vend || [];
//       setVendors(vendorsData);

//       const menuItemsData = items?.data?.items || items?.data || items || [];
//       setMenuItems(menuItemsData);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       alert("Failed to load data. Check your connection.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   // ─── Form Handlers ──────────────────────────────────
//   const resetForm = () => {
//     setForm({
//       title: "",
//       icon: "",
//       description: "",
//       vendors: [],
//       items: [],
//       displayOrder: 0,
//       isActive: true,
//     });
//     setEditingId(null);
//     setShowEmojiPicker(false);
//   };

//   const openCreateModal = () => {
//     resetForm();
//     setModalOpen(true);
//   };

//   const openEditModal = (category) => {
//     setForm({
//       title: category.title,
//       icon: category.icon,
//       description: category.description || "",
//       vendors: category.vendors.map((v) => v._id || v),
//       items: category.items.map((i) => i._id || i),
//       displayOrder: category.displayOrder || 0,
//       isActive: category.isActive,
//     });
//     setEditingId(category._id);
//     setModalOpen(true);
//     setShowEmojiPicker(false);
//   };

//   const handleAutoSuggest = async () => {
//     try {
//       const res = await getSuggestions();
//       if (res.success) {
//         const suggestedVendors = res.data.vendors.map((v) => v._id);
//         const suggestedItems = res.data.items.map((i) => i._id);
//         setForm((prev) => ({
//           ...prev,
//           vendors: suggestedVendors,
//           items: suggestedItems,
//         }));
//         alert("Suggestions loaded! You can still adjust the selections.");
//       }
//     } catch (error) {
//       alert("Failed to get suggestions");
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setForm((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleSelectChange = (field, selectedOptions) => {
//     const values = selectedOptions
//       ? selectedOptions.map((opt) => opt.value)
//       : [];
//     setForm((prev) => ({ ...prev, [field]: values }));
//   };

//   const selectEmoji = (emoji) => {
//     setForm((prev) => ({ ...prev, icon: emoji }));
//     setShowEmojiPicker(false);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.title.trim() || !form.icon) {
//       alert("Title and icon are required.");
//       return;
//     }
//     try {
//       setSubmitting(true);
//       const payload = {
//         title: form.title.trim(),
//         icon: form.icon,
//         description: form.description.trim(),
//         vendors: form.vendors,
//         items: form.items,
//         displayOrder: Number(form.displayOrder),
//         isActive: form.isActive,
//       };
//       if (editingId) {
//         await updateExploreCategory(editingId, payload);
//       } else {
//         await createExploreCategory(payload);
//       }
//       await fetchAllData();
//       setModalOpen(false);
//       resetForm();
//     } catch (error) {
//       console.error(error);
//       alert("Failed to save category");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this category permanently?")) return;
//     try {
//       await deleteExploreCategory(id);
//       await fetchAllData();
//     } catch (error) {
//       alert("Delete failed");
//     }
//   };

//   // ─── Select Options ──────────────────────────────────
//   const vendorOptions = vendors.map((v) => ({
//     value: v._id,
//     label: v.businessName || v.name || "Unnamed Vendor",
//     image: v.profileImage ? getImageUrl(v.profileImage) : null,
//   }));

//   const itemOptions = menuItems.map((i) => ({
//     value: i._id,
//     label: i.name || "Unnamed Item",
//     vendorName: i.vendorId?.businessName || "",
//     image: i.image ? getImageUrl(i.image) : null,
//   }));

//   // ─── Custom Option Rendering ──────────────────────────
//   const formatVendorOption = (option) => (
//     <div className="flex items-center gap-2">
//       {option.image ? (
//         <img
//           src={option.image}
//           alt={option.label}
//           className="object-cover w-5 h-5 border border-gray-200 rounded-full"
//         />
//       ) : (
//         <div className="flex items-center justify-center w-5 h-5 text-[10px] font-bold text-orange-500 bg-orange-100 rounded-full">
//           {option.label.charAt(0).toUpperCase()}
//         </div>
//       )}
//       <span className="text-sm">{option.label}</span>
//     </div>
//   );

//   const formatItemOption = (option) => (
//     <div className="flex items-center gap-2">
//       {option.image ? (
//         <img
//           src={option.image}
//           alt={option.label}
//           className="object-cover w-6 h-6 border border-gray-200 rounded"
//         />
//       ) : (
//         <div className="flex items-center justify-center w-6 h-6 text-[10px] font-bold text-purple-500 bg-purple-100 rounded">
//           {option.label.charAt(0).toUpperCase()}
//         </div>
//       )}
//       <div>
//         <span className="text-sm font-medium">{option.label}</span>
//         {option.vendorName && (
//           <span className="ml-1 text-xs text-gray-400">
//             ({option.vendorName})
//           </span>
//         )}
//       </div>
//     </div>
//   );

//   // ─── Loading ──────────────────────────────────────────
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="flex items-center gap-3">
//           <div className="w-5 h-5 border-2 border-orange-500 rounded-full border-t-transparent animate-spin" />
//           <span className="text-sm text-gray-500">Loading...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 mx-auto max-w-7xl">
//       {/* ─── Header ──────────────────────────────────────── */}
//       <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
//         <div>
//           <h1 className="text-xl font-bold text-gray-800">
//             Explore Categories
//           </h1>
//           <p className="text-xs text-gray-500">
//             Manage categories shown in the "Explore Near You" section.
//           </p>
//         </div>
//         <button
//           onClick={openCreateModal}
//           className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white transition-colors bg-orange-500 rounded-lg hover:bg-orange-600"
//         >
//           <svg
//             className="w-4 h-4"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M12 4v16m8-8H4"
//             />
//           </svg>
//           Add Category
//         </button>
//       </div>

//       {/* ─── Table ────────────────────────────────────────── */}
//       <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-100">
//             <thead className="bg-gray-50/80">
//               <tr>
//                 <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
//                   Icon
//                 </th>
//                 <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
//                   Title
//                 </th>
//                 <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
//                   Vendors
//                 </th>
//                 <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
//                   Items
//                 </th>
//                 <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
//                   Order
//                 </th>
//                 <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
//                   Status
//                 </th>
//                 <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-gray-500">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-100">
//               {categories.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan="7"
//                     className="px-4 py-8 text-center text-gray-400"
//                   >
//                     <div className="flex flex-col items-center">
//                       <span className="text-3xl">📭</span>
//                       <p className="mt-1 text-sm">No categories yet</p>
//                       <button
//                         onClick={openCreateModal}
//                         className="mt-2 text-xs font-medium text-orange-500 hover:underline"
//                       >
//                         Create your first category
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 categories.map((cat) => (
//                   <tr
//                     key={cat._id}
//                     className="transition-colors hover:bg-gray-50/60"
//                   >
//                     <td className="px-4 py-2.5 text-2xl">{cat.icon}</td>
//                     <td className="px-4 py-2.5 text-sm font-medium text-gray-900">
//                       {cat.title}
//                     </td>
//                     <td className="px-4 py-2.5">
//                       <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-blue-600 bg-blue-50 rounded-full">
//                         <svg
//                           className="w-3 h-3"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"
//                           />
//                           <circle cx="12" cy="7" r="4" />
//                         </svg>
//                         {cat.vendors?.length || 0}
//                       </span>
//                     </td>
//                     <td className="px-4 py-2.5">
//                       <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-purple-600 bg-purple-50 rounded-full">
//                         <svg
//                           className="w-3 h-3"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
//                           />
//                         </svg>
//                         {cat.items?.length || 0}
//                       </span>
//                     </td>
//                     <td className="px-4 py-2.5 text-xs text-gray-600">
//                       <span className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 rounded-full">
//                         #{cat.displayOrder || 0}
//                       </span>
//                     </td>
//                     <td className="px-4 py-2.5">
//                       <span
//                         className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
//                           cat.isActive
//                             ? "bg-green-100 text-green-700"
//                             : "bg-red-100 text-red-700"
//                         }`}
//                       >
//                         <span
//                           className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? "bg-green-500" : "bg-red-500"}`}
//                         />
//                         {cat.isActive ? "Active" : "Inactive"}
//                       </span>
//                     </td>
//                     <td className="px-4 py-2.5 text-right">
//                       <div className="flex items-center justify-end gap-1">
//                         <button
//                           onClick={() => openEditModal(cat)}
//                           className="p-1.5 text-blue-500 rounded hover:bg-blue-50 transition-colors"
//                           title="Edit"
//                         >
//                           <svg
//                             className="w-4 h-4"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
//                             />
//                           </svg>
//                         </button>
//                         <button
//                           onClick={() => handleDelete(cat._id)}
//                           className="p-1.5 text-red-400 rounded hover:bg-red-50 transition-colors"
//                           title="Delete"
//                         >
//                           <svg
//                             className="w-4 h-4"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                             />
//                           </svg>
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* ─── Modal ────────────────────────────────────────── */}
//       {modalOpen && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
//           onClick={() => setModalOpen(false)}
//         >
//           <div
//             className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center justify-between mb-5">
//               <div>
//                 <h2 className="text-xl font-bold text-gray-800">
//                   {editingId ? "Edit Category" : "Add Category"}
//                 </h2>
//                 <p className="text-xs text-gray-500">
//                   {editingId
//                     ? "Update the category details"
//                     : "Create a new explore category"}
//                 </p>
//               </div>
//               <button
//                 onClick={() => setModalOpen(false)}
//                 className="p-1.5 text-gray-400 rounded-lg hover:bg-gray-100"
//               >
//                 <svg
//                   className="w-5 h-5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-5">
//               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                 <div>
//                   <label className="block text-xs font-medium text-gray-700">
//                     Title *
//                   </label>
//                   <input
//                     type="text"
//                     name="title"
//                     value={form.title}
//                     onChange={handleChange}
//                     placeholder="e.g. Trending Now"
//                     className="block w-full px-4 py-2 mt-1 text-sm border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500"
//                     required
//                   />
//                 </div>

//                 {/* Icon */}
//                 <div>
//                   <label className="block text-xs font-medium text-gray-700">
//                     Icon (emoji) *
//                   </label>
//                   <div className="relative mt-1">
//                     <div className="flex items-center gap-2">
//                       <input
//                         type="text"
//                         name="icon"
//                         value={form.icon}
//                         onChange={handleChange}
//                         placeholder="🔥"
//                         maxLength={2}
//                         className="block w-full px-4 py-2 text-sm border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500"
//                         required
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowEmojiPicker(!showEmojiPicker)}
//                         className="flex items-center justify-center text-lg border border-gray-300 rounded-lg w-9 h-9 hover:bg-gray-50"
//                       >
//                         😊
//                       </button>
//                     </div>
//                     {showEmojiPicker && (
//                       <div
//                         ref={emojiPickerRef}
//                         className="absolute z-50 max-w-xs p-2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg"
//                       >
//                         <div className="grid grid-cols-8 gap-0.5">
//                           {EMOJIS.map((emoji) => (
//                             <button
//                               key={emoji}
//                               type="button"
//                               onClick={() => selectEmoji(emoji)}
//                               className="flex items-center justify-center w-8 h-8 text-lg rounded hover:bg-gray-100"
//                             >
//                               {emoji}
//                             </button>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-xs font-medium text-gray-700">
//                   Description
//                 </label>
//                 <textarea
//                   name="description"
//                   value={form.description}
//                   onChange={handleChange}
//                   rows="2"
//                   placeholder="Brief description..."
//                   className="block w-full px-4 py-2 mt-1 text-sm border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-medium text-gray-700">
//                   Vendors
//                 </label>
//                 <Select
//                   isMulti
//                   options={vendorOptions}
//                   value={vendorOptions.filter((opt) =>
//                     form.vendors.includes(opt.value),
//                   )}
//                   onChange={(selected) =>
//                     handleSelectChange("vendors", selected)
//                   }
//                   placeholder="Select vendors..."
//                   formatOptionLabel={formatVendorOption}
//                   className="mt-1"
//                   classNamePrefix="react-select"
//                   styles={{
//                     control: (base) => ({
//                       ...base,
//                       borderRadius: "0.5rem",
//                       borderColor: "#e5e7eb",
//                       minHeight: "38px",
//                     }),
//                   }}
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-medium text-gray-700">
//                   Menu Items
//                 </label>
//                 <Select
//                   isMulti
//                   options={itemOptions}
//                   value={itemOptions.filter((opt) =>
//                     form.items.includes(opt.value),
//                   )}
//                   onChange={(selected) => handleSelectChange("items", selected)}
//                   placeholder="Select menu items..."
//                   formatOptionLabel={formatItemOption}
//                   className="mt-1"
//                   classNamePrefix="react-select"
//                   styles={{
//                     control: (base) => ({
//                       ...base,
//                       borderRadius: "0.5rem",
//                       borderColor: "#e5e7eb",
//                       minHeight: "38px",
//                     }),
//                   }}
//                 />
//               </div>

//               <div className="flex flex-wrap items-center gap-4">
//                 <div className="w-24">
//                   <label className="block text-xs font-medium text-gray-700">
//                     Order
//                   </label>
//                   <input
//                     type="number"
//                     name="displayOrder"
//                     value={form.displayOrder}
//                     onChange={handleChange}
//                     min="0"
//                     className="block w-full px-3 py-2 mt-1 text-sm border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500"
//                   />
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     name="isActive"
//                     checked={form.isActive}
//                     onChange={handleChange}
//                     className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
//                   />
//                   <label className="text-sm text-gray-700">
//                     Active (visible to customers)
//                   </label>
//                 </div>
//               </div>

//               <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t">
//                 <button
//                   type="button"
//                   onClick={handleAutoSuggest}
//                   className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200"
//                 >
//                   ✨ Auto‑Suggest
//                 </button>
//                 <div className="flex gap-2">
//                   <button
//                     type="button"
//                     onClick={() => setModalOpen(false)}
//                     className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={submitting}
//                     className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {submitting && (
//                       <span className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
//                     )}
//                     {editingId ? "Update" : "Create"} Category
//                   </button>
//                 </div>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// pages/AdminExplore.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Select from "react-select";
import {
  X,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  Truck,
  User,
  MapPin,
  Phone,
  IndianRupee,
  Calendar,
  MoreVertical,
  Check,
  XCircle,
  ShoppingBag,
  Store,
} from "lucide-react"; // X is now imported
import {
  getExploreCategories,
  createExploreCategory,
  updateExploreCategory,
  deleteExploreCategory,
  getSuggestions,
  getAllVendors,
  getAllMenuItems,
} from "../../src/api/adminApi";

// ─── Emojis ──────────────────────────────────────────────
const EMOJIS = [
  "🔥",
  "✨",
  "⭐",
  "💎",
  "🎯",
  "🏆",
  "💯",
  "🚀",
  "🍕",
  "🍔",
  "🌮",
  "🥗",
  "🍣",
  "🍜",
  "🍰",
  "🧁",
  "🍦",
  "🍩",
  "☕",
  "🍵",
  "🍷",
  "🍸",
  "🍹",
  "🍺",
  "🌶️",
  "🧄",
  "🧀",
  "🥩",
  "🍗",
  "🍤",
  "🍚",
  "🍱",
  "🥘",
  "🍲",
  "🥣",
  "🧇",
  "🥞",
  "🧈",
  "🥐",
  "🥖",
  "🌭",
  "🥪",
  "🥙",
  "🧆",
  "🥮",
  "🍡",
  "🍢",
  "🍥",
];

// ─── Helper: image URL ──────────────────────────────────
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = import.meta.env.VITE_API_BASE || "http://localhost:9000";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

// ─── Detail Modal ────────────────────────────────────────
function CategoryDetailModal({ category, onClose }) {
  if (!category) return null;

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
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur-md border border-white/30"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute z-10 p-2 text-gray-400 transition rounded-full shadow-sm top-4 right-4 bg-white/80 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{category.icon}</span>
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                {category.title}
              </h2>
              <p className="text-sm text-gray-500">
                {category.description || "No description"}
              </p>
              <div className="flex items-center gap-3 mt-1">
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
            </div>
          </div>
        </div>

        {/* Vendors */}
        <div className="mt-6">
          <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase">
            Vendors ({category.vendors?.length || 0})
          </h3>
          <div className="grid grid-cols-1 gap-2 mt-2 sm:grid-cols-2">
            {category.vendors?.map((vendor) => (
              <div
                key={vendor._id}
                className="flex items-center gap-3 p-3 border rounded-xl border-gray-200/60 bg-white/50"
              >
                {vendor.profileImage ? (
                  <img
                    src={getImageUrl(vendor.profileImage)}
                    alt={vendor.businessName}
                    className="object-cover w-10 h-10 border border-gray-200 rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-orange-500 bg-orange-100 rounded-full">
                    {vendor.businessName?.charAt(0) || "V"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {vendor.businessName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {vendor.address?.city}, {vendor.address?.state}
                  </p>
                </div>
              </div>
            ))}
            {(!category.vendors || category.vendors.length === 0) && (
              <p className="col-span-2 text-sm text-gray-400">
                No vendors assigned
              </p>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="mt-6">
          <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase">
            Menu Items ({category.items?.length || 0})
          </h3>
          <div className="grid grid-cols-1 gap-2 mt-2 sm:grid-cols-2">
            {category.items?.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-3 p-3 border rounded-xl border-gray-200/60 bg-white/50"
              >
                {item.image ? (
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="object-cover w-12 h-12 border border-gray-200 rounded-lg"
                  />
                ) : (
                  <div className="flex items-center justify-center w-12 h-12 text-sm font-bold text-purple-500 bg-purple-100 rounded-lg">
                    {item.name?.charAt(0) || "I"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    ₹{item.price} ·{" "}
                    {item.vendorId?.businessName || "Unknown vendor"}
                  </p>
                </div>
              </div>
            ))}
            {(!category.items || category.items.length === 0) && (
              <p className="col-span-2 text-sm text-gray-400">
                No items assigned
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminExplore() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const [form, setForm] = useState({
    title: "",
    icon: "",
    description: "",
    vendors: [],
    items: [],
    displayOrder: 0,
    isActive: true,
  });

  // State for detail modal
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // ─── Close emoji picker ──────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Fetch Data ──────────────────────────────────────
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [cats, vend, items] = await Promise.all([
        getExploreCategories(),
        getAllVendors(),
        getAllMenuItems(),
      ]);

      const categoriesData = cats?.data || cats || [];
      setCategories(categoriesData);

      const vendorsData = vend?.data?.vendors || vend?.data || vend || [];
      setVendors(vendorsData);

      const menuItemsData = items?.data?.items || items?.data || items || [];
      setMenuItems(menuItemsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load data. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ─── Form Handlers ──────────────────────────────────
  const resetForm = () => {
    setForm({
      title: "",
      icon: "",
      description: "",
      vendors: [],
      items: [],
      displayOrder: 0,
      isActive: true,
    });
    setEditingId(null);
    setShowEmojiPicker(false);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setForm({
      title: category.title,
      icon: category.icon,
      description: category.description || "",
      vendors: category.vendors.map((v) => v._id || v),
      items: category.items.map((i) => i._id || i),
      displayOrder: category.displayOrder || 0,
      isActive: category.isActive,
    });
    setEditingId(category._id);
    setModalOpen(true);
    setShowEmojiPicker(false);
  };

  const handleAutoSuggest = async () => {
    try {
      const res = await getSuggestions();
      if (res.success) {
        const suggestedVendors = res.data.vendors.map((v) => v._id);
        const suggestedItems = res.data.items.map((i) => i._id);
        setForm((prev) => ({
          ...prev,
          vendors: suggestedVendors,
          items: suggestedItems,
        }));
        alert("Suggestions loaded! You can still adjust the selections.");
      }
    } catch (error) {
      alert("Failed to get suggestions");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (field, selectedOptions) => {
    const values = selectedOptions
      ? selectedOptions.map((opt) => opt.value)
      : [];
    setForm((prev) => ({ ...prev, [field]: values }));
  };

  const selectEmoji = (emoji) => {
    setForm((prev) => ({ ...prev, icon: emoji }));
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.icon) {
      alert("Title and icon are required.");
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        title: form.title.trim(),
        icon: form.icon,
        description: form.description.trim(),
        vendors: form.vendors,
        items: form.items,
        displayOrder: Number(form.displayOrder),
        isActive: form.isActive,
      };
      if (editingId) {
        await updateExploreCategory(editingId, payload);
      } else {
        await createExploreCategory(payload);
      }
      await fetchAllData();
      setModalOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      alert("Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent row click
    if (!window.confirm("Delete this category permanently?")) return;
    try {
      await deleteExploreCategory(id);
      await fetchAllData();
    } catch (error) {
      alert("Delete failed");
    }
  };

  // ─── Row Click Handler ──────────────────────────────
  const handleRowClick = (category) => {
    setSelectedCategory(category);
    setDetailModalOpen(true);
  };

  // ─── Select Options ──────────────────────────────────
  const vendorOptions = vendors.map((v) => ({
    value: v._id,
    label: v.businessName || v.name || "Unnamed Vendor",
    image: v.profileImage ? getImageUrl(v.profileImage) : null,
  }));

  const itemOptions = menuItems.map((i) => ({
    value: i._id,
    label: i.name || "Unnamed Item",
    vendorName: i.vendorId?.businessName || "",
    image: i.image ? getImageUrl(i.image) : null,
  }));

  // ─── Custom Option Rendering ──────────────────────────
  const formatVendorOption = (option) => (
    <div className="flex items-center gap-2">
      {option.image ? (
        <img
          src={option.image}
          alt={option.label}
          className="object-cover w-5 h-5 border border-gray-200 rounded-full"
        />
      ) : (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-500">
          {option.label.charAt(0).toUpperCase()}
        </div>
      )}
      <span className="text-sm">{option.label}</span>
    </div>
  );

  const formatItemOption = (option) => (
    <div className="flex items-center gap-2">
      {option.image ? (
        <img
          src={option.image}
          alt={option.label}
          className="object-cover w-6 h-6 border border-gray-200 rounded"
        />
      ) : (
        <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-100 text-[10px] font-bold text-purple-500">
          {option.label.charAt(0).toUpperCase()}
        </div>
      )}
      <div>
        <span className="text-sm font-medium">{option.label}</span>
        {option.vendorName && (
          <span className="ml-1 text-xs text-gray-400">
            ({option.vendorName})
          </span>
        )}
      </div>
    </div>
  );

  // ─── Loading ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-orange-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 mx-auto max-w-7xl sm:p-6">
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="relative p-6 mb-6 overflow-hidden shadow-xl rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-500/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Explore Categories
            </h1>
            <p className="mt-1 text-sm text-orange-100">
              Manage categories shown in the "Explore Near You" section.
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

      {/* ─── Table ────────────────────────────────────────── */}
      <div className="overflow-hidden border shadow-lg rounded-3xl border-gray-200/60 bg-white/80 backdrop-blur-sm shadow-gray-200/40">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100/80">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Icon
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Vendors
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Items
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
                      colSpan="7"
                      className="px-4 py-12 text-center text-gray-400"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-4xl">📭</span>
                        <p className="mt-2 text-sm">No categories yet</p>
                        <button
                          onClick={openCreateModal}
                          className="mt-2 text-xs font-medium text-orange-500 hover:underline"
                        >
                          Create your first category
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
                      <td className="px-4 py-3 text-2xl">{cat.icon}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {cat.title}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600">
                          <Store className="w-3 h-3" />
                          {cat.vendors?.length || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-600">
                          <Package className="w-3 h-3" />
                          {cat.items?.length || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
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

      {/* ─── Create/Edit Modal ────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur-md border border-white/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {editingId ? "Edit Category" : "Add Category"}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {editingId
                      ? "Update the category details"
                      : "Create a new explore category"}
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 text-gray-400 transition bg-gray-100 rounded-full hover:bg-gray-200 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. Trending Now"
                      className="mt-1 block w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase">
                      Icon (emoji) *
                    </label>
                    <div className="relative mt-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          name="icon"
                          value={form.icon}
                          onChange={handleChange}
                          placeholder="🔥"
                          maxLength={2}
                          className="block w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="flex items-center justify-center w-10 h-10 text-lg transition border border-gray-200 rounded-xl hover:bg-gray-50"
                        >
                          😊
                        </button>
                      </div>
                      {showEmojiPicker && (
                        <div
                          ref={emojiPickerRef}
                          className="absolute z-50 max-w-xs p-2 mt-2 bg-white border border-gray-200 shadow-xl rounded-2xl"
                        >
                          <div className="grid grid-cols-8 gap-0.5">
                            {EMOJIS.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => selectEmoji(emoji)}
                                className="flex items-center justify-center w-8 h-8 text-lg transition rounded-lg hover:bg-gray-100"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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
                    placeholder="Brief description..."
                    className="mt-1 block w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Vendors
                  </label>
                  <Select
                    isMulti
                    options={vendorOptions}
                    value={vendorOptions.filter((opt) =>
                      form.vendors.includes(opt.value),
                    )}
                    onChange={(selected) =>
                      handleSelectChange("vendors", selected)
                    }
                    placeholder="Select vendors..."
                    formatOptionLabel={formatVendorOption}
                    className="mt-1"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: "0.75rem",
                        borderColor: "#e5e7eb",
                        minHeight: "42px",
                        boxShadow: "none",
                        "&:hover": { borderColor: "#f97316" },
                      }),
                      option: (base, { isFocused }) => ({
                        ...base,
                        backgroundColor: isFocused ? "#fef3c7" : "transparent",
                        borderRadius: "0.5rem",
                      }),
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Menu Items
                  </label>
                  <Select
                    isMulti
                    options={itemOptions}
                    value={itemOptions.filter((opt) =>
                      form.items.includes(opt.value),
                    )}
                    onChange={(selected) =>
                      handleSelectChange("items", selected)
                    }
                    placeholder="Select menu items..."
                    formatOptionLabel={formatItemOption}
                    className="mt-1"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: "0.75rem",
                        borderColor: "#e5e7eb",
                        minHeight: "42px",
                        boxShadow: "none",
                        "&:hover": { borderColor: "#f97316" },
                      }),
                      option: (base, { isFocused }) => ({
                        ...base,
                        backgroundColor: isFocused ? "#fef3c7" : "transparent",
                        borderRadius: "0.5rem",
                      }),
                    }}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="w-24">
                    <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase">
                      Order
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
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Active (visible to customers)
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleAutoSuggest}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-100 hover:scale-105"
                  >
                    ✨ Auto‑Suggest
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
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
                      {editingId ? "Update" : "Create"} Category
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Detail Modal ────────────────────────────────── */}
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
