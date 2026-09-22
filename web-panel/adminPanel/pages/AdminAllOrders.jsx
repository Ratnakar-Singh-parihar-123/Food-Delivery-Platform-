// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Search,
//   X,
//   Eye,
//   Filter,
//   ChevronDown,
//   ChevronUp,
//   LoaderCircle,
//   AlertCircle,
//   CheckCircle,
//   Clock,
//   Package,
//   Truck,
//   User,
//   MapPin,
//   Phone,
//   IndianRupee,
//   Calendar,
//   RefreshCw,
//   MoreVertical,
//   Check,
//   XCircle,
//   ShoppingBag,
//   Store,
// } from "lucide-react";
// import {
//   getAdminOrders,
//   getAdminOrderDetails,
//   updateAdminOrderStatus,
//   assignAdminOrderRider,
//   cancelAdminOrder,
// } from "../../src/api/adminApi";
// import { format } from "date-fns";

// // ─── Helper: Build Image URL ──────────────────────────────
// const STATIC_BASE = "https://myfoodmitra-ecosystem.onrender.com";

// const buildImageUrl = (path) => {
//   if (!path) return null;
//   if (path.startsWith("http://") || path.startsWith("https://")) return path;
//   return path.startsWith("/")
//     ? `${STATIC_BASE}${path}`
//     : `${STATIC_BASE}/${path}`;
// };

// // ─── Status Configuration ────────────────────────────────────
// const STATUS_CONFIG = {
//   placed: {
//     label: "Placed",
//     color: "bg-blue-50 text-blue-600 border-blue-200",
//     icon: Clock,
//   },
//   confirmed: {
//     label: "Confirmed",
//     color: "bg-indigo-50 text-indigo-600 border-indigo-200",
//     icon: CheckCircle,
//   },
//   preparing: {
//     label: "Preparing",
//     color: "bg-purple-50 text-purple-600 border-purple-200",
//     icon: Package,
//   },
//   ready_for_pickup: {
//     label: "Ready for Pickup",
//     color: "bg-green-50 text-green-600 border-green-200",
//     icon: Package,
//   },
//   rider_assigned: {
//     label: "Rider Assigned",
//     color: "bg-cyan-50 text-cyan-600 border-cyan-200",
//     icon: User,
//   },
//   picked_up: {
//     label: "Picked Up",
//     color: "bg-orange-50 text-orange-600 border-orange-200",
//     icon: Truck,
//   },
//   on_the_way: {
//     label: "On the Way",
//     color: "bg-amber-50 text-amber-600 border-amber-200",
//     icon: Truck,
//   },
//   delivered: {
//     label: "Delivered",
//     color: "bg-green-100 text-green-700 border-green-200",
//     icon: CheckCircle,
//   },
//   cancelled: {
//     label: "Cancelled",
//     color: "bg-red-50 text-red-600 border-red-200",
//     icon: XCircle,
//   },
//   rejected: {
//     label: "Rejected",
//     color: "bg-gray-50 text-gray-500 border-gray-200",
//     icon: XCircle,
//   },
// };

// function StatusBadge({ status }) {
//   const config = STATUS_CONFIG[status] || STATUS_CONFIG.placed;
//   const Icon = config.icon;
//   return (
//     <span
//       className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${config.color}`}
//     >
//       <Icon className="w-3 h-3" />
//       {config.label}
//     </span>
//   );
// }

// function StatCard({ label, value, color }) {
//   const colorMap = {
//     gray: "bg-gray-50 text-gray-500",
//     amber: "bg-amber-50 text-amber-600",
//     purple: "bg-purple-50 text-purple-600",
//     green: "bg-green-50 text-green-600",
//     emerald: "bg-emerald-50 text-emerald-600",
//     red: "bg-red-50 text-red-600",
//   };
//   const bgColor = colorMap[color] || colorMap.gray;
//   return (
//     <div className="px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl">
//       <p className="text-xs font-medium text-gray-400">{label}</p>
//       <p className={`text-xl font-black ${bgColor.split(" ")[0]}`}>{value}</p>
//     </div>
//   );
// }

// function OrderDetailModal({ order, onClose, onUpdateStatus }) {
//   const [loading, setLoading] = useState(false);
//   const [status, setStatus] = useState(order?.status || "");
//   const [note, setNote] = useState("");

