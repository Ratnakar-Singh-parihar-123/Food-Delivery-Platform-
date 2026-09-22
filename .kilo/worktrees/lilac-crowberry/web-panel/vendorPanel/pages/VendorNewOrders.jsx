import { useEffect, useState, useRef } from "react";
import {
  ShoppingBag,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  LoaderCircle,
  Send,
  Eye,
  TrendingUp,
  TrendingDown,
  Package,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";

import {
  getVendorLiveOrdersApi,
  acceptVendorOrderApi,
  rejectVendorOrderApi,
  updateVendorOrderStatusApi,
} from "../../src/api/vendorApi";

// ─── Helper to format currency ────────────────────────────
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

// ─── Status Config ──────────────────────────────────────────
const STATUS_CONFIG = {
  placed: {
    label: "Placed",
    color: "bg-blue-50 text-blue-600 border-blue-200",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-indigo-50 text-indigo-600 border-indigo-200",
    icon: CheckCircle,
  },
  preparing: {
    label: "Preparing",
    color: "bg-purple-50 text-purple-600 border-purple-200",
    icon: Package,
  },
  ready_for_pickup: {
    label: "Ready",
    color: "bg-green-50 text-green-600 border-green-200",
    icon: Package,
  },
  rider_assigned: {
    label: "Assigned",
    color: "bg-cyan-50 text-cyan-600 border-cyan-200",
    icon: User,
  },
  picked_up: {
    label: "Picked Up",
    color: "bg-orange-50 text-orange-600 border-orange-200",
    icon: ShoppingBag,
  },
  on_the_way: {
    label: "On the Way",
    color: "bg-amber-50 text-amber-600 border-amber-200",
    icon: Clock,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-50 text-red-600 border-red-200",
    icon: XCircle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-gray-50 text-gray-500 border-gray-200",
    icon: XCircle,
  },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.placed;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${config.color}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function LiveOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  // ─── Fetch orders ──────────────────────────────────────
  const fetchOrders = async () => {
    try {
      const res = await getVendorLiveOrdersApi();
      const fetchedOrders = res.data.orders || [];
      const sorted = fetchedOrders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setOrders(sorted);
    } catch (err) {
      setError("Failed to load live orders. Please refresh.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  // ─── Accept order ──────────────────────────────────────
  const handleAccept = async (orderId) => {
    try {
      setActionLoading(true);
      await acceptVendorOrderApi(orderId);
      await fetchOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(null);
        setShowDetailModal(false);
      }
    } catch (err) {
      setError("Failed to accept order. Please try again.");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Open reject modal ──────────────────────────────────
  const openRejectModal = (order) => {
    setSelectedOrder(order);
    setRejectReason("");
    setRejectError("");
    setShowRejectModal(true);
  };

  // ─── Submit reject ──────────────────────────────────────
  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      setRejectError("Please provide a reason for rejection.");
      return;
    }
    if (rejectReason.trim().length < 5) {
      setRejectError("Reason must be at least 5 characters.");
      return;
    }

    try {
      setActionLoading(true);
      await rejectVendorOrderApi(selectedOrder._id, rejectReason.trim());
      await fetchOrders();
      setShowRejectModal(false);
      setSelectedOrder(null);
      setRejectReason("");
    } catch (err) {
      setError("Failed to reject order. Please try again.");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Open detail modal ──────────────────────────────────
  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  // ─── Stats ──────────────────────────────────────────────
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "placed").length;
  const acceptedOrders = orders.filter(
    (o) => o.status !== "placed" && o.status !== "rejected",
  ).length;

  // ─── Render ──────────────────────────────────────────────
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
    <div className="p-4 mx-auto space-y-6 max-w-7xl sm:p-6">
      {/* ─── Header ─────────────────────────────────────────── */}
      <div className="relative p-6 overflow-hidden shadow-xl rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-500/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Live Orders
            </h1>
            <p className="mt-1 text-sm text-orange-100">
              Manage incoming orders in real‑time.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex w-full h-full bg-green-400 rounded-full opacity-75 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
            </span>
            <span className="text-sm font-bold text-white">
              {totalOrders} {totalOrders === 1 ? "order" : "orders"} live
            </span>
          </div>
        </div>
      </div>

      {/* ─── Stats Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border shadow-sm rounded-2xl border-gray-200/60 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Total Orders
              </p>
              <p className="mt-1 text-2xl font-black text-gray-900">
                {totalOrders}
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-500">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="p-4 border shadow-sm rounded-2xl border-gray-200/60 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Pending
              </p>
              <p className="mt-1 text-2xl font-black text-amber-600">
                {pendingOrders}
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="p-4 border shadow-sm rounded-2xl border-gray-200/60 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Accepted
              </p>
              <p className="mt-1 text-2xl font-black text-green-600">
                {acceptedOrders}
              </p>
            </div>
            <div className="rounded-xl bg-green-50 p-2.5 text-green-500">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Error ──────────────────────────────────────────── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 text-sm text-red-600 border border-red-200 rounded-2xl bg-red-50/80 backdrop-blur-sm"
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

      {/* ─── Table ──────────────────────────────────────────── */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-gray-200 border-dashed rounded-3xl bg-gray-50/50 backdrop-blur-sm">
          <ShoppingBag className="w-12 h-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-bold text-gray-700">
            No live orders
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Orders will appear here automatically when customers place them.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border shadow-lg rounded-3xl border-gray-200/60 bg-white/80 shadow-gray-200/40 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100/80">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Time
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
                  {orders.map((order, index) => {
                    const isNew =
                      Date.now() - new Date(order.createdAt).getTime() < 60000;
                    return (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.03, duration: 0.2 }}
                        className="transition-colors cursor-pointer group hover:bg-orange-50/40"
                        onClick={() => openDetailModal(order)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">
                              #{order.orderNumber}
                            </span>
                            {isNew && (
                              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[9px] font-bold text-orange-600">
                                NEW
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {order.customer?.firstName} {order.customer?.lastName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {order.items?.length} items
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">
                          {formatCurrency(order.pricing?.grandTotal || 0)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {formatDistanceToNow(new Date(order.createdAt), {
                            addSuffix: true,
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {order.status === "placed" && (
                              <>
                                <button
                                  onClick={() => handleAccept(order._id)}
                                  disabled={actionLoading}
                                  className="rounded-lg p-1.5 text-green-600 transition hover:bg-green-50 disabled:opacity-50"
                                  title="Accept"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openRejectModal(order)}
                                  disabled={actionLoading}
                                  className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => openDetailModal(order)}
                              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Detail Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showDetailModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur-md border border-white/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-orange-100 p-2.5 text-orange-600">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">
                      Order #{selectedOrder.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {format(new Date(selectedOrder.createdAt), "PPp")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 transition bg-gray-100 rounded-full hover:bg-gray-200 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50/80 backdrop-blur-sm">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Customer
                  </p>
                  <p className="mt-1 font-bold text-gray-900">
                    {selectedOrder.customer?.firstName}{" "}
                    {selectedOrder.customer?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedOrder.customer?.phone}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Status
                  </p>
                  <div className="mt-1">
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {formatDistanceToNow(new Date(selectedOrder.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <h4 className="text-sm font-bold text-gray-700">Order Items</h4>
                <div className="p-3 mt-2 space-y-2 border rounded-2xl border-gray-200/60 bg-gray-50/50">
                  {selectedOrder.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between pb-2 border-b border-gray-100/80 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600">
                          ×{item.quantity}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-sm font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-xl font-black text-orange-600">
                      {formatCurrency(selectedOrder.pricing?.grandTotal || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedOrder.status === "placed" && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleAccept(selectedOrder._id)}
                    disabled={actionLoading}
                    className="flex items-center justify-center flex-1 gap-2 px-4 py-3 text-sm font-bold text-white transition shadow-sm rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-md disabled:opacity-50"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Accept Order
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      openRejectModal(selectedOrder);
                    }}
                    disabled={actionLoading}
                    className="flex items-center justify-center flex-1 gap-2 px-4 py-3 text-sm font-bold text-red-600 transition border border-red-200 rounded-xl bg-red-50 hover:bg-red-100 disabled:opacity-50"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject Order
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Reject Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showRejectModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-full max-w-md p-6 border shadow-2xl rounded-3xl bg-white/95 backdrop-blur-md border-white/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-100 p-2.5 text-red-500">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    Reject Order #{selectedOrder.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Please provide a reason for the customer.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <label className="block text-sm font-bold text-gray-700">
                  Reason for rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 mt-2 text-sm text-gray-700 transition border border-gray-200 outline-none rounded-2xl bg-gray-50/80 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  placeholder="e.g., Item out of stock, kitchen closed, etc."
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    if (rejectError) setRejectError("");
                  }}
                  maxLength={200}
                />
                {rejectError && (
                  <p className="mt-2 text-sm text-red-500">{rejectError}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  {rejectReason.length}/200 characters
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 transition bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-3 text-sm font-bold text-white transition rounded-xl bg-gradient-to-r from-red-500 to-rose-500 hover:shadow-md disabled:opacity-50"
                >
                  {actionLoading ? (
                    <LoaderCircle className="w-5 h-5 mx-auto animate-spin" />
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" />
                      Submit Rejection
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
