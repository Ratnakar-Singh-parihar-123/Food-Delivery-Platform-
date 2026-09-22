// src/vendorPanel/pages/LiveOrdersTable.jsx
import { useEffect, useState, useCallback, useRef } from "react";
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
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getVendorOrders, vendorRespondOrder } from "../../src/api/vendorApi";
import { useVendor } from "../../src/context/VendorContext";

export default function LiveOrdersTable() {
  const { vendor, loading: authLoading, isAuthenticated } = useVendor();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  const pollInterval = useRef(null);

  // ─── Fetch orders ──────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    // If not authenticated, don't even try.
    if (!isAuthenticated || !vendor) return;

    try {
      setError("");
      const response = await getVendorOrders({ status: "placed" });
      setOrders(response.data?.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to load orders. Please refresh.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, vendor]);

  // ─── Initial load & polling ──────────────────────────
  useEffect(() => {
    if (isAuthenticated && vendor) {
      fetchOrders();
      pollInterval.current = setInterval(fetchOrders, 10000);
    } else {
      setLoading(false);
    }
    return () => clearInterval(pollInterval.current);
  }, [fetchOrders, isAuthenticated, vendor]);

  // ─── Accept order ────────────────────────────────────────
  const handleAccept = async (orderId) => {
    setActionLoading(true);
    try {
      await vendorRespondOrder(orderId, "accept", "Order accepted");
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(null);
        setShowDetailModal(false);
      }
    } catch (err) {
      console.error("Accept failed:", err);
      setError(err?.response?.data?.message || "Failed to accept order.");
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

    setActionLoading(true);
    try {
      await vendorRespondOrder(
        selectedOrder._id,
        "reject",
        rejectReason.trim(),
      );
      setOrders((prev) => prev.filter((o) => o._id !== selectedOrder._id));
      setShowRejectModal(false);
      setShowDetailModal(false);
      setSelectedOrder(null);
      setRejectReason("");
    } catch (err) {
      console.error("Reject failed:", err);
      setError(err?.response?.data?.message || "Failed to reject order.");
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Open detail modal ──────────────────────────────────
  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  // ─── Manual refresh ──────────────────────────────────────
  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ─── If still loading auth or vendor ─────────────────────
  if (authLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <LoaderCircle className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  // ─── Not authenticated – show login prompt (no redirect) ─
  if (!isAuthenticated || !vendor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 p-4 text-center">
        <div className="flex items-center justify-center w-20 h-20 mb-4 bg-orange-100 rounded-full">
          <LogIn className="w-10 h-10 text-orange-500" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-800">Login Required</h2>
        <p className="max-w-md mb-6 text-gray-500">
          Please login to view and manage live orders.
        </p>
        <button
          onClick={() => (window.location.href = "/vendor/login")}
          className="px-6 py-2 text-white transition bg-orange-500 rounded-lg hover:bg-orange-600"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // ─── Loading orders ──────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <LoaderCircle className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  // ─── Main render ────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Live Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage incoming orders in real‑time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-orange-600 rounded-full bg-orange-50">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full bg-green-400 rounded-full opacity-75 animate-ping" />
              <span className="relative inline-flex w-2 h-2 bg-green-400 rounded-full" />
            </span>
            {orders.length} {orders.length === 1 ? "order" : "orders"} live
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-400 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw
              className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 text-sm text-red-600 border border-red-200 rounded-2xl bg-red-50">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
          <button
            onClick={() => setError("")}
            className="ml-auto text-xs font-bold text-red-500 hover:text-red-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ─── Table ────────────────────────────────────────── */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-gray-200 border-dashed rounded-3xl bg-gray-50/50">
          <ShoppingBag className="w-12 h-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-bold text-gray-700">
            No new orders
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            All caught up! New orders will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border border-gray-200 shadow-sm rounded-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-500 uppercase">
                    Order
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-500 uppercase">
                    Items
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-500 uppercase">
                    Time
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-right text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                <AnimatePresence>
                  {orders.map((order) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="transition-colors cursor-pointer hover:bg-orange-50/50"
                      onClick={() => openDetailModal(order)}
                    >
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">
                        #{order.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {order.customer?.firstName} {order.customer?.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {order.items?.length} items
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">
                        ₹{order.pricing?.grandTotal || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {formatTime(order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-orange-600 capitalize bg-orange-50 rounded-full">
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div
                          className="flex items-center justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleAccept(order._id)}
                            disabled={actionLoading}
                            className="p-2 text-green-600 transition rounded-lg hover:bg-green-50 disabled:opacity-50"
                            title="Accept"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openRejectModal(order)}
                            disabled={actionLoading}
                            className="p-2 text-red-500 transition rounded-lg hover:bg-red-50 disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openDetailModal(order)}
                            className="p-2 text-gray-400 transition rounded-lg hover:bg-gray-50"
                            title="View details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Order Details Modal ────────────────────────── */}
      {showDetailModal && selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white shadow-2xl rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 text-orange-600 bg-orange-100 rounded-full">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">
                    Order #{selectedOrder.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatTime(selectedOrder.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-gray-400 transition rounded-lg hover:bg-gray-100"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 mb-4 rounded-2xl bg-gray-50">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
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
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Status
                </p>
                <span className="inline-flex items-center gap-1 px-3 py-1 mt-1 text-sm font-bold text-orange-600 capitalize rounded-full bg-orange-50">
                  {selectedOrder.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-bold text-gray-700">Order Items</h4>
              <div className="mt-2 space-y-2">
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 border-b border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600">
                        ×{item.quantity}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200">
                <span className="text-sm font-bold text-gray-900">Total</span>
                <span className="text-xl font-black text-orange-600">
                  ₹{selectedOrder.pricing?.grandTotal || 0}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleAccept(selectedOrder._id)}
                disabled={actionLoading}
                className="flex items-center justify-center flex-1 gap-2 px-4 py-3 text-sm font-bold text-white transition bg-green-500 rounded-xl hover:bg-green-600 disabled:opacity-50"
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
                className="flex items-center justify-center flex-1 gap-2 px-4 py-3 text-sm font-bold text-red-600 transition rounded-xl bg-red-50 hover:bg-red-100 disabled:opacity-50"
              >
                <XCircle className="w-5 h-5" />
                Reject Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Reject Modal ────────────────────────────────── */}
      {showRejectModal && selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className="w-full max-w-md p-6 bg-white shadow-2xl rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 text-red-600 bg-red-100 rounded-full">
                <XCircle className="w-6 h-6" />
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
                className="w-full px-4 py-3 mt-2 text-sm text-gray-700 transition border border-gray-200 outline-none rounded-2xl bg-gray-50 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
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
                className="flex-1 px-4 py-3 text-sm font-bold text-white transition bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50"
              >
                {actionLoading ? (
                  <LoaderCircle className="w-5 h-5 mx-auto animate-spin" />
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <Send className="w-4 h-4" />
                    Submit Rejection
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