//   if (!order) return null;

//   const vendorImage = buildImageUrl(order.vendor?.profileImage);
//   const statusOptions = Object.keys(STATUS_CONFIG);

//   const handleStatusUpdate = async () => {
//     if (status === order.status) return;
//     setLoading(true);
//     try {
//       await onUpdateStatus(order._id, status, note);
//       onClose();
//     } catch (err) {
//       console.error("Status update failed:", err);
//       alert("Failed to update order status");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{ scale: 0.95, opacity: 0, y: 20 }}
//         animate={{ scale: 1, opacity: 1, y: 0 }}
//         exit={{ scale: 0.95, opacity: 0, y: 20 }}
//         transition={{ type: "spring", damping: 25 }}
//         className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-6"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 z-10 rounded-full bg-gray-100 p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
//         >
//           <X className="w-4 h-4" />
//         </button>

//         {/* ─── Header with Vendor Image ─── */}
//         <div className="flex items-start justify-between gap-4 mb-4">
//           <div className="flex items-center gap-3">
//             {vendorImage ? (
//               <img
//                 src={vendorImage}
//                 alt={order.vendor?.businessName}
//                 className="object-cover w-12 h-12 border-2 border-orange-200 rounded-full"
//               />
//             ) : (
//               <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
//                 <Store className="w-6 h-6 text-orange-500" />
//               </div>
//             )}
//             <div>
//               <h2 className="text-xl font-bold text-gray-900">
//                 {order.vendor?.businessName || "Vendor"}
//               </h2>
//               <div className="flex items-center gap-2 mt-1">
//                 <StatusBadge status={order.status} />
//                 <span className="text-xs text-gray-400">
//                   #{order.orderNumber}
//                 </span>
//               </div>
//             </div>
//           </div>
//           <div className="text-right">
//             <p className="text-sm font-medium text-gray-500">Total</p>
//             <p className="text-xl font-black text-orange-600">
//               ₹{order.pricing?.grandTotal}
//             </p>
//           </div>
//         </div>

//         {/* ─── Status Update ─── */}
//         <div className="p-4 mb-4 border border-gray-200 bg-gray-50 rounded-xl">
//           <div className="flex items-end gap-3">
//             <div className="flex-1">
//               <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">
//                 Update Status
//               </label>
//               <select
//                 value={status}
//                 onChange={(e) => setStatus(e.target.value)}
//                 className="w-full px-3 py-2 mt-1 text-sm bg-white border border-gray-200 outline-none rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
//               >
//                 {statusOptions.map((s) => (
//                   <option key={s} value={s}>
//                     {STATUS_CONFIG[s].label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="flex-1">
//               <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">
//                 Note (optional)
//               </label>
//               <input
//                 type="text"
//                 value={note}
//                 onChange={(e) => setNote(e.target.value)}
//                 placeholder="Add a note..."
//                 className="w-full px-3 py-2 mt-1 text-sm border border-gray-200 outline-none rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
//               />
//             </div>
//             <button
//               onClick={handleStatusUpdate}
//               disabled={loading || status === order.status}
//               className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? (
//                 <LoaderCircle className="w-4 h-4 animate-spin" />
//               ) : (
//                 <Check className="w-4 h-4" />
//               )}
//               Update
//             </button>
//           </div>
//         </div>

//         {/* ─── Info Cards ─── */}
//         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//           <div className="p-4 border border-gray-200 rounded-xl">
//             <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
//               <User className="w-3.5 h-3.5" />
//               Customer
//             </div>
//             <p className="mt-1 text-sm font-bold text-gray-900">
//               {order.customer?.firstName} {order.customer?.lastName}
//             </p>
//             <p className="text-sm text-gray-500">{order.customer?.phone}</p>
//             <p className="text-sm text-gray-500">{order.customer?.email}</p>
//           </div>

//           <div className="p-4 border border-gray-200 rounded-xl">
//             <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
//               <Store className="w-3.5 h-3.5" />
//               Vendor
//             </div>
//             <p className="mt-1 text-sm font-bold text-gray-900">
//               {order.vendor?.businessName}
//             </p>
//             <p className="text-sm text-gray-500">
//               {order.vendor?.address?.city}, {order.vendor?.address?.state}
//             </p>
//           </div>

