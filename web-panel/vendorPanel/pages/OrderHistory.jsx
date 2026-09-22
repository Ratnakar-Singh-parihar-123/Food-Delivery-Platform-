// ─── Order History Page ──────────────────────────────────────────
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
  ShoppingBag,
  TrendingUp,
  Calendar,
  Filter,
  ChevronDown,
  Download,
} from "lucide-react";

// ─── Dummy Order History Generator ──────────────────────────────
const generateOrderHistory = (count = 20) => {
  const statuses = ["delivered", "cancelled"];
  const foodItems = [
    "Margherita Pizza",
    "Chicken Burger",
    "Paneer Tikka",
    "Veg Biryani",
    "Chocolate Shake",
    "French Fries",
    "Garlic Bread",
    "Butter Chicken",
    "Naan Bread",
    "Gulab Jamun",
  ];
  const riderNames = [
    "Rajesh Kumar",
    "Priya Singh",
    "Amit Verma",
    "Sneha Reddy",
    "Vikram Joshi",
    "Ananya Sharma",
  ];

  const orders = [];
  const now = new Date();

  for (let i = 1; i <= count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const rider = riderNames[Math.floor(Math.random() * riderNames.length)];

    const itemCount = Math.floor(Math.random() * 3) + 1;
    const items = [];
    let total = 0;
    for (let j = 0; j < itemCount; j++) {
      const name = foodItems[Math.floor(Math.random() * foodItems.length)];
      const price = Math.floor(Math.random() * 200) + 50;
      const qty = Math.floor(Math.random() * 2) + 1;
      items.push({ name, price, qty, subtotal: price * qty });
      total += price * qty;
    }

    const orderId = `ORD-${String(4000 + i).padStart(4, "0")}`;
    const createdAt = new Date(
      now.getTime() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000),
    );
    const completedAt = new Date(
      createdAt.getTime() + 1800000 + Math.random() * 3600000,
    );

    orders.push({
      _id: `order_${i}`,
      orderNumber: orderId,
      status,
      items,
      pricing: {
        subtotal: total,
        deliveryFee: Math.floor(Math.random() * 40) + 20,
        grandTotal: total + Math.floor(Math.random() * 40) + 20,
      },
      customer: {
        firstName: `Customer${i}`,
        lastName: "",
      },
      rider: {
        name: rider,
        phone: `+91 9${Math.floor(Math.random() * 1000000000)
          .toString()
          .padStart(9, "0")}`,
        vehicle: ["Bike", "Scooter", "Electric Bike"][
          Math.floor(Math.random() * 3)
        ],
        rating: (3 + Math.random() * 2).toFixed(1),
      },
      deliveryAddress: `${Math.floor(Math.random() * 999) + 1}, ${
        [
          "MG Road",
          "Banjara Hills",
          "Jubilee Hills",
          "Hitech City",
          "Gachibowli",
        ][Math.floor(Math.random() * 5)]
      }, Hyderabad`,
      createdAt,
      completedAt,
      estimatedDelivery: new Date(
        createdAt.getTime() + 1800000 + Math.random() * 1800000,
      ),
    });
  }

  return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// ─── Status Badge ──────────────────────────────────────────────────
function StatusBadge({ status }) {
  const config = {
    delivered: {
      label: "Delivered",
      className: "bg-green-50 text-green-600 border-green-200",
      icon: CheckCircle2,
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-50 text-red-600 border-red-200",
      icon: X,
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
function OrderDetailModal({ order, onClose }) {
  if (!order) return null;

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
                      {item.qty}×
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    ₹{item.subtotal}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-200 bg-white rounded-b-xl">
                <span className="text-sm font-bold text-gray-900">Total</span>
                <span className="text-base font-black text-orange-600">
                  ₹{order.pricing.grandTotal}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="p-4 border border-gray-100 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
                <MapPin className="w-3.5 h-3.5" />
                Delivery Address
              </div>
              <p className="mt-1.5 text-sm font-medium text-gray-800">
                {order.deliveryAddress}
              </p>
            </div>
            <div className="p-4 border border-gray-100 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
                <Truck className="w-3.5 h-3.5" />
                Rider
              </div>
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
            </div>
          </div>

          {order.completedAt && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>
                {order.status === "delivered" ? "Delivered" : "Cancelled"} on{" "}
                <strong>
                  {new Date(order.completedAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dummy = generateOrderHistory(25);
    setOrders(dummy);
    setFilteredOrders(dummy);
    setLoading(false);
  }, []);

  useEffect(() => {
    let result = orders;

    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (dateFilter !== "all") {
      const now = new Date();
      const cutoff = new Date(now);
      if (dateFilter === "today") cutoff.setHours(0, 0, 0, 0);
      else if (dateFilter === "week") cutoff.setDate(cutoff.getDate() - 7);
      else if (dateFilter === "month") cutoff.setMonth(cutoff.getMonth() - 1);
      else if (dateFilter === "quarter") cutoff.setMonth(cutoff.getMonth() - 3);
      result = result.filter((o) => new Date(o.createdAt) >= cutoff);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((o) => o.orderNumber.toLowerCase().includes(q));
    }

    setFilteredOrders(result);
  }, [orders, statusFilter, dateFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;
    const totalRevenue = orders
      .filter((o) => o.status === "delivered")
      .reduce((acc, o) => acc + o.pricing.grandTotal, 0);
    const avgOrderValue = delivered > 0 ? totalRevenue / delivered : 0;
    return { total, delivered, cancelled, totalRevenue, avgOrderValue };
  }, [orders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderCircle className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 mx-auto space-y-6 max-w-7xl">
      {/* Header */}
      <header className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-orange-500 to-red-500 p-7 text-white shadow-xl shadow-orange-100">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.3)_0%,transparent_70%)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white/70">
              Archived Orders
            </p>
            <h1 className="mt-1 text-3xl font-black">Order History</h1>
            <p className="mt-2 text-sm text-white/80">
              View all past orders and their details
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
            <Calendar className="w-4 h-4 text-white" />
            <span className="text-xs font-bold tracking-wider text-white uppercase">
              {stats.total} total orders
            </span>
          </div>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={stats.total}
          gradient="from-blue-400 to-cyan-400"
        />
        <StatCard
          icon={CheckCircle2}
          label="Delivered"
          value={stats.delivered}
          gradient="from-green-400 to-emerald-400"
        />
        <StatCard
          icon={X}
          label="Cancelled"
          value={stats.cancelled}
          gradient="from-red-400 to-pink-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          gradient="from-orange-400 to-amber-400"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
            Status:
          </span>
          {["all", "delivered", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                statusFilter === s
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
        <div className="w-px h-6 bg-gray-200" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
            Date:
          </span>
          {["all", "today", "week", "month", "quarter"].map((d) => (
            <button
              key={d}
              onClick={() => setDateFilter(d)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                dateFilter === d
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {d === "all" ? "All" : d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
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
                  Date
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Rider
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
                      onClick={() => setSelectedOrder(order)}
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
                        <span className="text-xs text-gray-600">
                          {order.items.length} item
                          {order.items.length > 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-gray-900">
                          ₹{order.pricing.grandTotal}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                        <span className="block text-[10px] text-gray-400">
                          {new Date(order.createdAt).toLocaleTimeString(
                            "en-IN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[9px] font-bold text-blue-500">
                            {order.rider.name.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-gray-700 truncate max-w-[80px]">
                            {order.rider.name}
                          </span>
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

      {/* Modal */}
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
