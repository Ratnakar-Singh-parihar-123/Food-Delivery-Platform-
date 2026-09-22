// ─── Completed & Pickup Orders Page ──────────────────────────────
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Eye,
  Clock,
  MapPin,
  Package,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  Truck,
  User,
  Phone,
  Hash,
  LoaderCircle,
  RefreshCw,
  ShoppingBag,
  Zap,
  PackageCheck,
  Bike,
  Calendar,
} from "lucide-react";

import {
  getVendorOrdersApi,
  updateVendorOrderStatus,
} from "../../src/api/vendorApi";

// ─── Helper: Format address object to string ──────────────
const formatAddress = (address) => {
  if (!address) return "Address not available";
  if (typeof address === "string") return address;
  const parts = [
    address.addressLine,
    address.landmark,
    address.city,
    address.state,
    address.pincode,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Address not available";
};

const normalizeOrder = (order) => ({
  ...order,
  createdAt: order.createdAt ? new Date(order.createdAt) : null,
  updatedAt: order.updatedAt ? new Date(order.updatedAt) : null,
  completedAt: order.timeline?.deliveredAt
    ? new Date(order.timeline.deliveredAt)
    : order.completedAt
      ? new Date(order.completedAt)
      : null,
  items: (order.items || []).map((item) => ({
    ...item,
    qty: item.quantity ?? item.qty ?? 1,
    subtotal:
      Number(item.price ?? item.subtotal ?? 0) *
      Number(item.quantity ?? item.qty ?? 1),
  })),
  pricing: order.pricing || {
    subtotal: 0,
    deliveryFee: 0,
    grandTotal: 0,
  },
  rider: order.rider
    ? {
        name: order.rider.name || "—",
        phone: order.rider.phone || "",
        vehicle: order.rider.vehicle || "",
        rating: order.rider.rating || "—",
      }
    : {
        name: "—",
        phone: "",
        vehicle: "",
        rating: "—",
      },
  customer: order.customer || {
    firstName: "Customer",
  },
  deliveryAddress: formatAddress(order.deliveryAddress),
});

// ─── Status Badge ──────────────────────────────────────────────────
function StatusBadge({ status }) {
  const config = {
    ready_for_pickup: {
      label: "Ready for Pickup",
      className: "bg-green-50 text-green-600 border-green-200",
      icon: PackageCheck,
    },
    rider_assigned: {
      label: "Rider Assigned",
      className: "bg-blue-50 text-blue-600 border-blue-200",
      icon: Bike,
    },
    picked_up: {
      label: "Picked Up",
      className: "bg-indigo-50 text-indigo-600 border-indigo-200",
      icon: Bike,
    },
    delivered: {
      label: "Delivered",
      className: "bg-gray-50 text-gray-500 border-gray-200",
      icon: CheckCircle2,
    },
  };

  const c = config[status] || config.delivered;
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${c.className}`}
    >
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

// ─── Order Detail Modal ──────────────────────────────────────────
function OrderDetailModal({ order, onClose, onConfirmPickup, isLoading }) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    try {
      setConfirming(true);
      await onConfirmPickup(order._id);
      onClose();
    } catch (error) {
      // error handled in parent
    } finally {
      setConfirming(false);
    }
  };

  if (!order) return null;

  const showConfirmButton =
    order.status === "ready_for_pickup" || order.status === "rider_assigned";
  const isBusy = isLoading || confirming;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-gray-100 p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Order #{order.orderNumber}
            </h3>
            <StatusBadge status={order.status} />
          </div>

          {/* Customer & Rider Info */}
          <div className="grid grid-cols-2 gap-4 p-4 mb-4 rounded-xl bg-gray-50">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">
                Customer
              </p>
              <p className="font-medium text-gray-900">
                {order.customer.firstName || "Customer"}
              </p>
              <p className="text-sm text-gray-500">
                {order.customer.phone || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">
                Rider
              </p>
              <p className="font-medium text-gray-900">
                {order.rider?.name || "Not assigned"}
              </p>
              <p className="text-sm text-gray-500">
                {order.rider?.phone || "—"}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase">
              Items
            </p>
            <div className="mt-1 space-y-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>
                    {item.qty}× {item.name}
                  </span>
                  <span className="font-medium">₹{item.subtotal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="p-3 mb-4 border border-blue-100 rounded-lg bg-blue-50/50">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-blue-500" />
              <p className="text-sm text-gray-700">{order.deliveryAddress}</p>
            </div>
            {order.pickupCode && (
              <div className="flex items-center gap-2 px-3 py-1 mt-2 font-mono text-sm border border-blue-200 rounded-lg bg-white/70">
                <Hash className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-bold text-blue-700">
                  Pickup Code: {order.pickupCode}
                </span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-2 border-t border-gray-200">
            <span className="font-semibold text-gray-900">Grand Total</span>
            <span className="text-lg font-bold text-gray-900">
              ₹{order.pricing.grandTotal}
            </span>
          </div>

          {/* ─── Confirm Pickup Button ────────────────────── */}
          {showConfirmButton && (
            <div className="mt-6">
              <button
                onClick={handleConfirm}
                disabled={isBusy}
                className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-bold text-white transition-all bg-indigo-600 shadow-lg rounded-xl hover:bg-indigo-700 disabled:opacity-50"
              >
                {isBusy ? (
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                ) : (
                  <Bike className="w-4 h-4" />
                )}
                {isBusy ? "Confirming..." : "Confirm Pickup"}
              </button>
              <p className="mt-2 text-xs text-center text-gray-400">
                Only click this when the rider has physically received the
                order.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Pickup Code Modal (2-Step: Verify & Confirm) ──────────────
function PickupCodeModal({ order, onClose, onConfirm, isLoading }) {
  const [code, setCode] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [error, setError] = useState("");

  const handleCodeChange = (value) => {
    setCode(value);
    setError("");
    // Real-time validation
    if (value.trim() === order.pickupCode) {
      setIsCodeValid(true);
      setError("");
    } else {
      setIsCodeValid(false);
      if (value.trim().length > 0) {
        setError("Invalid pickup code. Please check with the rider.");
      } else {
        setError("");
      }
    }
  };

  const handleConfirm = () => {
    if (isCodeValid) {
      onConfirm(order._id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="relative w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-gray-100 p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-lg font-bold text-gray-900">Confirm Pickup</h3>
        <p className="mt-1 text-sm text-gray-500">
          Enter the pickup code provided by the rider.
        </p>

        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase">
            Pickup Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder="e.g. 1234"
            className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          {isCodeValid && (
            <p className="flex items-center gap-1 mt-1 text-xs text-green-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Pickup code verified
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isCodeValid || isLoading}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold text-white transition-all ${
              isCodeValid && !isLoading
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <LoaderCircle className="w-4 h-4 mx-auto animate-spin" />
            ) : (
              "Confirm Pickup"
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function CompletedPickupOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmOrder, setConfirmOrder] = useState(null); // for pickup code modal
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingOrderIds, setLoadingOrderIds] = useState(new Set());

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [readyRes, riderAssignedRes, pickedRes, deliveredRes] =
        await Promise.all([
          getVendorOrdersApi({ status: "ready_for_pickup", limit: 100 }),
          getVendorOrdersApi({ status: "rider_assigned", limit: 100 }),
          getVendorOrdersApi({ status: "picked_up", limit: 100 }),
          getVendorOrdersApi({ status: "delivered", limit: 100 }),
        ]);

      const combined = [
        ...(readyRes?.data?.orders || []),
        ...(riderAssignedRes?.data?.orders || []),
        ...(pickedRes?.data?.orders || []),
        ...(deliveredRes?.data?.orders || []),
      ].map(normalizeOrder);

      const unique = Array.from(
        new Map(combined.map((order) => [order._id, order])).values(),
      );

      const sorted = unique.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      setOrders(sorted);
      setFilteredOrders(sorted);
      setError("");
    } catch (error) {
      console.error("Failed to load orders", error);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = orders;
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((o) => o.orderNumber.toLowerCase().includes(q));
    }
    setFilteredOrders(result);
  }, [orders, statusFilter, searchQuery]);

  const handleConfirmPickup = async (orderId) => {
    const currentOrder = orders.find((o) => o._id === orderId);
    if (!currentOrder) {
      await fetchOrders();
      return;
    }
    if (!["ready_for_pickup", "rider_assigned"].includes(currentOrder.status)) {
      alert(`Order is already ${currentOrder.status}. Refreshing...`);
      await fetchOrders();
      return;
    }

    setLoadingOrderIds((prev) => new Set(prev).add(orderId));

    try {
      await updateVendorOrderStatus(orderId, "picked_up");
      await fetchOrders();
      setSelectedOrder(null);
      setConfirmOrder(null); // close pickup code modal
    } catch (error) {
      console.error(
        "❌ Confirm pickup error:",
        error.response?.data || error.message,
      );
      alert(error.response?.data?.message || "Failed to confirm pickup.");
    } finally {
      setLoadingOrderIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const stats = useMemo(() => {
    const ready = orders.filter((o) => o.status === "ready_for_pickup").length;
    const riderAssigned = orders.filter(
      (o) => o.status === "rider_assigned",
    ).length;
    const pickedUp = orders.filter((o) => o.status === "picked_up").length;
    const delivered = orders.filter((o) => o.status === "delivered").length;
    return { ready, riderAssigned, pickedUp, delivered, total: orders.length };
  }, [orders]);

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderCircle className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 mx-auto space-y-6 max-w-7xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
        <StatCard
          icon={PackageCheck}
          label="Ready for Pickup"
          value={stats.ready}
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard
          icon={Bike}
          label="Rider Assigned"
          value={stats.riderAssigned}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={Bike}
          label="Picked Up"
          value={stats.pickedUp}
          gradient="from-indigo-500 to-blue-500"
        />
        <StatCard
          icon={CheckCircle2}
          label="Delivered"
          value={stats.delivered}
          gradient="from-gray-500 to-gray-600"
        />
        <StatCard
          icon={Package}
          label="Total"
          value={stats.total}
          gradient="from-orange-500 to-amber-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
          Status:
        </span>
        {[
          "all",
          "ready_for_pickup",
          "rider_assigned",
          "picked_up",
          "delivered",
        ].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              statusFilter === s
                ? "bg-orange-500 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s === "all"
              ? "All"
              : s === "ready_for_pickup"
                ? "Ready for Pickup"
                : s === "rider_assigned"
                  ? "Rider Assigned"
                  : s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by order ID..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
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

      {/* Table */}
      <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/80">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Items
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Rider
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Completed At
                </th>
                <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
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
                  filteredOrders.map((order) => {
                    const canConfirm =
                      order.status === "ready_for_pickup" ||
                      order.status === "rider_assigned";
                    const isLoading = loadingOrderIds.has(order._id);

                    return (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="transition-colors hover:bg-gray-50/50"
                      >
                        <td
                          className="px-4 py-3 cursor-pointer"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="flex items-center gap-2">
                            <Hash className="w-3.5 h-3.5 text-gray-300" />
                            <span className="font-mono text-xs font-bold text-gray-900">
                              {order.orderNumber}
                            </span>
                          </div>
                        </td>
                        <td
                          className="px-4 py-3 cursor-pointer"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <span className="text-xs text-gray-600">
                            {order.items.length} item
                            {order.items.length > 1 ? "s" : ""}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 cursor-pointer"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <span className="font-bold text-gray-900">
                            ₹{order.pricing.grandTotal}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 cursor-pointer"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <StatusBadge status={order.status} />
                        </td>
                        <td
                          className="px-4 py-3 cursor-pointer"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[9px] font-bold text-blue-500">
                              {order.rider?.name?.charAt(0) || "R"}
                            </div>
                            <span className="text-xs font-medium text-gray-700 truncate max-w-[80px]">
                              {order.rider?.name || "—"}
                            </span>
                          </div>
                        </td>
                        <td
                          className="px-4 py-3 cursor-pointer"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <span className="text-xs text-gray-500">
                            {order.completedAt
                              ? new Date(order.completedAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                  },
                                )
                              : "—"}
                          </span>
                          <span className="block text-[10px] text-gray-400">
                            {order.completedAt
                              ? new Date(order.completedAt).toLocaleTimeString(
                                  "en-IN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )
                              : ""}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {canConfirm ? (
                            <button
                              onClick={() => setConfirmOrder(order)}
                              disabled={isLoading}
                              className="inline-flex items-center gap-1 rounded-lg bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700 transition-colors hover:bg-indigo-200 disabled:opacity-50"
                            >
                              {isLoading ? (
                                <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Bike className="w-3.5 h-3.5" />
                              )}
                              {isLoading ? "Confirming..." : "Confirm"}
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500 transition-colors hover:bg-gray-200"
                            >
                              View
                            </button>
                          )}
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

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onConfirmPickup={handleConfirmPickup}
            isLoading={loadingOrderIds.has(selectedOrder._id)}
          />
        )}
      </AnimatePresence>

      {/* Pickup Code Modal (2-Step) */}
      <AnimatePresence>
        {confirmOrder && (
          <PickupCodeModal
            order={confirmOrder}
            onClose={() => setConfirmOrder(null)}
            onConfirm={handleConfirmPickup}
            isLoading={loadingOrderIds.has(confirmOrder._id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── StatCard ──────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, gradient }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400 }}
      className="relative overflow-hidden rounded-[22px] border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div
        className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${gradient} opacity-10`}
      />
      <div className="relative">
        <div
          className={`inline-flex rounded-xl bg-gradient-to-br ${gradient} p-2.5 text-white shadow-lg`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <p className="mt-4 text-xs font-semibold text-gray-400">{label}</p>
        <p className="mt-1 text-2xl font-black text-gray-950">{value}</p>
      </div>
    </motion.div>
  );
}
