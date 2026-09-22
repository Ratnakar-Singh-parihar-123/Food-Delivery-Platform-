// import React, { useState, useEffect, useCallback } from "react";
// import {
//   getCustomers,
//   getCustomerStats,
//   blockCustomer,
//   unblockCustomer,
//   updateCustomerStatus,
// } from "../../src/api/adminCustomerApi";

// // ─── IMAGE URL HELPER ──────────────────────────────────
// const STATIC_BASE =
//   import.meta.env.VITE_STATIC_BASE || "http://localhost:9000/api/2026";
// console.log(import.meta.env.VITE_STATIC_BASE);

// const getImageUrl = (path) => {
//   if (!path) return null;
//   console.log("Profile Image:", path);
//   if (path.startsWith("http")) return path;
//   const cleanPath = path.startsWith("/") ? path : `/${path}`;
//   console.log("Final URL:", `${STATIC_BASE}${cleanPath}`);
//   return `${STATIC_BASE}${cleanPath}`;
// };

// // ─── STATS CARD ──────────────────────────────────────────
// const StatsCard = ({ title, value, icon, color }) => (
//   <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
//     <div className="flex items-center justify-between">
//       <div>
//         <p className="text-sm font-medium text-gray-500">{title}</p>
//         <p className="text-2xl font-bold text-gray-800">{value}</p>
//       </div>
//       <div className={`p-3 rounded-full ${color}`}>{icon}</div>
//     </div>
//   </div>
// );

// // ─── SKELETON LOADERS ────────────────────────────────────
// const StatsSkeleton = () => (
//   <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-4">
//     {[...Array(4)].map((_, i) => (
//       <div
//         key={i}
//         className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl animate-pulse"
//       >
//         <div className="flex items-center justify-between">
//           <div>
//             <div className="w-24 h-4 mb-2 bg-gray-200 rounded" />
//             <div className="w-16 h-8 bg-gray-200 rounded" />
//           </div>
//           <div className="w-12 h-12 bg-gray-200 rounded-full" />
//         </div>
//       </div>
//     ))}
//   </div>
// );

// const TableSkeleton = () => (
//   <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl">
//     <div className="overflow-x-auto">
//       <table className="min-w-full divide-y divide-gray-200">
//         <thead className="bg-gray-50">
//           <tr>
//             {[
//               "Customer",
//               "Email",
//               "Phone",
//               "Status",
//               "Blocked",
//               "Orders",
//               "Actions",
//             ].map((h) => (
//               <th
//                 key={h}
//                 className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
//               >
//                 {h}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody className="bg-white divide-y divide-gray-200">
//           {[...Array(5)].map((_, i) => (
//             <tr key={i} className="animate-pulse">
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <div className="flex items-center">
//                   <div className="w-10 h-10 bg-gray-200 rounded-full" />
//                   <div className="ml-4">
//                     <div className="w-32 h-4 mb-1 bg-gray-200 rounded" />
//                     <div className="w-20 h-3 bg-gray-200 rounded" />
//                   </div>
//                 </div>
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <div className="w-32 h-4 bg-gray-200 rounded" />
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <div className="w-24 h-4 bg-gray-200 rounded" />
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <div className="w-16 h-6 bg-gray-200 rounded-full" />
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <div className="w-16 h-6 bg-gray-200 rounded-full" />
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <div className="w-8 h-4 bg-gray-200 rounded" />
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <div className="flex gap-2">
//                   <div className="w-16 h-8 bg-gray-200 rounded" />
//                   <div className="w-16 h-8 bg-gray-200 rounded" />
//                 </div>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   </div>
// );

// // ─── CUSTOMER DETAIL MODAL ──────────────────────────────
// const CustomerDetailModal = ({ customer, isOpen, onClose }) => {
//   if (!isOpen || !customer) return null;

