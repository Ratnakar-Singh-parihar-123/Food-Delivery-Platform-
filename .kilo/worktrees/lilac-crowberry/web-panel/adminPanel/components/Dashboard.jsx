import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  IndianRupee,
  Wallet,
  Store,
  Users,
  TrendingUp,
  Download,
  Bike,
  Plus,
  Bell,
  MapPinned,
  ArrowUpRight,
  MoreHorizontal,
  AlertCircle,
  Clock,
  Star,
  ChevronRight,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Search,
  Menu,
  X,
  BarChart3,
  PieChart,
  LineChart,
} from "lucide-react";

import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  BarChart,
  Bar,
  Legend,
  ComposedChart,
} from "recharts";

import StatusBadge from "../../src/components/common/StatusBadge";
import DataTable from "../../src/components/common/DataTable";

// ─── API IMPORTS ─────────────────────────────────────────
import {
  getDashboardStats,
  getOrdersOverview,
  getRevenueBreakdown,
  getActiveOrders,
  getRiderStatus,
  getRecentOrders,
  getTopVendors,
  getPendingVendors,
  getPendingRiders,
  getSupportTickets,
  getServiceAreas,
} from "../../src/api/adminDashboardApi.js";
import {
  getCustomerStats,
  getRecentCustomers,
} from "../../src/api/adminCustomerApi";

const COLORS = [
  "#f97316",
  "#fb923c",
  "#fbbf24",
  "#34d399",
  "#60a5fa",
  "#a78bfa",
];

const statCardKeys = [
  {
    key: "totalOrders",
    label: "Total Orders",
    icon: ShoppingBag,
    tone: "orange",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    key: "grossOrderValue",
    label: "Gross Order Value",
    icon: IndianRupee,
    tone: "green",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    key: "platformRevenue",
    label: "Platform Revenue",
    icon: Wallet,
    tone: "blue",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    key: "activeVendors",
    label: "Active Vendors",
    icon: Store,
    tone: "purple",
    gradient: "from-purple-500 to-violet-500",
  },
  {
    key: "onlineRiders",
    label: "Online Riders",
    icon: Bike,
    tone: "yellow",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    key: "totalCustomers",
    label: "Total Customers",
    icon: Users,
    tone: "pink",
    gradient: "from-rose-500 to-pink-500",
  },
];

