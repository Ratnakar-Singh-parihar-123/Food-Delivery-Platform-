// src/vendorPanel/pages/PreparingOrders.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Clock,
  MapPin,
  Package,
  AlertCircle,
  CheckCircle2,
  Truck,
  User,
  Phone,
  Hash,
  LoaderCircle,
  RefreshCw,
  Timer,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";

// ─── API Imports ──────────────────────────────────────────
import {
  getVendorOrdersApi,
  updateVendorOrderStatusApi,
} from "../../src/api/vendorApi";
import { useVendor } from "../../src/context/VendorContext";

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

// ─── Status Badge ──────────────────────────────────────────
function StatusBadge({ status }) {
  const config = {
    placed: {
      label: "Placed",
      className: "bg-amber-50 text-amber-600 border-amber-200",
      icon: Clock,
    },
    confirmed: {
      label: "Confirmed",
      className: "bg-blue-50 text-blue-600 border-blue-200",
      icon: CheckCircle2,
    },
    preparing: {
      label: "Preparing",
      className: "bg-purple-50 text-purple-600 border-purple-200",
      icon: Package,
    },
    ready_for_pickup: {
      label: "Ready",
      className: "bg-green-50 text-green-600 border-green-200",
      icon: CheckCircle2,
    },
    rider_assigned: {
      label: "Rider Assigned",
      className: "bg-indigo-50 text-indigo-600 border-indigo-200",
      icon: Truck,
    },
    picked_up: {
      label: "Picked Up",
      className: "bg-orange-50 text-orange-600 border-orange-200",
      icon: Truck,
    },
    on_the_way: {
      label: "On the Way",
      className: "bg-cyan-50 text-cyan-600 border-cyan-200",
      icon: Truck,
    },
    delivered: {
      label: "Delivered",
      className: "bg-gray-50 text-gray-500 border-gray-200",
      icon: CheckCircle2,
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-50 text-red-600 border-red-200",
      icon: X,
    },
    rejected: {
      label: "Rejected",
      className: "bg-gray-50 text-gray-500 border-gray-200",
      icon: X,
    },
  };

  const c = config[status] || config.placed;
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

// ─── Order Detail Modal ────────────────────────────────────
function OrderDetailModal({ order, onClose, onAdvance, isLoading }) {
  if (!order) return null;

  const statusSteps = [
    "placed",
    "confirmed",
    "preparing",
    "ready_for_pickup",
    "rider_assigned",
    "picked_up",
    "on_the_way",
    "delivered",
  ];
  const currentStepIndex = statusSteps.indexOf(order.status);

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
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-gray-100 p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">
                  {order.orderNumber}
                </h2>
                <StatusBadge status={order.status} />
              </div>
              <p className="mt-1 text-sm text-gray-400">
                Received at{" "}
                {new Date(order.createdAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Status Steps */}
          <div className="p-4 mb-6 rounded-xl bg-gray-50/80">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => {
                const isDone = index <= currentStepIndex;
                const isActive = index === currentStepIndex;
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          isDone
                            ? "bg-orange-500 text-white"
                            : "bg-gray-200 text-gray-400"
                        } ${isActive ? "ring-2 ring-orange-300 ring-offset-2" : ""}`}
                      >
                        {index + 1}
                      </div>
                      <span
                        className={`mt-1 text-[9px] font-medium uppercase tracking-wide ${
                          isDone ? "text-gray-700" : "text-gray-400"
                        }`}
                      >
                        {step.replace("_", " ")}
                      </span>
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 mx-1 ${
                          isDone && index < currentStepIndex
                            ? "bg-orange-400"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <h4 className="mb-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
              Order Items
            </h4>
            <div className="border border-gray-100 divide-y divide-gray-100 rounded-xl bg-gray-50/50">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">
                      {item.quantity}×
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-200 bg-white rounded-b-xl">
                <span className="text-sm font-bold text-gray-900">Total</span>
                <span className="text-base font-black text-orange-600">
                  ₹{order.pricing?.grandTotal || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Address & Rider */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="p-4 border border-gray-100 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
                <MapPin className="w-3.5 h-3.5" />
                Delivery Address
              </div>
              <p className="mt-1.5 text-sm font-medium text-gray-800">
                {formatAddress(order.deliveryAddress)}
              </p>
            </div>

            <div className="p-4 border border-gray-100 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
                <Truck className="w-3.5 h-3.5" />
                Rider
              </div>
              {order.rider ? (
                <div className="mt-1.5 space-y-0.5">
                  <p className="text-sm font-bold text-gray-900">
                    {order.rider.name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {order.rider.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      {order.rider.vehicle}
                    </span>
                    <span className="flex items-center gap-1 text-amber-500">
                      ⭐ {order.rider.rating}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="mt-1.5 text-sm text-amber-500">
                  No rider assigned yet
                </p>
              )}
            </div>
          </div>

          {/* Ready for Pickup Button */}
          {order.status === "preparing" && (
            <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-sm text-orange-700">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Mark the order ready for pickup when kitchen work is done.
              </span>
              <button
                onClick={() => onAdvance(order._id)}
                disabled={isLoading}
                className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                ) : (
                  "Ready for Pickup"
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Time remaining helper ─────────────────────────────────
function getTimeRemaining(estimatedDelivery) {
  const now = new Date();
  const diffMs = new Date(estimatedDelivery) - now;
  if (diffMs <= 0) return { text: "Ready now", percent: 100 };
  const diffMin = Math.floor(diffMs / 60000);
  const maxMin = 45;
  const percent = Math.min(100, Math.round((diffMin / maxMin) * 100));
  if (diffMin < 60) return { text: `${diffMin} min`, percent };
  const hours = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  return { text: `${hours}h ${mins}m`, percent };
}

// ─── Main Component ──────────────────────────────────────
export default function PreparingOrders() {
  const { vendor, isAuthenticated } = useVendor();
  const [actionLoading, setActionLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleAdvance = async (orderId) => {
    try {
      setActionLoading(true);
      await updateVendorOrderStatusApi(orderId, "ready_for_pickup");
      await fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      setError("Failed to update order status.");
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Fetch orders ──────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated || !vendor) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await getVendorOrdersApi({ status: "preparing" });
      const allOrders = res.data?.orders || [];
      const mapped = allOrders.map((order) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
        estimatedDelivery: order.estimatedDelivery
          ? new Date(order.estimatedDelivery)
          : new Date(Date.now() + 3600000),
        rider: order.rider || null,
        pricing: order.pricing || {
          subtotal: 0,
          deliveryFee: 0,
          grandTotal: 0,
        },
        items: order.items || [],
        customer: order.customer || { firstName: "N/A" },
        deliveryAddress: order.deliveryAddress || null,
      }));
      setOrders(mapped);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError(
        err?.response?.data?.message || "Failed to load preparing orders.",
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, vendor]);

  // ─── Initial fetch & polling ─────────────────────────
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // ─── Filter by search ──────────────────────────────────
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setFilteredOrders(orders);
      return;
    }
    const filtered = orders.filter((o) =>
      o.orderNumber?.toLowerCase().includes(q),
    );
    setFilteredOrders(filtered);
  }, [orders, searchQuery]);

  // ─── Handlers ──────────────────────────────────────────
  const handleRowClick = (order) => setSelectedOrder(order);

  const handleRefresh = () => {
    fetchOrders();
  };

  // ─── Stats ─────────────────────────────────────────────
  const totalPreparing = orders.length;
  const avgTime = useMemo(() => {
    if (orders.length === 0) return 0;
    const total = orders.reduce((acc, o) => {
      const diff = new Date(o.estimatedDelivery) - new Date(o.createdAt);
      return acc + diff;
    }, 0);
    return Math.round(total / orders.length / 60000);
  }, [orders]);

  // ─── Loading ────────────────────────────────────────────
  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderCircle className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 mx-auto space-y-6 max-w-7xl">
      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-600 border border-red-200 rounded-2xl bg-red-50">
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

      {/* ─── Stats Row ────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={ShoppingBag}
          label="Preparing Orders"
          value={totalPreparing}
          gradient="from-purple-500 to-purple-400"
        />
        <StatCard
          icon={Timer}
          label="Avg. Prep Time"
          value={`${avgTime} min`}
          gradient="from-orange-400 to-amber-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Estimated Ready"
          value={
            orders.length > 0
              ? new Date(
                  Math.min(...orders.map((o) => new Date(o.estimatedDelivery))),
                ).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"
          }
          gradient="from-green-400 to-emerald-400"
        />
      </div>

      {/* ─── Search & Refresh ────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
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
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-orange-600 transition-colors bg-orange-50 rounded-xl hover:bg-orange-100"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* ─── Order Table ──────────────────────────────────── */}
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
                  Received At
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Time Remaining
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <div className="flex items-center justify-center py-12 text-gray-400">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        No preparing orders found
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const { text, percent } = getTimeRemaining(
                      order.estimatedDelivery,
                    );
                    const isReady = text === "Ready now";
                    return (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => handleRowClick(order)}
                        className="transition-colors cursor-pointer hover:bg-gray-50/50"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Hash className="w-3.5 h-3.5 text-gray-300" />
                            <span className="font-mono text-xs font-bold text-gray-900">
                              {order.orderNumber}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span
                              className="text-xs text-gray-600 truncate max-w-[200px]"
                              title={order.items.map((i) => i.name).join(", ")}
                            >
                              {order.items.map((i) => i.name).join(", ")}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {order.items.length} item
                              {order.items.length > 1 ? "s" : ""}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-gray-900">
                            ₹{order.pricing?.grandTotal || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-600">
                            {new Date(order.createdAt).toLocaleTimeString(
                              "en-IN",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                          <span className="block text-[10px] text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-IN",
                              { day: "2-digit", month: "short" },
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 max-w-[80px] h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isReady ? "bg-green-500" : "bg-orange-400"
                                }`}
                                style={{ width: `${Math.min(100, percent)}%` }}
                              />
                            </div>
                            <span
                              className={`text-xs font-bold ${
                                isReady ? "text-green-600" : "text-orange-600"
                              }`}
                            >
                              {text}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
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

      {/* ─── Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onAdvance={handleAdvance}
            isLoading={actionLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── StatCard ──────────────────────────────────────────────
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