//   const formatDate = (date) => {
//     if (!date) return "—";
//     return new Date(date).toLocaleDateString("en-IN", {
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       {/* Backdrop */}
//       <div
//         className="fixed inset-0 transition-opacity bg-black/50 backdrop-blur-sm"
//         onClick={onClose}
//       />

//       {/* Modal Card */}
//       <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
//         {/* Header */}
//         <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
//           <div className="flex items-center gap-3">
//             {customer.profileImage ? (
//               <img
//                 src={getImageUrl(customer.profileImage)}
//                 alt={customer.firstName}
//                 className="object-cover w-12 h-12 rounded-full"
//                 onError={(e) => {
//                   e.target.style.display = "none";
//                   e.target.nextSibling.style.display = "flex";
//                 }}
//               />
//             ) : null}
//             <div
//               className={`w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xl ${
//                 customer.profileImage ? "hidden" : "flex"
//               }`}
//             >
//               {customer.firstName?.[0] || "U"}
//             </div>
//             <div>
//               <h2 className="text-xl font-bold text-gray-800">
//                 {customer.firstName} {customer.lastName}
//               </h2>
//               <p className="text-sm text-gray-500">
//                 Customer ID: {customer._id}
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 transition-colors rounded-full hover:bg-gray-100"
//           >
//             <svg
//               className="w-6 h-6 text-gray-500"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M6 18L18 6M6 6l12 12"
//               />
//             </svg>
//           </button>
//         </div>

//         {/* Body */}
//         <div className="p-6 space-y-6">
//           {/* Contact Info */}
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//             <div>
//               <p className="text-sm font-medium text-gray-500">Email</p>
//               <p className="text-gray-800">{customer.email}</p>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-500">Phone</p>
//               <p className="text-gray-800">{customer.phone || "—"}</p>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-500">Gender</p>
//               <p className="text-gray-800">{customer.gender || "—"}</p>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-500">Date of Birth</p>
//               <p className="text-gray-800">
//                 {customer.dateOfBirth
//                   ? new Date(customer.dateOfBirth).toLocaleDateString()
//                   : "—"}
//               </p>
//             </div>
//           </div>

//           {/* Status Badges */}
//           <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
//             <div className="flex items-center gap-2">
//               <span className="text-sm font-medium text-gray-500">Status:</span>
//               <span
//                 className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                   customer.isActive
//                     ? "bg-green-100 text-green-800"
//                     : "bg-gray-100 text-gray-800"
//                 }`}
//               >
//                 {customer.isActive ? "Active" : "Inactive"}
//               </span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-sm font-medium text-gray-500">
//                 Blocked:
//               </span>
//               <span
//                 className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                   customer.isBlocked
//                     ? "bg-red-100 text-red-800"
//                     : "bg-gray-100 text-gray-800"
//                 }`}
//               >
//                 {customer.isBlocked ? "Blocked" : "Not Blocked"}
//               </span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-sm font-medium text-gray-500">
//                 Email Verified:
//               </span>
//               <span
//                 className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                   customer.isEmailVerified
//                     ? "bg-green-100 text-green-800"
//                     : "bg-yellow-100 text-yellow-800"
//                 }`}
//               >
//                 {customer.isEmailVerified ? "Verified" : "Unverified"}
//               </span>
//             </div>
//           </div>

//           {/* Stats */}
//           <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100">
//             <div className="text-center">
//               <p className="text-2xl font-bold text-gray-800">
//                 {customer.totalOrders || 0}
//               </p>
//               <p className="text-xs text-gray-500">Total Orders</p>
//             </div>
//             <div className="text-center">
//               <p className="text-2xl font-bold text-gray-800">
//                 ₹{customer.totalSpent?.toFixed(0) || 0}
//               </p>
//               <p className="text-xs text-gray-500">Total Spent</p>
//             </div>
//             <div className="text-center">
//               <p className="text-2xl font-bold text-gray-800">
//                 {customer.totalCoins || 0}
//               </p>
//               <p className="text-xs text-gray-500">Coins</p>
//             </div>
//           </div>

