// src/vendorPanel/pages/AllOrders.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Eye,
  Bike,
  Clock,
  MapPin,
  Package,
  AlertCircle,
  CheckCircle2,
  Truck,
  Phone,
  Hash,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

// ─── API Imports ──────────────────────────────────────────
import { getVendorOrdersApi } from "../../src/api/vendorApi";
import { useVendor } from "../../src/context/VendorContext";

// ─── Helper: Format address object to string ──────────────
const formatAddress = (address) => {
  if (!address) return "Address not available";
  if (typeof address === "string") return address;

  // Build a readable string from object
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
      icon: AlertCircle,
    },
    rejected: {
      label: "Rejected",
      className: "bg-gray-50 text-gray-500 border-gray-200",
      icon: AlertCircle,
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
function OrderDetailModal({ order, onClose }) {
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* ─── Address ─────────────────────────────────── */}
            <div className="p-4 border border-gray-100 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
                <MapPin className="w-3.5 h-3.5" />
                Delivery Address
              </div>
              <p className="mt-1.5 text-sm font-medium text-gray-800">
                {formatAddress(order.deliveryAddress)}
              </p>
              {order.customer?.phone && (
                <p className="mt-1 text-xs text-gray-500">
                  Phone: {order.customer.phone}
                </p>
              )}
            </div>

            {/* ─── Rider ──────────────────────────────────── */}
            <div className="p-4 border border-gray-100 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
                <Bike className="w-3.5 h-3.5" />
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
                  </div>
                </div>
              ) : (
                <p className="mt-1.5 text-sm text-amber-500">
                  No rider assigned yet
                </p>
              )}
            </div>
          </div>

          {!["delivered", "cancelled", "rejected"].includes(order.status) && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-sm text-orange-700">
              <Clock className="w-4 h-4" />
              <span>
                Estimated delivery by{" "}
                <strong>
                  {new Date(order.estimatedDelivery).toLocaleTimeString(
                    "en-IN",
                    { hour: "2-digit", minute: "2-digit" },
                  )}
                </strong>
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Filter Chip ──────────────────────────────────────────
function FilterChip({ label, count, active, onClick, color = "gray" }) {
  const colorMap = {
    amber: "border-amber-200 bg-amber-50 text-amber-600",
    blue: "border-blue-200 bg-blue-50 text-blue-600",
    purple: "border-purple-200 bg-purple-50 text-purple-600",
    green: "border-green-200 bg-green-50 text-green-600",
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-600",
    gray: "border-gray-200 bg-gray-50 text-gray-600",
  };

  const activeMap = {
    amber: "ring-2 ring-amber-300 border-amber-400",
    blue: "ring-2 ring-blue-300 border-blue-400",
    purple: "ring-2 ring-purple-300 border-purple-400",
    green: "ring-2 ring-green-300 border-green-400",
    indigo: "ring-2 ring-indigo-300 border-indigo-400",
    gray: "ring-2 ring-gray-300 border-gray-400",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all hover:scale-105 ${
        active
          ? `${colorMap[color]} ${activeMap[color]}`
          : "border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-600"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-0.5 text-[9px] ${
          active ? "bg-white/50" : "bg-gray-100"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────
export default function AllOrders() {
  const { vendor, isAuthenticated } = useVendor();
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // ─── Fetch orders ──────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated || !vendor) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await getVendorOrdersApi();
      const fetchedOrders = res.data?.orders || [];
      const mappedOrders = fetchedOrders.map((order) => ({
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
      setOrders(mappedOrders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError(err?.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, vendor]);

  useEffect(() => {
    const loadOrders = () => {
      fetchOrders();
    };
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (filterStatus !== "all") {
      result = result.filter((o) => o.status === filterStatus);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter((o) =>
        o.orderNumber?.toLowerCase().includes(query),
      );
    }
    return result;
  }, [orders, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const total = orders.length;
    const placed = orders.filter((o) => o.status === "placed").length;
    const confirmed = orders.filter((o) => o.status === "confirmed").length;
    const preparing = orders.filter((o) => o.status === "preparing").length;
    const ready = orders.filter((o) => o.status === "ready_for_pickup").length;
    const riderAssigned = orders.filter(
      (o) => o.status === "rider_assigned",
    ).length;
    const pickedUp = orders.filter((o) => o.status === "picked_up").length;
    const onTheWay = orders.filter((o) => o.status === "on_the_way").length;
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;
    const rejected = orders.filter((o) => o.status === "rejected").length;
    return {
      total,
      placed,
      confirmed,
      preparing,
      ready,
      riderAssigned,
      pickedUp,
      onTheWay,
      delivered,
      cancelled,
      rejected,
    };
  }, [orders]);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <LoaderCircle className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 mx-auto space-y-5 max-w-7xl">
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

      <div className="flex flex-wrap gap-2">
        <FilterChip
          label="All"
          count={stats.total}
          active={filterStatus === "all"}
          onClick={() => setFilterStatus("all")}
        />
        <FilterChip
          label="Placed"
          count={stats.placed}
          active={filterStatus === "placed"}
          onClick={() => setFilterStatus("placed")}
          color="amber"
        />
        <FilterChip
          label="Confirmed"
          count={stats.confirmed}
          active={filterStatus === "confirmed"}
          onClick={() => setFilterStatus("confirmed")}
          color="blue"
        />
        <FilterChip
          label="Preparing"
          count={stats.preparing}
          active={filterStatus === "preparing"}
          onClick={() => setFilterStatus("preparing")}
          color="purple"
        />
        <FilterChip
          label="Ready"
          count={stats.ready}
          active={filterStatus === "ready_for_pickup"}
          onClick={() => setFilterStatus("ready_for_pickup")}
          color="green"
        />
        <FilterChip
          label="Rider Assigned"
          count={stats.riderAssigned}
          active={filterStatus === "rider_assigned"}
          onClick={() => setFilterStatus("rider_assigned")}
          color="indigo"
        />
        <FilterChip
          label="Picked Up"
          count={stats.pickedUp}
          active={filterStatus === "picked_up"}
          onClick={() => setFilterStatus("picked_up")}
          color="gray"
        />
        <FilterChip
          label="On the Way"
          count={stats.onTheWay}
          active={filterStatus === "on_the_way"}
          onClick={() => setFilterStatus("on_the_way")}
          color="gray"
        />
        <FilterChip
          label="Delivered"
          count={stats.delivered}
          active={filterStatus === "delivered"}
          onClick={() => setFilterStatus("delivered")}
          color="gray"
        />
        <FilterChip
          label="Cancelled"
          count={stats.cancelled}
          active={filterStatus === "cancelled"}
          onClick={() => setFilterStatus("cancelled")}
          color="red"
        />
        <FilterChip
          label="Rejected"
          count={stats.rejected}
          active={filterStatus === "rejected"}
          onClick={() => setFilterStatus("rejected")}
          color="red"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID (e.g. ORD-1001)..."
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
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="hidden sm:inline">
            {filteredOrders.length} orders found
          </span>
          <button
            onClick={fetchOrders}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

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
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Actions
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
                      onClick={() => handleViewDetails(order)}
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
                            className="text-xs text-gray-600 truncate max-w-45"
                            title={order.items?.map((i) => i.name).join(", ")}
                          >
                            {order.items?.map((i) => i.name).join(", ")}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {order.items?.length || 0} item
                            {order.items?.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-gray-900">
                          ₹{order.pricing?.grandTotal || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3">
                        {order.rider ? (
                          <div className="flex items-center gap-1.5">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[9px] font-bold text-blue-500">
                              {order.rider.name?.charAt(0) || "R"}
                            </div>
                            <span className="text-xs font-medium text-gray-700 truncate max-w-20">
                              {order.rider.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-500">
                            Not assigned
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(order);
                            }}
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {order.rider ? (
                            <span className="text-[10px] text-green-500 font-medium">
                              <Truck className="w-3.5 h-3.5 inline mr-0.5" />
                              Rider assigned
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-500 font-medium">
                              Awaiting rider
                            </span>
                          )}
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

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