//           <div className="p-4 border border-gray-200 rounded-xl">
//             <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
//               <Truck className="w-3.5 h-3.5" />
//               Rider
//             </div>
//             {order.rider ? (
//               <>
//                 <p className="mt-1 text-sm font-bold text-gray-900">
//                   {order.rider.firstName} {order.rider.lastName}
//                 </p>
//                 <p className="text-sm text-gray-500">{order.rider.phone}</p>
//               </>
//             ) : (
//               <p className="mt-1 text-sm text-amber-500">No rider assigned</p>
//             )}
//           </div>

//           <div className="p-4 border border-gray-200 rounded-xl">
//             <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
//               <MapPin className="w-3.5 h-3.5" />
//               Delivery Address
//             </div>
//             <p className="mt-1 text-sm font-medium text-gray-800">
//               {order.deliveryAddress?.addressLine}
//             </p>
//             <p className="text-sm text-gray-500">
//               {order.deliveryAddress?.city}, {order.deliveryAddress?.state} -{" "}
//               {order.deliveryAddress?.pincode}
//             </p>
//             <p className="text-sm text-gray-500">
//               Phone: {order.deliveryAddress?.phone}
//             </p>
//           </div>
//         </div>

//         {/* ─── Order Items with Images ─── */}
//         <div className="mt-4">
//           <h4 className="mb-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
//             Order Items
//           </h4>
//           <div className="border border-gray-200 divide-y divide-gray-100 rounded-xl bg-gray-50/50">
//             {order.items?.map((item, idx) => {
//               const itemImage = buildImageUrl(item.image);
//               return (
//                 <div
//                   key={item._id || idx}
//                   className="flex items-center gap-3 px-4 py-2.5"
//                 >
//                   {itemImage ? (
//                     <img
//                       src={itemImage}
//                       alt={item.name}
//                       className="object-cover w-12 h-12 border border-gray-200 rounded-lg"
//                     />
//                   ) : (
//                     <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-lg">
//                       <Package className="w-5 h-5 text-gray-400" />
//                     </div>
//                   )}
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2">
//                       <span className="text-sm font-medium text-gray-600">
//                         {item.quantity}×
//                       </span>
//                       <span className="text-sm font-medium text-gray-900">
//                         {item.name}
//                       </span>
//                     </div>
//                     {item.variant && Object.keys(item.variant).length > 0 && (
//                       <p className="text-xs text-gray-500">
//                         {Object.entries(item.variant)
//                           .map(([k, v]) => `${k}: ${v}`)
//                           .join(", ")}
//                       </p>
//                     )}
//                   </div>
//                   <span className="text-sm font-bold text-gray-900">
//                     ₹{item.totalPrice}
//                   </span>
//                 </div>
//               );
//             })}
//             <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-200 bg-white rounded-b-xl">
//               <span className="text-sm font-bold text-gray-900">Total</span>
//               <span className="text-base font-black text-orange-600">
//                 ₹{order.pricing?.grandTotal}
//               </span>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // ─── Main Component ──────────────────────────────────────────

// export default function AdminAllOrders() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);

//   const fetchOrders = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError("");
//       const response = await getAdminOrders({ limit: 100 });
//       setOrders(response.data.orders || []);
//     } catch (err) {
//       console.error("Failed to fetch orders:", err);
//       setError(err?.response?.data?.message || "Failed to load orders");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchOrders();
//   }, [fetchOrders]);

//   const filteredOrders = useMemo(() => {
//     let result = orders;
//     if (statusFilter !== "all") {
//       result = result.filter((o) => o.status === statusFilter);
//     }
//     if (searchQuery.trim()) {
//       const q = searchQuery.trim().toLowerCase();
//       result = result.filter(
//         (o) =>
//           o.orderNumber?.toLowerCase().includes(q) ||
//           o.customer?.firstName?.toLowerCase().includes(q) ||
//           o.customer?.lastName?.toLowerCase().includes(q) ||
//           o.vendor?.businessName?.toLowerCase().includes(q),
//       );
//     }
//     return result;
//   }, [orders, statusFilter, searchQuery]);

//   const handleRefresh = () => {
//     setRefreshing(true);
//     fetchOrders();
//   };