export default function Dashboard() {
  const [dateFilter, setDateFilter] = useState("today");
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ─── STATE ──────────────────────────────────────────────
  const [stats, setStats] = useState({
    totalOrders: 0,
    grossOrderValue: 0,
    platformRevenue: 0,
    activeVendors: 0,
    onlineRiders: 0,
    totalCustomers: 0,
  });

  const [ordersData, setOrdersData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [activeOrders, setActiveOrders] = useState({
    total: 0,
    preparing: 0,
    waitingForRider: 0,
    pickedUp: 0,
    onTheWay: 0,
  });
  const [riderStatus, setRiderStatus] = useState({
    total: 0,
    online: 0,
    busy: 0,
    available: 0,
    offline: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [pendingRiders, setPendingRiders] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [serviceAreas, setServiceAreas] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);

  // ─── FETCH DATA ──────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const results = await Promise.allSettled([
        getDashboardStats(),
        getCustomerStats(),
        getOrdersOverview(dateFilter),
        getRevenueBreakdown(),
        getActiveOrders(),
        getRiderStatus(),
        getRecentOrders(6),
        getTopVendors(),
        getPendingVendors(),
        getPendingRiders(),
        getSupportTickets(),
        getServiceAreas(),
        getRecentCustomers(5),
      ]);

      const getData = (result, fallback = null) => {
        if (result.status === "fulfilled") {
          const data = result.value?.data;
          if (data !== undefined && data !== null) return data;
          return fallback;
        }
        return fallback;
      };

      const [
        statsRes,
        customerStatsRes,
        ordersOverviewRes,
        revenueBreakdownRes,
        activeOrdersRes,
        riderStatusRes,
        recentOrdersRes,
        topVendorsRes,
        pendingVendorsRes,
        pendingRidersRes,
        supportTicketsRes,
        serviceAreasRes,
        recentCustomersRes,
      ] = results;

      const statsData = getData(statsRes, {});
      const customerStatsData = getData(customerStatsRes, {});
      setStats({
        totalOrders: statsData.totalOrders ?? 0,
        grossOrderValue: statsData.grossOrderValue ?? 0,
        platformRevenue: statsData.platformRevenue ?? 0,
        activeVendors: statsData.activeVendors ?? 0,
        onlineRiders: statsData.onlineRiders ?? 0,
        totalCustomers: customerStatsData.totalCustomers ?? 0,
      });

      const ordersOverview = getData(ordersOverviewRes, []);
      setOrdersData(Array.isArray(ordersOverview) ? ordersOverview : []);

      setRevenueData(getData(revenueBreakdownRes, []));
      setActiveOrders(
        getData(activeOrdersRes, {
          total: 0,
          preparing: 0,
          waitingForRider: 0,
          pickedUp: 0,
          onTheWay: 0,
        }),
      );
      setRiderStatus(
        getData(riderStatusRes, {
          total: 0,
          online: 0,
          busy: 0,
          available: 0,
          offline: 0,
        }),
      );

      const recent = getData(recentOrdersRes, []);
      setRecentOrders(Array.isArray(recent) ? recent.slice(0, 6) : []);

      setTopVendors(getData(topVendorsRes, []));
      setPendingVendors(getData(pendingVendorsRes, []));
      setPendingRiders(getData(pendingRidersRes, []));
      setSupportTickets(getData(supportTicketsRes, []));
      setServiceAreas(getData(serviceAreasRes, []));
      setRecentCustomers(getData(recentCustomersRes, []));
    } catch (error) {
      console.error("Unexpected dashboard error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-orange-500 animate-pulse" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 animate-pulse">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const statCards = statCardKeys.map(
    ({ key, label, icon, tone, gradient }) => ({
      label,
      value: stats[key]?.toLocaleString?.() ?? stats[key] ?? 0,
      trend: "+12.5%",
      description: "vs last period",
      icon,
      tone,
      gradient,
    }),
  );

  const displayOrdersData =
    ordersData.length > 0
      ? ordersData
      : [
          { day: "Mon", orders: 0 },
          { day: "Tue", orders: 0 },
          { day: "Wed", orders: 0 },
          { day: "Thu", orders: 0 },
          { day: "Fri", orders: 0 },
          { day: "Sat", orders: 0 },
          { day: "Sun", orders: 0 },
        ];

  // Prepare order status breakdown for pie chart
  const orderStatusBreakdown = [
    { name: "Preparing", value: activeOrders.preparing },
    { name: "Waiting for Rider", value: activeOrders.waitingForRider },
    { name: "Picked Up", value: activeOrders.pickedUp },
    { name: "On The Way", value: activeOrders.onTheWay },
  ].filter((item) => item.value > 0);

  // Rider status breakdown
  const riderStatusBreakdown = [
    { name: "Online", value: riderStatus.online },
    { name: "Busy", value: riderStatus.busy },
    { name: "Available", value: riderStatus.available },
    { name: "Offline", value: riderStatus.offline },
  ].filter((item) => item.value > 0);

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-orange-50/50 via-white to-red-50/30">
      <div className="px-3 py-4 mx-auto space-y-6 max-w-7xl sm:px-4 lg:px-6 sm:py-6 lg:py-8">
        {/* ─── KPI CARDS ───────────────────────────────────── */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 sm:gap-4">
          {statCards.map((item) => (
            <StatCard key={item.label} {...item} />
          ))}
        </section>
        {/* ─── MAIN ANALYTICS ────────────────────────────── */}
        <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.8fr] gap-4 sm:gap-6">
          {/* Orders Overview – Enhanced Area Chart */}
          <div className="p-4 transition-all duration-300 border shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border-white/50 shadow-gray-200/50 sm:p-6 hover:shadow-xl hover:shadow-orange-500/5">
            <div className="flex flex-col gap-3 mb-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-black text-gray-900">
                  Orders Overview
                </h3>
                <p className="text-xs text-gray-400">Daily order performance</p>
              </div>
              <div className="flex items-center gap-2">
                <select className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-xl bg-gray-50/80 backdrop-blur-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all">
                  <option>Orders</option>
                  <option>Revenue</option>
                  <option>Customers</option>
                </select>
                <button className="p-1.5 text-gray-400 transition rounded-lg hover:bg-gray-100">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={displayOrdersData}>
                <defs>
                  <linearGradient
                    id="orderGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="5 5"
                  stroke="#f1f5f9"
                  vertical={false}
                  strokeWidth={1.2}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: "#f97316",
                    strokeWidth: 1.5,
                    strokeDasharray: "4 4",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  fill="url(#orderGradient)"
                  activeDot={{
                    r: 6,
                    strokeWidth: 3,
                    stroke: "#fff",
                    fill: "#f97316",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Breakdown */}
          <div className="p-4 transition-all duration-300 border shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border-white/50 shadow-gray-200/50 sm:p-6 hover:shadow-xl hover:shadow-orange-500/5">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-sm font-black text-gray-900">
                Revenue Breakdown
              </h3>
              <p className="text-xs text-gray-400">
                Where platform revenue comes from
              </p>
            </div>
            {revenueData.length > 0 ? (
              <>
                <div className="relative">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={revenueData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        stroke="none"
                      >
                        {revenueData.map((_, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                            className="transition-all duration-300 hover:opacity-80"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-gray-400">
                        Revenue
                      </p>
                      <p className="text-base font-black text-transparent sm:text-xl bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text">
                        ₹ {stats.platformRevenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {revenueData.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between px-3 py-2 transition-all duration-200 rounded-xl bg-gray-50/50 hover:bg-gray-100/80"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="text-[10px] sm:text-xs font-medium text-gray-600 truncate">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-900 sm:text-sm">
                        ₹ {item.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <AlertCircle className="w-8 h-8 mb-2 text-gray-300" />
                <p className="text-sm"> No revenue data available </p>
              </div>
            )}
          </div>
        </section>
        {/* ─── LIVE OPERATIONS + STATUS CHARTS ────────────── */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 sm:gap-6">
          <OperationCard
            title="Active Orders"
            total={activeOrders.total}
            icon={ShoppingBag}
            buttonLabel="View Live Orders"
            buttonColor="orange"
            items={[
              ["Preparing", activeOrders.preparing, "orange"],
              ["Waiting for Rider", activeOrders.waitingForRider, "yellow"],
              ["Picked Up", activeOrders.pickedUp, "blue"],
              ["On The Way", activeOrders.onTheWay, "green"],
            ]}
          />

          <OperationCard
            title="Rider Status"
            total={riderStatus.total}
            icon={Bike}
            buttonLabel="View Riders"
            buttonColor="green"
            items={[
              ["Online", riderStatus.online, "green"],
              ["Busy", riderStatus.busy, "yellow"],
              ["Available", riderStatus.available, "blue"],
              ["Offline", riderStatus.offline, "gray"],
            ]}
          />
        </section>
        {/* ─── RECENT ORDERS ────────────────────────────── */}
        <section className="overflow-hidden transition-all duration-300 border shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border-white/50 shadow-gray-200/50 hover:shadow-xl hover:shadow-orange-500/5">
          <div className="flex flex-col gap-2 px-4 py-3 border-b sm:px-6 sm:py-4 border-gray-100/80 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-black text-gray-900">
                Recent Orders
              </h3>
              <p className="text-xs text-gray-400">
                Latest customer transactions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 transition-colors hover:text-orange-600">
                View All <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {recentOrders.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/80 text-left text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <tr>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3">Order ID</th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 hidden sm:table-cell">
                        Customer
                      </th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 hidden md:table-cell">
                        Vendor
                      </th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3"> Amount </th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3"> Status </th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 hidden lg:table-cell">
                        Time
                      </th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-right">
                        {" "}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/80">
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id || order._id}
                        className="transition-all duration-200 hover:bg-orange-50/40 group"
                      >
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-orange-500">
                          {order.orderNumber || order.id}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-700 hidden sm:table-cell">
                          {order.customer
                            ? `${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim() ||
                              order.customer.name ||
                              "—"
                            : "—"}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                          {order.vendor?.businessName ||
                            order.vendorName ||
                            "—"}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-gray-900">
                          ₹{" "}
                          {(
                            order.pricing?.grandTotal ||
                            order.totalAmount ||
                            order.amount ||
                            0
                          ).toLocaleString()}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs text-gray-400 hidden lg:table-cell">
                          {order.time || order.createdAt?.slice(0, 10) || "—"}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right">
                          <button className="p-1.5 text-gray-400 transition-all duration-200 rounded-lg hover:bg-gray-100 hover:text-gray-700 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-xs border-t border-gray-100/80 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-gray-400">
                  Showing {recentOrders.length} recent orders
                </p>
                <div className="flex gap-1">
                  <PaginationButton label="Previous" />
                  <PaginationButton label="1" active />
                  <PaginationButton label="2" />
                  <PaginationButton label="3" />
                  <PaginationButton label="Next" />
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 sm:py-12">
              <AlertCircle className="w-8 h-8 mb-2 text-gray-300" />
              <p className="text-sm"> No recent orders </p>
            </div>
          )}
        </section>
        {/* ─── RECENT CUSTOMERS ───────────────────────────── */}
        <section className="transition-all duration-300 border shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border-white/50 shadow-gray-200/50 hover:shadow-xl hover:shadow-orange-500/5">
          <div className="flex flex-col gap-2 px-4 py-3 border-b sm:px-6 sm:py-4 border-gray-100/80 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-black text-gray-900">
                Recent Customers
              </h3>
              <p className="text-xs text-gray-400"> Newest sign‑ups </p>
            </div>
            <button
              onClick={() => (window.location.href = "/admin/customers")}
              className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 transition-colors hover:text-orange-600"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {recentCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80 text-left text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3"> Customer </th>
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3 hidden sm:table-cell">
                      Email
                    </th>
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3 hidden md:table-cell">
                      Phone
                    </th>
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3 hidden lg:table-cell">
                      Joined
                    </th>
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/80">
                  {recentCustomers.map((customer) => {
                    const fullName =
                      customer.firstName && customer.lastName
                        ? `${customer.firstName} ${customer.lastName}`
                        : customer.name || "—";
                    const joined = customer.createdAt
                      ? new Date(customer.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : customer.joined || "—";
                    const status = customer.isActive ? "Active" : "Inactive";
                    return (
                      <tr
                        key={customer.id || customer._id}
                        className="transition-all duration-200 hover:bg-gray-50/60 group"
                      >
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2 sm:gap-3">
                            {customer.avatar ? (
                              <img
                                src={`${import.meta.env.VITE_STATIC_BASE || "http://localhost:9000"}${customer.avatar}`}
                                alt={fullName}
                                className="object-cover rounded-full shadow-sm w-7 h-7 sm:w-8 sm:h-8 ring-2 ring-white"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="flex items-center justify-center text-xs font-bold text-orange-600 bg-orange-100 rounded-full w-7 h-7 sm:w-8 sm:h-8">
                                {fullName?.charAt(0) || "U"}
                              </div>
                            )}
                            <span className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[80px] sm:max-w-[120px]">
                              {fullName}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-500 hidden sm:table-cell truncate max-w-[120px]">
                          {customer.email || "—"}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                          {customer.phone || "—"}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs text-gray-400 hidden lg:table-cell">
                          {joined}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold ${
                              status === "Active"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-6 text-center text-gray-400">
              No recent customers
            </div>
          )}
        </section>
        {/* ─── TOP VENDORS + APPROVALS ────────────────────── */}
        <section className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-4 sm:gap-6">
          {/* Top Vendors */}
          <div className="p-4 transition-all duration-300 border shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border-white/50 shadow-gray-200/50 sm:p-6 hover:shadow-xl hover:shadow-orange-500/5">
            <div className="mb-4 sm:mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-900">
                    Top Vendors
                  </h3>
                  <p className="text-xs text-gray-400">
                    Best performing partners
                  </p>
                </div>
                <button className="text-xs font-bold text-orange-500 transition-colors hover:text-orange-600">
                  View All
                </button>
              </div>
            </div>
            {topVendors.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50/80 text-left text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    <tr>
                      <th className="px-2 py-1.5 sm:py-2"> # </th>
                      <th className="px-2 py-1.5 sm:py-2"> Vendor </th>
                      <th className="px-2 py-1.5 sm:py-2 hidden sm:table-cell">
                        Type
                      </th>
                      <th className="px-2 py-1.5 sm:py-2 hidden md:table-cell">
                        Orders
                      </th>
                      <th className="px-2 py-1.5 sm:py-2"> Revenue </th>
                      <th className="px-2 py-1.5 sm:py-2 hidden lg:table-cell">
                        Rating
                      </th>
                      <th className="px-2 py-1.5 sm:py-2"> Status </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/80">
                    {topVendors.map((vendor, index) => {
                      const name = vendor.businessName || vendor.name || "—";
                      const type = vendor.category || vendor.type || "—";
                      const orders = vendor.totalOrders || vendor.orders || 0;
                      const revenue =
                        vendor.totalRevenue || vendor.revenue || 0;
                      const rating = vendor.rating || 0;
                      const status = vendor.isActive ? "Open" : "Closed";
                      return (
                        <tr
                          key={vendor._id || index}
                          className="transition-all duration-200 hover:bg-orange-50/30"
                        >
                          <td className="px-2 py-2 sm:py-2.5">
                            <span
                              className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg text-[8px] sm:text-[10px] font-black ${
                                index === 0
                                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-2 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-gray-900 truncate max-w-[80px] sm:max-w-[120px]">
                            {name}
                          </td>
                          <td className="px-2 py-2 sm:py-2.5 text-gray-500 hidden sm:table-cell text-[10px] sm:text-xs">
                            {type}
                          </td>
                          <td className="px-2 py-2 sm:py-2.5 text-gray-700 hidden md:table-cell text-[10px] sm:text-xs">
                            {orders}
                          </td>
                          <td className="px-2 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-gray-900">
                            ₹ {revenue.toLocaleString()}
                          </td>
                          <td className="px-2 py-2 sm:py-2.5 hidden lg:table-cell">
                            <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold text-amber-500">
                              ★ {rating.toFixed(1)}
                            </span>
                          </td>
                          <td className="px-2 py-2 sm:py-2.5">
                            <span
                              className={`rounded-full px-1.5 sm:px-2 py-0.5 text-[7px] sm:text-[9px] font-bold ${
                                status === "Open"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-red-50 text-red-600"
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-6 text-center text-gray-400">
                No vendor data available
              </div>
            )}
          </div>

          {/* Approvals */}
          <div className="space-y-4 sm:space-y-6">
            <CompactPanel
              title="Pending Vendors"
              subtitle="Waiting for approval"
            >
              {pendingVendors.length > 0 ? (
                pendingVendors.map((vendor, index) => (
                  <ApprovalRow
                    key={vendor._id || index}
                    title={
                      vendor.businessName ||
                      vendor.business ||
                      vendor.name ||
                      "—"
                    }
                    subtitle={
                      vendor.category || vendor.type || "—"
                        ? `${vendor.category || vendor.type || ""} ${vendor.owner ? `• ${vendor.owner}` : ""}`
                        : vendor.owner || "—"
                    }
                    meta={
                      vendor.createdAt
                        ? new Date(vendor.createdAt).toLocaleDateString("en-IN")
                        : vendor.date || "—"
                    }
                    button="View"
                    icon={Store}
                  />
                ))
              ) : (
                <div className="py-3 text-sm text-center text-gray-400 bg-gray-50/50 rounded-xl">
                  <CheckCircle className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                  No pending vendors
                </div>
              )}
            </CompactPanel>

            <CompactPanel
              title="Pending Rider KYC"
              subtitle="Verification required"
            >
              {pendingRiders.length > 0 ? (
                pendingRiders.map((rider, index) => {
                  const vehicleStr =
                    typeof rider.vehicle === "string"
                      ? rider.vehicle
                      : rider.vehicle
                        ? `${rider.vehicle.type || ""} ${rider.vehicle.model || ""}`.trim() ||
                          "Vehicle details"
                        : "N/A";
                  return (
                    <ApprovalRow
                      key={rider._id || index}
                      image={rider.profileImage || rider.photo}
                      title={
                        rider.name ||
                        `${rider.firstName || ""} ${rider.lastName || ""}`.trim() ||
                        "—"
                      }
                      subtitle={vehicleStr}
                      meta={
                        rider.createdAt
                          ? new Date(rider.createdAt).toLocaleDateString(
                              "en-IN",
                            )
                          : rider.date || "—"
                      }
                      button="Review"
                      icon={Bike}
                    />
                  );
                })
              ) : (
                <div className="py-3 text-sm text-center text-gray-400 bg-gray-50/50 rounded-xl">
                  <CheckCircle className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                  No pending riders
                </div>
              )}
            </CompactPanel>
          </div>
        </section>
        {/* ─── SUPPORT + DELIVERY AREAS ──────────────────── */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 sm:gap-6">
          <CompactPanel
            title="Open Support Tickets"
            subtitle="Issues needing attention"
          >
            {supportTickets.length > 0 ? (
              supportTickets.map((ticket, index) => (
                <div
                  key={ticket.id || index}
                  className="flex items-center justify-between py-2.5 border-b border-gray-100/80 last:border-0 group transition-all duration-200 hover:bg-orange-50/30 -mx-2 px-2 rounded-xl"
                >
                  <div>
                    <p className="text-xs font-bold text-gray-900 sm:text-sm">
                      {ticket.id || ticket.ticketId || `#${index + 1}`}
                    </p>
                    <p className="mt-0.5 text-[10px] sm:text-xs text-gray-500">
                      {ticket.issue || ticket.subject || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[7px] sm:text-[9px] font-bold ${
                        ticket.priority === "High"
                          ? "bg-red-50 text-red-600"
                          : ticket.priority === "Medium"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {ticket.priority || "Low"}
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-gray-400 hidden sm:inline">
                      {ticket.type || ticket.category || "General"}
                    </span>
                    <button className="p-1 text-gray-400 transition-all duration-200 rounded-lg opacity-0 hover:bg-gray-100 hover:text-gray-700 group-hover:opacity-100">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-3 text-sm text-center text-gray-400 bg-gray-50/50 rounded-xl">
                <CheckCircle className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                No open tickets
              </div>
            )}
          </CompactPanel>

          <div className="p-4 transition-all duration-300 border shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border-white/50 shadow-gray-200/50 sm:p-6 hover:shadow-xl hover:shadow-orange-500/5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-gray-900">
                  Delivery Area Overview
                </h3>
                <p className="text-xs text-gray-400">Service coverage status</p>
              </div>
              <span className="flex items-center justify-center w-8 h-8 text-orange-500 sm:w-9 sm:h-9 rounded-xl bg-orange-50/80">
                <MapPinned className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4 sm:gap-3">
              <AreaStat
                value={serviceAreas.length}
                label="Total Zones"
                tone="orange"
              />
              <AreaStat
                value={serviceAreas.filter((a) => a.active).length}
                label="Active"
                tone="green"
              />
              <AreaStat
                value={serviceAreas.filter((a) => !a.active).length}
                label="Paused"
                tone="yellow"
              />
            </div>
            {serviceAreas.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-24 overflow-y-auto custom-scrollbar">
                {serviceAreas.map((area, index) => (
                  <span
                    key={area.id || index}
                    className={`rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 text-[8px] sm:text-[9px] font-bold transition-all duration-200 hover:scale-105 ${
                      area.active
                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                    }`}
                  >
                    {area.name || area.areaName || "—"}
                  </span>
                ))}
              </div>
            ) : (
              <div className="py-3 text-sm text-center text-gray-400">
                No service areas defined
              </div>
            )}
          </div>
        </section>
        {/* ─── QUICK ACTIONS ───────────────────────────────── */}
        <section className="p-4 transition-all duration-300 border shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border-white/50 shadow-gray-200/50 sm:p-6 hover:shadow-xl hover:shadow-orange-500/5">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h3 className="text-sm font-black text-gray-900">
                Quick Actions
              </h3>
              <p className="text-xs text-gray-400">Common admin shortcuts</p>
            </div>
            <Plus className="w-5 h-5 text-orange-500" />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 sm:gap-3">
            {[
              { label: "Add Vendor", icon: Store },
              { label: "Add Rider", icon: Bike },
              { label: "Create Coupon", icon: IndianRupee },
              { label: "Send Notification", icon: Bell },
              { label: "Live Orders", icon: ShoppingBag },
              { label: "Settlement", icon: Wallet },
            ].map(({ label, icon: Icon }) => (
              <button
                key={label}
                className="group rounded-xl sm:rounded-2xl border border-gray-200/80 bg-gray-50/50 p-3 sm:p-3.5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:bg-orange-50/50 hover:shadow-lg hover:shadow-orange-500/10"
              >
                <span className="flex items-center justify-center w-8 h-8 text-orange-500 transition-all duration-300 bg-white shadow-sm rounded-xl group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-amber-500 group-hover:text-white group-hover:shadow-orange-500/30">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </span>
                <p className="mt-1.5 sm:mt-2 text-[9px] sm:text-[11px] font-bold text-gray-700 group-hover:text-orange-600 transition-colors">
                  {label}
                </p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── HELPER COMPONENTS ──────────────────────────────────

function StatCard({
  label,
  value,
  trend,
  description,
  icon: Icon,
  tone,
  gradient,
}) {
  const styles = {
    orange: "from-orange-50 to-amber-50 text-orange-600",
    green: "from-emerald-50 to-teal-50 text-emerald-600",
    blue: "from-blue-50 to-indigo-50 text-blue-600",
    purple: "from-purple-50 to-violet-50 text-purple-600",
    yellow: "from-amber-50 to-orange-50 text-amber-600",
    pink: "from-rose-50 to-pink-50 text-rose-600",
  };

  const borderStyles = {
    orange: "hover:border-orange-200",
    green: "hover:border-emerald-200",
    blue: "hover:border-blue-200",
    purple: "hover:border-purple-200",
    yellow: "hover:border-amber-200",
    pink: "hover:border-rose-200",
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-3 sm:p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/50 ${borderStyles[tone]}`}
    >
      <div className="absolute inset-0 transition-opacity duration-300 opacity-0 pointer-events-none group-hover:opacity-100 bg-gradient-to-br from-white via-transparent to-transparent" />
      <div className="relative flex items-start justify-between">
        <span
          className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br ${styles[tone]} shadow-sm`}
        >
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </span>
        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 sm:px-2 py-0.5 text-[7px] sm:text-[9px] font-bold text-emerald-600">
          <TrendingUp className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
          {trend}
        </span>
      </div>
      <p className="mt-2 sm:mt-3 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-0.5 sm:mt-1 text-base sm:text-xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
        {value}
      </p>
      <p className="mt-0.5 text-[9px] sm:text-xs text-gray-400">
        {description}
      </p>
      <div className="absolute w-16 h-16 transition-opacity duration-500 rounded-full opacity-0 -bottom-6 -right-6 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100/20 to-transparent group-hover:opacity-100" />
    </div>
  );
}

function OperationCard({
  title,
  total,
  icon: Icon,
  items,
  buttonLabel,
  buttonColor,
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/50 shadow-lg shadow-gray-200/50 p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="flex items-center justify-center w-8 h-8 text-orange-500 sm:w-9 sm:h-9 rounded-xl bg-orange-50/80">
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </span>
          <div>
            <h3 className="text-xs font-black text-gray-900 sm:text-sm">
              {title}
            </h3>
            <p className="text-[9px] sm:text-xs text-gray-400">
              Live operation status
            </p>
          </div>
        </div>
        <span className="text-xl font-black text-transparent sm:text-2xl bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text">
          {total}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-3 sm:mt-4">
        {items.map(([label, value, tone]) => (
          <div
            key={label}
            className="px-2 sm:px-2.5 py-1.5 sm:py-2 border border-gray-100/80 rounded-xl bg-gray-50/50 transition-all duration-200 hover:bg-gray-100/80 hover:scale-[1.02]"
          >
            <p className="text-[7px] sm:text-[9px] font-bold uppercase tracking-wider text-gray-400">
              {label}
            </p>
            <p
              className={`mt-0.5 text-xs sm:text-base font-black ${toneText(tone)}`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
      <button
        className={`mt-3 sm:mt-3.5 w-full rounded-xl py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold transition-all duration-300 hover:scale-[1.02] ${
          buttonColor === "green"
            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:shadow-emerald-200/30"
            : "bg-orange-50 text-orange-600 hover:bg-orange-100 hover:shadow-orange-200/30"
        } hover:shadow-lg`}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function CompactPanel({ title, subtitle, children }) {
  return (
    <div className="p-4 transition-all duration-300 border shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border-white/50 shadow-gray-200/50 sm:p-6 hover:shadow-xl hover:shadow-orange-500/5">
      <div className="mb-3 sm:mb-4">
        <h3 className="text-sm font-black text-gray-900"> {title} </h3>
        <p className="mt-0.5 text-xs text-gray-400"> {subtitle} </p>
      </div>
      {children}
    </div>
  );
}

function ApprovalRow({ image, title, subtitle, meta, button, icon: Icon }) {
  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 py-2 sm:py-2.5 border-b border-gray-100/80 last:border-0 group transition-all duration-200 hover:bg-orange-50/20 -mx-2 px-2 rounded-xl">
      <div className="flex items-center min-w-0 gap-2 sm:gap-3">
        {image ? (
          <img
            src={image}
            alt={title}
            className="object-cover shadow-sm w-7 h-7 sm:w-8 sm:h-8 rounded-xl ring-2 ring-white"
          />
        ) : (
          <div className="flex items-center justify-center text-orange-500 w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-orange-50/80">
            {Icon ? (
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-bold text-gray-900 truncate max-w-[100px] sm:max-w-[150px]">
            {title}
          </p>
          <p className="text-[9px] sm:text-xs text-gray-400 truncate max-w-[80px] sm:max-w-[120px]">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <span className="hidden sm:block text-[8px] sm:text-[9px] text-gray-400">
          {meta}
        </span>
        <button className="rounded-lg bg-orange-50 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[8px] sm:text-[9px] font-bold text-orange-600 transition-all duration-200 hover:bg-orange-100 hover:scale-105">
          {button}
        </button>
      </div>
    </div>
  );
}

function AreaStat({ value, label, tone }) {
  const styles = {
    orange: "bg-orange-50/80 text-orange-600",
    green: "bg-emerald-50/80 text-emerald-600",
    yellow: "bg-amber-50/80 text-amber-600",
  };

  return (
    <div
      className={`rounded-xl p-2 sm:p-2.5 text-center transition-all duration-200 hover:scale-105 ${styles[tone]}`}
    >
      <p className="text-lg font-black sm:text-xl"> {value} </p>
      <p className="mt-0.5 text-[7px] sm:text-[9px] font-bold uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}

function PaginationButton({ label, active = false }) {
  return (
    <button
      className={`rounded-lg border px-2 sm:px-2.5 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-bold transition-all duration-200 ${
        active
          ? "border-orange-500 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/30"
          : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Custom Tooltip for Chart ────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="px-3 py-2 border shadow-xl sm:px-4 sm:py-3 bg-white/95 backdrop-blur-sm border-gray-200/80 shadow-gray-200/50 rounded-xl sm:rounded-2xl">
      <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-0.5 sm:mt-1 text-sm sm:text-base font-black text-orange-500">
        {payload[0]?.value} Orders
      </p>
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="px-3 py-2 border shadow-xl sm:px-4 sm:py-3 bg-white/95 backdrop-blur-sm border-gray-200/80 shadow-gray-200/50 rounded-xl sm:rounded-2xl">
      <p className="text-xs font-bold text-gray-900 sm:text-sm">
        {payload[0]?.name}
      </p>
      <p className="text-xs text-gray-500 sm:text-sm">
        ₹ {payload[0]?.value?.toLocaleString?.() ?? payload[0]?.value}
      </p>
    </div>
  );
}

function toneText(tone) {
  const map = {
    orange: "text-orange-500",
    green: "text-emerald-500",
    yellow: "text-amber-500",
    blue: "text-blue-500",
    gray: "text-gray-400",
  };
  return map[tone] || "text-gray-900";
}