//           {/* Timestamps */}
//           <div className="pt-2 space-y-1 text-xs text-gray-400 border-t border-gray-100">
//             <p>Joined: {formatDate(customer.createdAt)}</p>
//             <p>Last Login: {formatDate(customer.lastLoginAt)}</p>
//             <p>Last Updated: {formatDate(customer.updatedAt)}</p>
//           </div>

//           {/* Addresses */}
//           {customer.addresses && customer.addresses.length > 0 && (
//             <div className="pt-2 border-t border-gray-100">
//               <p className="mb-2 text-sm font-medium text-gray-700">
//                 Saved Addresses
//               </p>
//               <div className="space-y-2">
//                 {customer.addresses.map((addr, idx) => (
//                   <div key={idx} className="p-3 text-sm rounded-lg bg-gray-50">
//                     <p className="font-medium">{addr.label}</p>
//                     <p className="text-gray-600">{addr.addressLine}</p>
//                     <p className="text-gray-600">
//                       {addr.city}, {addr.state} - {addr.pincode}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer actions */}
//         <div className="sticky bottom-0 flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 text-sm font-medium text-gray-700 transition rounded-lg hover:bg-gray-200"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── MAIN COMPONENT ─────────────────────────────────────
// export default function AdminCustomers() {
//   const [customers, setCustomers] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [limit] = useState(10);
//   const [actionLoading, setActionLoading] = useState(null);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // ─── FETCH DATA ──────────────────────────────────────
//   const fetchData = useCallback(async () => {
//     try {
//       setLoading(true);
//       const [statsRes, customersRes] = await Promise.all([
//         getCustomerStats(),
//         getCustomers({ page, limit, search: searchTerm }),
//       ]);
//       setStats(statsRes.data);
//       setCustomers(customersRes.data.customers);
//       setTotalPages(customersRes.data.totalPages || 1);
//     } catch (error) {
//       console.error("Error fetching customer data:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, [page, limit, searchTerm]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   // ─── ACTIONS ──────────────────────────────────────────
//   const handleBlock = async (customerId, isBlocked) => {
//     if (isBlocked) {
//       if (!window.confirm("Unblock this customer?")) return;
//       try {
//         setActionLoading(customerId);
//         await unblockCustomer(customerId);
//         await fetchData();
//       } catch (error) {
//         alert("Failed to unblock customer.");
//       } finally {
//         setActionLoading(null);
//       }
//     } else {
//       const reason = prompt("Reason for blocking (optional):");
//       if (reason === null) return;
//       try {
//         setActionLoading(customerId);
//         await blockCustomer(customerId, reason);
//         await fetchData();
//       } catch (error) {
//         alert("Failed to block customer.");
//       } finally {
//         setActionLoading(null);
//       }
//     }
//   };

//   const handleStatusToggle = async (customerId, currentStatus) => {
//     const newStatus = currentStatus === "active" ? "inactive" : "active";
//     if (!window.confirm(`Set status to "${newStatus}"?`)) return;
//     try {
//       setActionLoading(customerId);
//       await updateCustomerStatus(customerId, newStatus);
//       await fetchData();
//     } catch (error) {
//       alert("Failed to update status.");
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   // ─── OPEN MODAL ──────────────────────────────────────
//   const openModal = (customer) => {
//     setSelectedCustomer(customer);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setSelectedCustomer(null);
//   };

//   // ─── SEARCH ────────────────────────────────────────────
//   const handleSearch = (e) => {
//     setSearchTerm(e.target.value);
//     setPage(1);
//   };