//   const handleViewOrder = async (orderId) => {
//     try {
//       const response = await getAdminOrderDetails(orderId);
//       setSelectedOrder(response.data.order);
//     } catch (err) {
//       console.error("Failed to fetch order details:", err);
//       alert("Failed to load order details");
//     }
//   };

//   const handleUpdateStatus = async (orderId, status, note) => {
//     try {
//       await updateAdminOrderStatus(orderId, status, note);
//       await fetchOrders();
//       setSelectedOrder(null);
//     } catch (err) {
//       console.error("Failed to update order status:", err);
//       alert("Failed to update order status");
//     }
//   };

//   const stats = useMemo(() => {
//     const total = orders.length;
//     const pending = orders.filter(
//       (o) => o.status === "placed" || o.status === "confirmed",
//     ).length;
//     const preparing = orders.filter((o) => o.status === "preparing").length;
//     const ready = orders.filter((o) => o.status === "ready_for_pickup").length;
//     const delivered = orders.filter((o) => o.status === "delivered").length;
//     const cancelled = orders.filter(
//       (o) => o.status === "cancelled" || o.status === "rejected",
//     ).length;
//     return { total, pending, preparing, ready, delivered, cancelled };
//   }, [orders]);

//   if (loading && orders.length === 0) {
//     return (
//       <div className="flex min-h-[400px] items-center justify-center">
//         <LoaderCircle className="w-8 h-8 text-orange-500 animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="px-4 py-6 mx-auto space-y-6 max-w-7xl">
//       {/* Header */}
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
//           <p className="text-sm text-gray-400">
//             View and manage all orders across the platform
//           </p>
//         </div>
//         <div className="flex items-center gap-3">
//           <button
//             onClick={handleRefresh}
//             disabled={refreshing}
//             className="p-2 text-gray-400 transition rounded-xl hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
//           >
//             <RefreshCw
//               className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
//             />
//           </button>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
//         <StatCard label="Total" value={stats.total} color="gray" />
//         <StatCard label="Pending" value={stats.pending} color="amber" />
//         <StatCard label="Preparing" value={stats.preparing} color="purple" />
//         <StatCard label="Ready" value={stats.ready} color="green" />
//         <StatCard label="Delivered" value={stats.delivered} color="emerald" />
//         <StatCard label="Cancelled" value={stats.cancelled} color="red" />
//       </div>

//       {/* Filters */}
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
//         <div className="relative flex-1">
//           <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <input
//             type="text"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder="Search by order ID, customer, vendor..."
//             className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
//           />
//           {searchQuery && (
//             <button
//               onClick={() => setSearchQuery("")}
//               className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//             >
//               <X className="w-4 h-4" />
//             </button>
//           )}
//         </div>
//         <select
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//           className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
//         >
//           <option value="all">All Statuses</option>
//           {Object.entries(STATUS_CONFIG).map(([key, config]) => (
//             <option key={key} value={key}>
//               {config.label}
//             </option>
//           ))}
//         </select>
//         <div className="text-xs text-gray-400">
//           {filteredOrders.length} orders found
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead className="border-b border-gray-100 bg-gray-50/80">
//               <tr>
//                 <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
//                   Order ID
//                 </th>
//                 <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
//                   Customer
//                 </th>
//                 <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
//                   Vendor
//                 </th>
//                 <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
//                   Total
//                 </th>
//                 <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
//                   Status
//                 </th>
//                 <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
//                   Items
//                 </th>
//                 <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
//                   Action
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               <AnimatePresence>
//                 {filteredOrders.length === 0 ? (
//                   <tr>
//                     <td colSpan="7">
//                       <div className="flex items-center justify-center py-12 text-gray-400">
//                         <AlertCircle className="w-5 h-5 mr-2" />
//                         No orders found
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredOrders.map((order) => (
//                     <motion.tr
//                       key={order._id}
//                       initial={{ opacity: 0, y: 8 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: -8 }}
//                       transition={{ duration: 0.2 }}
//                       className="transition-colors cursor-pointer hover:bg-gray-50/50"
//                       onClick={() => handleViewOrder(order._id)}
//                     >
//                       <td className="px-4 py-3">
//                         <span className="font-mono text-xs font-bold text-gray-900">
//                           {order.orderNumber}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className="text-sm font-medium text-gray-900">
//                           {order.customer?.firstName} {order.customer?.lastName}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className="text-sm text-gray-600">
//                           {order.vendor?.businessName}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className="font-bold text-gray-900">
//                           ₹{order.pricing?.grandTotal}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <StatusBadge status={order.status} />
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className="text-xs text-gray-500">
//                           {order.items?.length || 0} items
//                         </span>
//                       </td>
//                       <td className="px-4 py-3 text-right">
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleViewOrder(order._id);
//                           }}
//                           className="p-1.5 text-orange-500 transition-colors rounded-lg hover:bg-orange-50"
//                           title="View details"
//                         >
//                           <Eye className="w-4 h-4" />
//                         </button>
//                       </td>
//                     </motion.tr>
//                   ))
//                 )}
//               </AnimatePresence>
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Modal */}
//       <AnimatePresence>
//         {selectedOrder && (
//           <OrderDetailModal
//             order={selectedOrder}
//             onClose={() => setSelectedOrder(null)}
//             onUpdateStatus={handleUpdateStatus}
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Eye,
  Filter,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
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
  RefreshCw,
  MoreVertical,
  Check,
  XCircle,
  ShoppingBag,
  Store,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  getAdminOrders,
  getAdminOrderDetails,
  updateAdminOrderStatus,
  assignAdminOrderRider,
  cancelAdminOrder,
} from "../../src/api/adminApi";
import { format } from "date-fns";

