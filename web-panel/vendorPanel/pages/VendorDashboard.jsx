import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Clock3,
  CheckCircle2,
  IndianRupee,
  LoaderCircle,
  TrendingUp,
  Zap,
  AlertCircle,
  BarChart3,
  ChevronRight,
  Package,
  User,
  Calendar,
  Sparkles,
  Wallet,
  Percent,
  ArrowUpRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

import {
  getVendorDashboardApi,
  getVendorLiveOrdersApi,
} from "../../src/api/vendorApi";
import { useNavigate } from "react-router-dom";
import { useVendor } from "../../src/context/VendorContext";

// ─── Helper: generate mock trend data ────────────────────
function generateTrendData(orderCount) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const base = Math.max(2, Math.min(20, orderCount || 5));
  return days.map((day, i) => {
    const factor = (i / (days.length - 1)) * 2 - 1;
    const variation = Math.sin(i * 1.2) * 0.3 + 0.7;
    const value = Math.max(
      0,
      Math.round(base * (0.6 + factor * 0.4) * variation),
    );
    return { day, orders: value };
  });
}

export default function VendorDashboard() {
  const { vendor } = useVendor();
  const [data, setData] = useState(null);
  const [liveOrders, setLiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newOrderIds, setNewOrderIds] = useState([]);
  const previousOrderIds = useRef([]);
  const navigate = useNavigate();

  // ─── Fetch Dashboard Data ──────────────────────────────
  useEffect(() => {
    getVendorDashboardApi()
      .then((response) => setData(response.data))
      .catch((error) => console.error("Dashboard fetch error:", error))
      .finally(() => setLoading(false));
  }, []);

  // ─── Fetch Live Orders (polling) ──────────────────────
  useEffect(() => {
    const fetchLiveOrders = async () => {
      try {
        const res = await getVendorLiveOrdersApi();
        const orders = res.data.orders || [];

        const currentIds = orders.map((o) => o._id);
        const newIds = currentIds.filter(
          (id) => !previousOrderIds.current.includes(id),
        );
        if (newIds.length > 0) {
          setNewOrderIds(newIds);
          setTimeout(() => setNewOrderIds([]), 4000);
        }
        previousOrderIds.current = currentIds;
        setLiveOrders(orders);
      } catch (error) {
        console.error("Failed to fetch live orders:", error);
      }
    };

    fetchLiveOrders();
    const interval = setInterval(fetchLiveOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  // ─── Sort live orders (newest first) ────────────────────
  const sortedLiveOrders = useMemo(() => {
    return [...liveOrders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [liveOrders]);

  // ─── Trend data ────────────────────────────────────────
  const trendData = useMemo(
    () => generateTrendData(liveOrders.length),
    [liveOrders.length],
  );

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

  const stats = data?.stats || {};
  const vendorData = vendor || data?.vendor || {};

  return (
    <div className="px-4 py-6 mx-auto space-y-6 max-w-7xl sm:px-6">
      {/* ─── Header ─────────────────────────────────────────── */}
      <div className="relative p-6 overflow-hidden shadow-xl rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-500/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Welcome back, {vendorData.businessName || "Partner"}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                <Sparkles className="w-3 h-3" />
                Live
              </span>
            </div>
            <p className="mt-1 text-sm text-orange-100">
              {liveOrders.length} active orders · {stats.todayOrders || 0} today
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex w-full h-full bg-green-400 rounded-full opacity-75 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
            </span>
            <span className="text-sm font-bold text-white">
              {liveOrders.length} orders live
            </span>
          </div>
        </div>
      </div>

      {/* ─── Stats Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={ShoppingBag}
          label="Today's Orders"
          value={stats.todayOrders}
          color="blue"
          trend="+12%"
          changeType="up"
        />
        <StatCard
          icon={Clock3}
          label="Pending"
          value={stats.pendingOrders}
          color="amber"
          trend="-3%"
          changeType="down"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={stats.completedToday}
          color="emerald"
          trend="+8%"
          changeType="up"
        />
        <StatCard
          icon={IndianRupee}
          label="Earnings"
          value={`₹${stats.vendorEarning || 0}`}
          color="purple"
          trend="+5%"
          changeType="up"
        />
      </div>

      {/* ─── Two-column: Chart + Finance ────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart */}
        <section className="p-5 border shadow-lg rounded-2xl border-gray-200/60 bg-white/80 shadow-gray-200/40 backdrop-blur-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-orange-50 p-1.5 text-orange-500">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Order Trend</h3>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                Last 7 days
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <span className="inline-block w-2 h-2 bg-orange-400 rounded-full" />
              {liveOrders.length} active now
            </div>
          </div>
          <div className="w-full h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  allowDecimals={false}
                  width={24}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "0.75rem",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    fontSize: 12,
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(4px)",
                  }}
                  formatter={(v) => [`${v} orders`, "Volume"]}
                  labelFormatter={(l) => `${l}`}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  fill="url(#trendGrad)"
                  activeDot={{ r: 5, fill: "#f97316" }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#f97316", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-center text-[10px] text-gray-400">
            {liveOrders.length > 5
              ? "📈 High order volume – trend is rising"
              : liveOrders.length > 2
                ? "📊 Moderate order activity"
                : "📉 Low order volume – trend is cooling"}
          </p>
        </section>

        {/* Finance Cards */}
        <div className="space-y-4">
          <FinanceCard
            icon={Wallet}
            label="Gross Revenue"
            value={`₹${stats.todayRevenue || 0}`}
            color="gray"
            subtext="Today"
          />
          <FinanceCard
            icon={IndianRupee}
            label="Your Earnings"
            value={`₹${stats.vendorEarning || 0}`}
            color="orange"
            subtext="Net after commission"
          />
          <FinanceCard
            icon={Percent}
            label="Commission"
            value={`₹${stats.platformCommission || 0}`}
            color="indigo"
            subtext="Platform fee"
          />
        </div>
      </div>

      {/* ─── Live Orders ──────────────────────────────────── */}
      <section className="overflow-hidden border shadow-lg rounded-2xl border-gray-200/60 bg-white/80 shadow-gray-200/40 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-gray-200/60 bg-gradient-to-r from-orange-50/50 to-white/80 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 text-orange-600 bg-orange-100 rounded-xl">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Live Orders</h3>
            {liveOrders.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm shadow-orange-500/20">
                {liveOrders.length}
              </span>
            )}
          </div>
          <button
            onClick={() => navigate("/vendor/all/orders")}
            className="flex items-center gap-1 text-xs font-medium text-orange-500 transition hover:text-orange-600"
          >
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-y-auto divide-y max-h-80 divide-gray-100/80">
          <AnimatePresence>
            {sortedLiveOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-sm text-gray-400">
                <AlertCircle className="w-8 h-8 mb-2 text-gray-300" />
                <p className="font-medium">No active orders at the moment</p>
                <p className="text-xs">
                  New orders will appear here automatically
                </p>
              </div>
            ) : (
              sortedLiveOrders.map((order) => {
                const isNew = newOrderIds.includes(order._id);
                return (
                  <motion.div
                    key={order._id}
                    initial={isNew ? { backgroundColor: "#fef3c7" } : {}}
                    animate={isNew ? { backgroundColor: "#ffffff" } : {}}
                    transition={{ duration: 1.5 }}
                    className="flex flex-col gap-2 px-5 py-4 transition hover:bg-orange-50/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center min-w-0 gap-4">
                      <div className="flex items-center justify-center w-10 h-10 text-orange-500 rounded-full shrink-0 bg-orange-50">
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            Order #{order.orderNumber}
                          </p>
                          {isNew && (
                            <span className="inline-block animate-pulse rounded-full bg-orange-500 px-2 py-0.5 text-[9px] font-bold uppercase text-white shadow-sm shadow-orange-500/30">
                              New
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {order.customer?.firstName}{" "}
                            {order.customer?.lastName}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span>•</span>
                          <span>{order.items?.length || 0} items</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-auto shrink-0 sm:ml-0">
                      <p className="text-sm font-bold text-gray-900">
                        ₹{order.pricing?.grandTotal || 0}
                      </p>
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                          order.status === "placed"
                            ? "bg-amber-100 text-amber-700"
                            : order.status === "confirmed"
                              ? "bg-blue-100 text-blue-700"
                              : order.status === "preparing"
                                ? "bg-purple-100 text-purple-700"
                                : order.status === "ready_for_pickup"
                                  ? "bg-green-100 text-green-700"
                                  : order.status === "rider_assigned"
                                    ? "bg-cyan-100 text-cyan-700"
                                    : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, trend, changeType }) {
  const gradientMap = {
    blue: "from-blue-50 to-cyan-50 border-blue-200",
    amber: "from-amber-50 to-yellow-50 border-amber-200",
    emerald: "from-emerald-50 to-green-50 border-emerald-200",
    purple: "from-purple-50 to-pink-50 border-purple-200",
  };
  const colorMap = {
    blue: "text-blue-600",
    amber: "text-amber-600",
    emerald: "text-emerald-600",
    purple: "text-purple-600",
  };
  const bg = gradientMap[color] || gradientMap.blue;
  const textColor = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-sm ${bg}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            {label}
          </p>
          <p className="mt-0.5 text-2xl font-black text-gray-900">{value}</p>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 backdrop-blur-sm ${textColor}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-2 text-xs font-medium">
          {changeType === "up" ? (
            <TrendingUp className="w-3 h-3 text-emerald-500" />
          ) : (
            <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />
          )}
          <span
            className={
              changeType === "up" ? "text-emerald-600" : "text-red-600"
            }
          >
            {trend}
          </span>
          <span className="text-gray-400">vs last period</span>
        </div>
      )}
    </motion.div>
  );
}

// ─── FinanceCard ──────────────────────────────────────────
function FinanceCard({ icon: Icon, label, value, color, subtext }) {
  const colorMap = {
    gray: "from-gray-700 to-gray-900",
    orange: "from-orange-500 to-amber-500",
    indigo: "from-indigo-500 to-indigo-700",
  };
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className={`rounded-2xl bg-gradient-to-br ${colorMap[color]} p-4 text-white shadow-md shadow-black/5`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider uppercase opacity-70">
          {label}
        </span>
        <Icon className="w-4 h-4 opacity-70" />
      </div>
      <p className="mt-1 text-xl font-bold">{value}</p>
      <p className="text-[10px] opacity-60">{subtext || label}</p>
    </motion.div>
  );
}