//   // ─── RENDER ────────────────────────────────────────────
//   return (
//     <div className="p-6">
//       {/* ─── STATS ──────────────────────────────────────── */}
//       {loading && !stats ? (
//         <StatsSkeleton />
//       ) : (
//         stats && (
//           <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-4">
//             <StatsCard
//               title="Total Customers"
//               value={stats.total}
//               icon={
//                 <svg
//                   className="w-6 h-6 text-blue-500"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
//                   />
//                 </svg>
//               }
//               color="bg-blue-50"
//             />
//             <StatsCard
//               title="Active"
//               value={stats.active}
//               icon={
//                 <svg
//                   className="w-6 h-6 text-green-500"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//               }
//               color="bg-green-50"
//             />
//             <StatsCard
//               title="Blocked"
//               value={stats.blocked}
//               icon={
//                 <svg
//                   className="w-6 h-6 text-red-500"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
//                   />
//                 </svg>
//               }
//               color="bg-red-50"
//             />
//             <StatsCard
//               title="Inactive"
//               value={stats.inactive}
//               icon={
//                 <svg
//                   className="w-6 h-6 text-gray-500"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//               }
//               color="bg-gray-50"
//             />
//           </div>
//         )
//       )}

//       {/* ─── TOOLBAR ────────────────────────────────────── */}
//       <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
//         <div className="relative">
//           <input
//             type="text"
//             placeholder="Search by name, email, phone..."
//             value={searchTerm}
//             onChange={handleSearch}
//             className="w-64 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//           />
//           <svg
//             className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//             />
//           </svg>
//         </div>
//         <button
//           onClick={() => fetchData()}
//           className="flex items-center gap-2 px-4 py-2 text-white transition bg-orange-500 rounded-lg hover:bg-orange-600"
//         >
//           <svg
//             className="w-5 h-5"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
//             />
//           </svg>
//           Refresh
//         </button>
//       </div>

//       {/* ─── TABLE ──────────────────────────────────────── */}
//       {loading && customers.length === 0 ? (
//         <TableSkeleton />
//       ) : (
//         <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
//                     Customer
//                   </th>
//                   <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
//                     Email
//                   </th>
//                   <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
//                     Phone
//                   </th>
//                   <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
//                     Blocked
//                   </th>
//                   <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
//                     Orders
//                   </th>
//                   <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {customers.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan="7"
//                       className="px-6 py-12 text-center text-gray-500"
//                     >
//                       No customers found.
//                     </td>
//                   </tr>
//                 ) : (
//                   customers.map((customer) => (
//                     <tr
//                       key={customer._id}
//                       className="transition cursor-pointer hover:bg-gray-50"
//                       onClick={() => openModal(customer)}
//                     >
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           {customer.profileImage ? (
//                             <img
//                               src={getImageUrl(customer.profileImage)}
//                               alt={customer.firstName}
//                               className="flex-shrink-0 object-cover w-10 h-10 rounded-full"
//                               onError={(e) => {
//                                 e.target.style.display = "none";
//                                 e.target.nextSibling.style.display = "flex";
//                               }}
//                             />
//                           ) : null}
//                           <div
//                             className={`flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold ${
//                               customer.profileImage ? "hidden" : "flex"
//                             }`}
//                           >
//                             {customer.firstName?.[0] || "U"}
//                           </div>
//                           <div className="ml-4">
//                             <div className="text-sm font-medium text-gray-900">
//                               {customer.firstName} {customer.lastName}
//                             </div>
//                             <div className="text-sm text-gray-500">
//                               ID: {customer._id.slice(-6)}
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
//                         {customer.email}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
//                         {customer.phone || "—"}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span
//                           className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                             customer.isActive
//                               ? "bg-green-100 text-green-800"
//                               : "bg-gray-100 text-gray-800"
//                           }`}
//                         >
//                           {customer.isActive ? "Active" : "Inactive"}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         {customer.isBlocked ? (
//                           <span className="inline-flex px-2 text-xs font-semibold leading-5 text-red-800 bg-red-100 rounded-full">
//                             Blocked
//                           </span>
//                         ) : (
//                           <span className="text-gray-400">—</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
//                         {customer.totalOrders || 0}
//                       </td>
//                       <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
//                         <div
//                           className="flex items-center gap-2"
//                           onClick={(e) => e.stopPropagation()}
//                         >
//                           {/* Block/Unblock */}
//                           <button
//                             onClick={() =>
//                               handleBlock(customer._id, customer.isBlocked)
//                             }
//                             disabled={actionLoading === customer._id}
//                             className={`px-3 py-1 rounded-md text-xs font-semibold ${
//                               customer.isBlocked
//                                 ? "bg-green-100 text-green-700 hover:bg-green-200"
//                                 : "bg-red-100 text-red-700 hover:bg-red-200"
//                             } disabled:opacity-50`}
//                           >
//                             {actionLoading === customer._id
//                               ? "..."
//                               : customer.isBlocked
//                                 ? "Unblock"
//                                 : "Block"}
//                           </button>
//                           {/* Toggle Active/Inactive */}
//                           <button
//                             onClick={() =>
//                               handleStatusToggle(
//                                 customer._id,
//                                 customer.isActive ? "active" : "inactive",
//                               )
//                             }
//                             disabled={actionLoading === customer._id}
//                             className={`px-3 py-1 rounded-md text-xs font-semibold ${
//                               customer.isActive
//                                 ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                                 : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
//                             } disabled:opacity-50`}
//                           >
//                             {customer.isActive ? "Deactivate" : "Activate"}
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* ─── PAGINATION ────────────────────────────────── */}
//       {totalPages > 1 && (
//         <div className="flex items-center justify-between mt-6">
//           <div className="text-sm text-gray-600">
//             Page {page} of {totalPages}
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setPage((p) => Math.max(p - 1, 1))}
//               disabled={page === 1}
//               className="px-4 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
//             >
//               Previous
//             </button>
//             <button
//               onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
//               disabled={page === totalPages}
//               className="px-4 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ─── CUSTOMER DETAIL MODAL ──────────────────────── */}
//       <CustomerDetailModal
//         customer={selectedCustomer}
//         isOpen={isModalOpen}
//         onClose={closeModal}
//       />
//     </div>
//   );
// }
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCustomers,
  getCustomerStats,
  blockCustomer,
  unblockCustomer,
  updateCustomerStatus,
} from "../../src/api/adminCustomerApi";