// ─── Helper: Build Image URL ──────────────────────────────
const STATIC_BASE = "https://myfoodmitra-ecosystem.onrender.com";

const buildImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return path.startsWith("/")
    ? `${STATIC_BASE}${path}`
    : `${STATIC_BASE}/${path}`;
};

// ─── Status Configuration ────────────────────────────────────
const STATUS_CONFIG = {
  placed: {
    label: "Placed",
    color: "bg-blue-50 text-blue-600 border-blue-200",
    icon: Clock,
    gradient: "from-blue-50 to-blue-100",
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-indigo-50 text-indigo-600 border-indigo-200",
    icon: CheckCircle,
    gradient: "from-indigo-50 to-indigo-100",
  },
  preparing: {
    label: "Preparing",
    color: "bg-purple-50 text-purple-600 border-purple-200",
    icon: Package,
    gradient: "from-purple-50 to-purple-100",
  },
  ready_for_pickup: {
    label: "Ready for Pickup",
    color: "bg-green-50 text-green-600 border-green-200",
    icon: Package,
    gradient: "from-green-50 to-green-100",
  },
  rider_assigned: {
    label: "Rider Assigned",
    color: "bg-cyan-50 text-cyan-600 border-cyan-200",
    icon: User,
    gradient: "from-cyan-50 to-cyan-100",
  },
  picked_up: {
    label: "Picked Up",
    color: "bg-orange-50 text-orange-600 border-orange-200",
    icon: Truck,
    gradient: "from-orange-50 to-orange-100",
  },
  on_the_way: {
    label: "On the Way",
    color: "bg-amber-50 text-amber-600 border-amber-200",
    icon: Truck,
    gradient: "from-amber-50 to-amber-100",
  },
  delivered: {
    label: "Delivered",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
    gradient: "from-emerald-50 to-emerald-100",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-50 text-red-600 border-red-200",
    icon: XCircle,
    gradient: "from-red-50 to-red-100",
  },
  rejected: {
    label: "Rejected",
    color: "bg-gray-50 text-gray-500 border-gray-200",
    icon: XCircle,
    gradient: "from-gray-50 to-gray-100",
  },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.placed;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm ${config.color}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// ─── Enhanced Stat Card ────────────────────────────────────
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

// ─── Order Detail Modal ──────────────────────────────────
function OrderDetailModal({ order, onClose, onUpdateStatus }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(order?.status || "");
  const [note, setNote] = useState("");

  if (!order) return null;

  const vendorImage = buildImageUrl(order.vendor?.profileImage);
  const statusOptions = Object.keys(STATUS_CONFIG);

  const handleStatusUpdate = async () => {
    if (status === order.status) return;
    setLoading(true);
    try {
      await onUpdateStatus(order._id, status, note);
      onClose();
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update order status");
    } finally {
      setLoading(false);
    }
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
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-white/30"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute z-10 p-2 text-gray-400 transition rounded-full shadow-sm top-4 right-4 bg-white/80 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Vendor Image and Order Summary */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              {vendorImage ? (
                <img
                  src={vendorImage}
                  alt={order.vendor?.businessName}
                  className="object-cover w-16 h-16 border-2 border-orange-200 shadow-md rounded-2xl"
                />
              ) : (
                <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl">
                  <Store className="w-8 h-8 text-orange-500" />
                </div>
              )}
              <div className="absolute p-1 bg-green-500 border-2 border-white rounded-full -bottom-1 -right-1">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {order.vendor?.businessName || "Vendor"}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <StatusBadge status={order.status} />
                <span className="font-mono text-sm text-gray-400">
                  #{order.orderNumber}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-400">Total Amount</p>
            <p className="text-2xl font-black text-orange-600">
              ₹{order.pricing?.grandTotal}
            </p>
          </div>
        </div>

        {/* Status Update Panel */}
        <div className="p-4 mt-6 border shadow-sm bg-white/60 backdrop-blur-sm rounded-2xl border-gray-200/60">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 mt-1 text-sm bg-white border border-gray-200 outline-none rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_CONFIG[s].label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-1">
              <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                Note
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note..."
                className="w-full px-3 py-2 mt-1 text-sm bg-white border border-gray-200 outline-none rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div className="flex items-end justify-end">
              <button
                onClick={handleStatusUpdate}
                disabled={loading || status === order.status}
                className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-bold text-white transition shadow-sm rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2">
          <div className="p-4 border bg-white/60 backdrop-blur-sm rounded-2xl border-gray-200/60">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
              <User className="w-4 h-4" />
              Customer
            </div>
            <p className="mt-1 text-sm font-bold text-gray-900">
              {order.customer?.firstName} {order.customer?.lastName}
            </p>
            <p className="text-sm text-gray-500">{order.customer?.phone}</p>
            <p className="text-sm text-gray-500">{order.customer?.email}</p>
          </div>

          <div className="p-4 border bg-white/60 backdrop-blur-sm rounded-2xl border-gray-200/60">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
              <Store className="w-4 h-4" />
              Vendor
            </div>
            <div className="flex items-center gap-2 mt-1">
              {vendorImage ? (
                <img
                  src={vendorImage}
                  alt={order.vendor?.businessName}
                  className="object-cover w-8 h-8 border border-gray-200 rounded-full"
                />
              ) : (
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
                  <Store className="w-4 h-4 text-gray-500" />
                </div>
              )}
              <span className="text-sm font-bold text-gray-900">
                {order.vendor?.businessName}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {order.vendor?.address?.city}, {order.vendor?.address?.state}
            </p>
          </div>

          <div className="p-4 border bg-white/60 backdrop-blur-sm rounded-2xl border-gray-200/60">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
              <Truck className="w-4 h-4" />
              Rider
            </div>
            {order.rider ? (
              <>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  {order.rider.firstName} {order.rider.lastName}
                </p>
                <p className="text-sm text-gray-500">{order.rider.phone}</p>
              </>
            ) : (
              <p className="mt-1 text-sm text-amber-500">No rider assigned</p>
            )}
          </div>

          <div className="p-4 border bg-white/60 backdrop-blur-sm rounded-2xl border-gray-200/60">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
              <MapPin className="w-4 h-4" />
              Delivery Address
            </div>
            <p className="mt-1 text-sm font-medium text-gray-800">
              {order.deliveryAddress?.addressLine}
            </p>
            <p className="text-sm text-gray-500">
              {order.deliveryAddress?.city}, {order.deliveryAddress?.state} -{" "}
              {order.deliveryAddress?.pincode}
            </p>
            <p className="text-sm text-gray-500">
              Phone: {order.deliveryAddress?.phone}
            </p>
          </div>
        </div>

        {/* Order Items with Images */}
        <div className="mt-6">
          <h4 className="text-xs font-bold tracking-wider text-gray-400 uppercase">
            Order Items
          </h4>
          <div className="mt-2 overflow-hidden border rounded-2xl border-gray-200/60 bg-white/60 backdrop-blur-sm">
            <div className="divide-y divide-gray-100/80">
              {order.items?.map((item, idx) => {
                const itemImage = buildImageUrl(item.image);
                return (
                  <div
                    key={item._id || idx}
                    className="flex items-center gap-4 px-4 py-3"
                  >
                    {itemImage ? (
                      <img
                        src={itemImage}
                        alt={item.name}
                        className="object-cover border border-gray-200 h-14 w-14 rounded-xl"
                      />
                    ) : (
                      <div className="flex items-center justify-center bg-gray-100 h-14 w-14 rounded-xl">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">
                          {item.quantity}×
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {item.name}
                        </span>
                      </div>
                      {item.variant && Object.keys(item.variant).length > 0 && (
                        <p className="text-xs text-gray-500">
                          {Object.entries(item.variant)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      ₹{item.totalPrice}
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50">
                <span className="text-sm font-bold text-gray-900">Total</span>
                <span className="text-lg font-black text-orange-600">
                  ₹{order.pricing?.grandTotal}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────

export default function AdminAllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminOrders({ limit: 100 });
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError(err?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber?.toLowerCase().includes(q) ||
          o.customer?.firstName?.toLowerCase().includes(q) ||
          o.customer?.lastName?.toLowerCase().includes(q) ||
          o.vendor?.businessName?.toLowerCase().includes(q),
      );
    }
    return result;
  }, [orders, statusFilter, searchQuery]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await getAdminOrderDetails(orderId);
      setSelectedOrder(response.data.order);
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      alert("Failed to load order details");
    }
  };

  const handleUpdateStatus = async (orderId, status, note) => {
    try {
      await updateAdminOrderStatus(orderId, status, note);
      await fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status");
    }
  };

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(
      (o) => o.status === "placed" || o.status === "confirmed",
    ).length;
    const preparing = orders.filter((o) => o.status === "preparing").length;
    const ready = orders.filter((o) => o.status === "ready_for_pickup").length;
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const cancelled = orders.filter(
      (o) => o.status === "cancelled" || o.status === "rejected",
    ).length;
    return { total, pending, preparing, ready, delivered, cancelled };
  }, [orders]);

  if (loading && orders.length === 0) {
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
    <div className="px-4 py-6 mx-auto space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            All Orders
          </h1>
          <p className="text-sm text-gray-400">
            View and manage all orders across the platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 text-gray-400 transition-all rounded-2xl hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        <StatCard
          label="Total Orders"
          value={stats.total}
          icon={ShoppingBag}
          color="gray"
          change="+8%"
          changeType="up"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={Clock}
          color="amber"
          change="-2%"
          changeType="down"
        />
        <StatCard
          label="Preparing"
          value={stats.preparing}
          icon={Package}
          color="purple"
          change="+5%"
          changeType="up"
        />
        <StatCard
          label="Ready"
          value={stats.ready}
          icon={CheckCircle}
          color="green"
          change="+12%"
          changeType="up"
        />
        <StatCard
          label="Delivered"
          value={stats.delivered}
          icon={Truck}
          color="emerald"
          change="+18%"
          changeType="up"
        />
        <StatCard
          label="Cancelled"
          value={stats.cancelled}
          icon={XCircle}
          color="red"
          change="+3%"
          changeType="down"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID, customer, or vendor..."
            className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
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
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>
        <div className="text-xs text-gray-400">
          {filteredOrders.length} orders found
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden border shadow-lg bg-white/80 backdrop-blur-sm border-gray-200/60 shadow-gray-200/40 rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50/50 border-gray-200/60">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Vendor
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Items
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60">
              <AnimatePresence>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div className="flex items-center justify-center py-12 text-gray-400">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        No orders found
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="transition-colors cursor-pointer group hover:bg-orange-50/40"
                      onClick={() => handleViewOrder(order._id)}
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-gray-900">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center text-xs font-bold text-gray-600 bg-gray-100 rounded-full h-7 w-7">
                            {order.customer?.firstName?.charAt(0) || "U"}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {order.customer?.firstName}{" "}
                            {order.customer?.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {order.vendor?.businessName}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-gray-900">
                          ₹{order.pricing?.grandTotal}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">
                          {order.items?.length || 0} items
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOrder(order._id);
                          }}
                          className="p-2 text-orange-500 transition-all rounded-xl hover:bg-orange-100 hover:scale-110"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