// ─── ICON IMPORTS ──────────────────────────────────────
import {
  Users,
  UserCheck,
  UserX,
  UserMinus,
  Search,
  RefreshCw,
  Eye,
  X,
  Ban,
  Unlock,
  Power,
  PowerOff,
  TrendingUp,
  TrendingDown,
  Mail,
  Phone,
  Calendar,
  MapPin,
} from "lucide-react";

// ─── IMAGE URL HELPER ──────────────────────────────────
const STATIC_BASE =
  import.meta.env.VITE_STATIC_BASE || "http://localhost:9000/api/2026";

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${STATIC_BASE}${cleanPath}`;
};

// ─── STATS CARD ──────────────────────────────────────────
const StatsCard = ({ title, value, icon: Icon, color, change, changeType }) => {
  const gradientMap = {
    blue: "from-blue-50 to-blue-100 border-blue-200",
    green: "from-green-50 to-green-100 border-green-200",
    red: "from-red-50 to-red-100 border-red-200",
    gray: "from-gray-50 to-gray-100 border-gray-200",
    orange: "from-orange-50 to-orange-100 border-orange-200",
  };
  const colorMap = {
    blue: "text-blue-600",
    green: "text-green-600",
    red: "text-red-600",
    gray: "text-gray-600",
    orange: "text-orange-600",
  };
  const bg = gradientMap[color] || gradientMap.gray;
  const textColor = colorMap[color] || colorMap.gray;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm ${bg}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
            {title}
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
};

// ─── SKELETON LOADERS ────────────────────────────────────
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="h-24 p-5 border shadow-sm rounded-2xl border-gray-200/60 bg-white/80 animate-pulse"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="w-24 h-4 bg-gray-200 rounded" />
            <div className="w-16 h-8 mt-2 bg-gray-200 rounded" />
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

const TableSkeleton = () => (
  <div className="overflow-hidden border shadow-lg rounded-3xl border-gray-200/60 bg-white/80 shadow-gray-200/40">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-100/80">
        <thead className="bg-gray-50/50">
          <tr>
            {[
              "Customer",
              "Email",
              "Phone",
              "Status",
              "Blocked",
              "Orders",
              "Actions",
            ].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100/60">
          {[...Array(5)].map((_, i) => (
            <tr key={i} className="animate-pulse">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div>
                    <div className="w-32 h-4 bg-gray-200 rounded" />
                    <div className="w-20 h-3 mt-1 bg-gray-200 rounded" />
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="w-32 h-4 bg-gray-200 rounded" />
              </td>
              <td className="px-4 py-3">
                <div className="w-24 h-4 bg-gray-200 rounded" />
              </td>
              <td className="px-4 py-3">
                <div className="w-16 h-6 bg-gray-200 rounded-full" />
              </td>
              <td className="px-4 py-3">
                <div className="w-16 h-6 bg-gray-200 rounded-full" />
              </td>
              <td className="px-4 py-3">
                <div className="w-8 h-4 bg-gray-200 rounded" />
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded" />
                  <div className="w-8 h-8 bg-gray-200 rounded" />
                  <div className="w-8 h-8 bg-gray-200 rounded" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── CUSTOMER DETAIL MODAL ──────────────────────────────
const CustomerDetailModal = ({ customer, isOpen, onClose }) => {
  if (!isOpen || !customer) return null;

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white/95 p-0 shadow-2xl backdrop-blur-md border border-white/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-white/80 backdrop-blur-sm border-gray-200/80 rounded-t-3xl">
              <div className="flex items-center gap-3">
                {customer.profileImage ? (
                  <img
                    src={getImageUrl(customer.profileImage)}
                    alt={customer.firstName}
                    className="object-cover w-12 h-12 border-2 border-orange-200 rounded-full"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xl ${
                    customer.profileImage ? "hidden" : "flex"
                  }`}
                >
                  {customer.firstName?.[0] || "U"}
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    {customer.firstName} {customer.lastName}
                  </h2>
                  <p className="text-sm text-gray-400">
                    ID: {customer._id.slice(-8)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 transition bg-gray-100 rounded-full hover:bg-gray-200 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Email
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {customer.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Phone
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {customer.phone || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Gender
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {customer.gender || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Date of Birth
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {customer.dateOfBirth
                      ? new Date(customer.dateOfBirth).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100/80">
                <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                  Status:
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    customer.isActive
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${customer.isActive ? "bg-green-500" : "bg-gray-400"}`}
                  />
                  {customer.isActive ? "Active" : "Inactive"}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    customer.isBlocked
                      ? "bg-red-50 text-red-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${customer.isBlocked ? "bg-red-500" : "bg-gray-400"}`}
                  />
                  {customer.isBlocked ? "Blocked" : "Not Blocked"}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    customer.isEmailVerified
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${customer.isEmailVerified ? "bg-emerald-500" : "bg-amber-500"}`}
                  />
                  {customer.isEmailVerified
                    ? "Email Verified"
                    : "Email Unverified"}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100/80">
                <div className="p-3 text-center rounded-xl bg-gray-50/50">
                  <p className="text-2xl font-black text-gray-900">
                    {customer.totalOrders || 0}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Total Orders
                  </p>
                </div>
                <div className="p-3 text-center rounded-xl bg-gray-50/50">
                  <p className="text-2xl font-black text-gray-900">
                    ₹{customer.totalSpent?.toFixed(0) || 0}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Total Spent
                  </p>
                </div>
                <div className="p-3 text-center rounded-xl bg-gray-50/50">
                  <p className="text-2xl font-black text-gray-900">
                    {customer.totalCoins || 0}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Coins
                  </p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="pt-2 space-y-1 text-xs text-gray-400 border-t border-gray-100/80">
                <p>Joined: {formatDate(customer.createdAt)}</p>
                <p>Last Login: {formatDate(customer.lastLoginAt)}</p>
                <p>Last Updated: {formatDate(customer.updatedAt)}</p>
              </div>

              {/* Addresses */}
              {customer.addresses && customer.addresses.length > 0 && (
                <div className="pt-2 border-t border-gray-100/80">
                  <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Saved Addresses
                  </p>
                  <div className="mt-2 space-y-2">
                    {customer.addresses.map((addr, idx) => (
                      <div
                        key={idx}
                        className="p-3 text-sm rounded-xl bg-gray-50/50"
                      >
                        <p className="font-semibold text-gray-800">
                          {addr.label}
                        </p>
                        <p className="text-gray-600">{addr.addressLine}</p>
                        <p className="text-gray-600">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── MAIN COMPONENT ─────────────────────────────────────
export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ─── FETCH DATA ──────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, customersRes] = await Promise.all([
        getCustomerStats(),
        getCustomers({ page, limit, search: searchTerm }),
      ]);
      setStats(statsRes.data);
      setCustomers(customersRes.data.customers);
      setTotalPages(customersRes.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── ACTIONS ──────────────────────────────────────────
  const handleBlock = async (customerId, isBlocked) => {
    if (isBlocked) {
      if (!window.confirm("Unblock this customer?")) return;
      try {
        setActionLoading(customerId);
        await unblockCustomer(customerId);
        await fetchData();
      } catch (error) {
        alert("Failed to unblock customer.");
      } finally {
        setActionLoading(null);
      }
    } else {
      const reason = prompt("Reason for blocking (optional):");
      if (reason === null) return;
      try {
        setActionLoading(customerId);
        await blockCustomer(customerId, reason);
        await fetchData();
      } catch (error) {
        alert("Failed to block customer.");
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleStatusToggle = async (customerId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    if (!window.confirm(`Set status to "${newStatus}"?`)) return;
    try {
      setActionLoading(customerId);
      await updateCustomerStatus(customerId, newStatus);
      await fetchData();
    } catch (error) {
      alert("Failed to update status.");
    } finally {
      setActionLoading(null);
    }
  };

  // ─── OPEN MODAL ──────────────────────────────────────
  const openModal = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  // ─── SEARCH ────────────────────────────────────────────
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setPage(1);
  };

  // ─── RENDER ────────────────────────────────────────────
  return (
    <div className="p-4 mx-auto space-y-6 max-w-7xl sm:p-6">
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-black sm:text-3xl">
            Customer Management
          </h1>
          <p className="mt-1 text-sm text-geray-100">
            View and manage all registered customers.
          </p>
        </div>
        <button
          onClick={() => fetchData()}
          className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/30 hover:scale-105"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
        {/* ─── HEADER ─────────────────────────────────────────── */}
        <div className="relative p-6 overflow-hidden shadow-xl rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-500/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        </div>
      </div>

      {/* ─── STATS ───────────────────────────────────────────── */}
      {loading && !stats ? (
        <StatsSkeleton />
      ) : (
        stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              title="Total Customers"
              value={stats.total}
              icon={Users}
              color="blue"
              change="+12%"
              changeType="up"
            />
            <StatsCard
              title="Active"
              value={stats.active}
              icon={UserCheck}
              color="green"
              change="+8%"
              changeType="up"
            />
            <StatsCard
              title="Blocked"
              value={stats.blocked}
              icon={UserX}
              color="red"
              change="-2%"
              changeType="down"
            />
            <StatsCard
              title="Inactive"
              value={stats.inactive}
              icon={UserMinus}
              color="gray"
              change="+3%"
              changeType="down"
            />
          </div>
        )
      )}

      {/* ─── SEARCH & FILTER ────────────────────────────────── */}
      <section className="p-4 border shadow-lg rounded-3xl border-gray-200/60 bg-white/80 shadow-gray-200/40 backdrop-blur-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-4 top-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pr-10 text-sm transition border border-gray-200 outline-none h-11 rounded-xl bg-gray-50/50 pl-11 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="text-sm text-gray-400 whitespace-nowrap">
            {customers.length} customers
          </div>
        </div>
      </section>

      {/* ─── TABLE ──────────────────────────────────────────── */}
      {loading && customers.length === 0 ? (
        <TableSkeleton />
      ) : (
        <div className="overflow-hidden border shadow-lg rounded-3xl border-gray-200/60 bg-white/80 shadow-gray-200/40">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100/80">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Blocked
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Orders
                  </th>
                  {/* Sticky Actions Column */}
                  <th className="sticky right-0 z-10 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 backdrop-blur-sm border-l border-gray-200/60">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100/60">
                <AnimatePresence>
                  {customers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-12 text-center text-gray-400"
                      >
                        <div className="flex flex-col items-center">
                          <Users className="w-12 h-12 text-gray-300" />
                          <p className="mt-2 text-sm">No customers found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer, index) => (
                      <motion.tr
                        key={customer._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ delay: index * 0.03, duration: 0.2 }}
                        className="transition-colors cursor-pointer group hover:bg-orange-50/40"
                        onClick={() => openModal(customer)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {customer.profileImage ? (
                              <img
                                src={getImageUrl(customer.profileImage)}
                                alt={customer.firstName}
                                className="object-cover w-10 h-10 border-2 border-white rounded-full shadow-sm"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className={`h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm ${
                                customer.profileImage ? "hidden" : "flex"
                              }`}
                            >
                              {customer.firstName?.[0] || "U"}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-gray-900 truncate">
                                {customer.firstName} {customer.lastName}
                              </div>
                              <div className="text-xs text-gray-400">
                                ID: {customer._id.slice(-6)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[150px]">
                          {customer.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {customer.phone || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              customer.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                customer.isActive
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              }`}
                            />
                            {customer.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {customer.isBlocked ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-red-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              Blocked
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-700">
                          {customer.totalOrders || 0}
                        </td>
                        <td className="sticky right-0 z-10 px-4 py-3 border-l bg-white/80 backdrop-blur-sm border-gray-200/60">
                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Block/Unblock */}
                            <button
                              onClick={() =>
                                handleBlock(customer._id, customer.isBlocked)
                              }
                              disabled={actionLoading === customer._id}
                              className={`p-1.5 rounded-lg transition ${
                                customer.isBlocked
                                  ? "text-green-600 hover:bg-green-50"
                                  : "text-red-500 hover:bg-red-50"
                              } disabled:opacity-50`}
                              title={customer.isBlocked ? "Unblock" : "Block"}
                            >
                              {actionLoading === customer._id ? (
                                <div className="w-4 h-4 border-2 border-orange-500 rounded-full animate-spin border-t-transparent" />
                              ) : customer.isBlocked ? (
                                <Unlock className="w-4 h-4" />
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
                            </button>
                            {/* Toggle Active/Inactive */}
                            <button
                              onClick={() =>
                                handleStatusToggle(
                                  customer._id,
                                  customer.isActive ? "active" : "inactive",
                                )
                              }
                              disabled={actionLoading === customer._id}
                              className={`p-1.5 rounded-lg transition ${
                                customer.isActive
                                  ? "text-gray-400 hover:bg-gray-100"
                                  : "text-amber-500 hover:bg-amber-50"
                              } disabled:opacity-50`}
                              title={
                                customer.isActive ? "Deactivate" : "Activate"
                              }
                            >
                              {customer.isActive ? (
                                <Power className="w-4 h-4" />
                              ) : (
                                <PowerOff className="w-4 h-4" />
                              )}
                            </button>
                            {/* View Details */}
                            <button
                              onClick={() => openModal(customer)}
                              className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
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
      )}

      {/* ─── PAGINATION ────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-400">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-600 transition border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-600 transition border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ─── CUSTOMER DETAIL MODAL ──────────────────────── */}
      <CustomerDetailModal
        customer={selectedCustomer}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
