import React, { useEffect, useState, useCallback } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  LoaderCircle,
  Calendar,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Store,
  ShoppingBag,
  Users,
  Truck,
  CreditCard,
  Utensils,
  IndianRupee,
  Package,
  Award,
  Eye,
  Star,
} from "lucide-react";

import {
  getOverviewAnalytics,
  getRevenueAnalytics,
  getOrderAnalytics,
  getVendorAnalytics,
  getRiderAnalytics,
  getCustomerAnalytics,
  getPaymentAnalytics,
  getTiffinAnalytics,
  getProductAnalytics,
  getRevenueComparison,
} from "../../src/api/adminApi";

const COLORS = [
  "#f97316",
  "#fb923c",
  "#fbbf24",
  "#34d399",
  "#60a5fa",
  "#a78bfa",
];

const AdminAnalytics = () => {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [overview, setOverview] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [orders, setOrders] = useState(null);
  const [vendors, setVendors] = useState(null);
  const [riders, setRiders] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [payments, setPayments] = useState(null);
  const [tiffin, setTiffin] = useState(null);
  const [products, setProducts] = useState(null);
  const [revenueComparison, setRevenueComparison] = useState(null);

  const loadAllData = useCallback(async () => {
    if (!startDate || !endDate) return;
    try {
      setLoading(true);
      setError("");
      const [
        overviewRes,
        revenueRes,
        ordersRes,
        vendorsRes,
        ridersRes,
        customersRes,
        paymentsRes,
        tiffinRes,
        productsRes,
        comparisonRes,
      ] = await Promise.all([
        getOverviewAnalytics(startDate, endDate),
        getRevenueAnalytics(startDate, endDate),
        getOrderAnalytics(startDate, endDate),
        getVendorAnalytics(startDate, endDate),
        getRiderAnalytics(startDate, endDate),
        getCustomerAnalytics(startDate, endDate),
        getPaymentAnalytics(startDate, endDate),
        getTiffinAnalytics(startDate, endDate),
        getProductAnalytics(startDate, endDate),
        getRevenueComparison(startDate, endDate),
      ]);

      setOverview(overviewRes?.data || null);
      setRevenue(revenueRes?.data || null);
      setOrders(ordersRes?.data || null);
      setVendors(vendorsRes?.data || null);
      setRiders(ridersRes?.data || null);
      setCustomers(customersRes?.data || null);
      setPayments(paymentsRes?.data || null);
      setTiffin(tiffinRes?.data || null);
      setProducts(productsRes?.data || null);
      setRevenueComparison(comparisonRes?.data || null);
      setSuccess("Data refreshed successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load analytics");
      console.error("Analytics load error:", err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleRefresh = () => {
    loadAllData();
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "₹0";
    return `₹${Number(value).toLocaleString("en-IN")}`;
  };

  const formatNumber = (value) => {
    if (value === undefined || value === null) return "0";
    return Number(value).toLocaleString("en-IN");
  };

  const orderStatusData = orders
    ? Object.keys(orders)
        .filter(
          (k) =>
            ![
              "totalOrders",
              "completionRate",
              "cancellationRate",
              "averageOrderValue",
            ].includes(k),
        )
        .map((key) => ({
          name: key.replace(/_/g, " ").toUpperCase(),
          value: orders[key] || 0,
        }))
        .filter((item) => item.value > 0)
    : [];

  const paymentDistribution = payments?.paymentMethodDistribution
    ? Object.keys(payments.paymentMethodDistribution).map((key) => ({
        name: key,
        value: payments.paymentMethodDistribution[key],
      }))
    : [];

  const topVendors = vendors?.topVendors || [];
  const topProducts = products?.topProducts || [];

  // Helper to get total orders from all statuses
  const totalOrders = orders?.totalOrders || 0;

  return (
    <div className="p-4 mx-auto space-y-8 max-w-7xl sm:p-6">
      {/* ─── HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor platform performance, revenue, and key metrics.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
            <Calendar className="w-4 h-4 ml-2 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1.5 text-sm border-0 rounded outline-none focus:ring-0"
            />
            <span className="text-gray-300">—</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1.5 text-sm border-0 rounded outline-none focus:ring-0"
            />
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white transition duration-200 bg-orange-500 rounded-lg shadow-sm hover:bg-orange-600 hover:shadow-md"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ─── ALERTS ──────────────────────────────────────────── */}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-green-700 border border-green-200 rounded-xl bg-green-50">
          <span className="text-green-500">✓</span>
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 border border-red-200 rounded-xl bg-red-50">
          <span className="text-red-500">✗</span>
          {error}
        </div>
      )}

      {/* ─── LOADING STATE ──────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Store className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* ─── CONTENT ────────────────────────────────────────── */}
      {!loading && overview && (
        <>
          {/* KPI Cards – refined */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <KpiCard
              title="Revenue"
              value={formatCurrency(overview.revenue?.grossRevenue)}
              icon={IndianRupee}
              color="orange"
              change={revenueComparison?.grossRevenue?.percentageChange}
            />
            <KpiCard
              title="Orders"
              value={formatNumber(overview.orders?.totalOrders)}
              icon={ShoppingBag}
              color="blue"
              change={revenueComparison?.grossRevenue?.percentageChange} // just for demo; you can pass order change if available
            />
            <KpiCard
              title="Customers"
              value={formatNumber(overview.customers?.totalCustomers)}
              icon={Users}
              color="green"
            />
            <KpiCard
              title="Vendors"
              value={formatNumber(overview.vendors?.totalVendors)}
              icon={Store}
              color="purple"
            />
            <KpiCard
              title="Riders"
              value={formatNumber(overview.riders?.totalRiders)}
              icon={Truck}
              color="amber"
            />
            <KpiCard
              title="Tiffin Orders"
              value={formatNumber(overview.tiffin?.totalOrders)}
              icon={Utensils}
              color="red"
            />
          </div>

          {/* ─── Revenue & Order Charts ───────────────────────── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Revenue Trend" icon={TrendingUp}>
              {revenue?.grossRevenue !== undefined ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart
                    data={[{ name: "Current", value: revenue.grossRevenue }]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#f97316"
                      strokeWidth={3}
                      dot={{ r: 6, fill: "#f97316" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-gray-400">
                  No revenue data
                </div>
              )}
            </ChartCard>

            <ChartCard title="Order Status Distribution" icon={ShoppingBag}>
              {orderStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-gray-400">
                  No order status data
                </div>
              )}
            </ChartCard>
          </div>

          {/* ─── Vendors & Payments ───────────────────────────── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Top Vendors Table */}
            <div className="p-6 transition-shadow bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
              <h3 className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-700">
                <Award className="w-4 h-4 text-orange-500" />
                Top Vendors by Revenue
              </h3>
              {topVendors.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="py-2 text-left font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                          Vendor
                        </th>
                        <th className="py-2 text-right font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                          Orders
                        </th>
                        <th className="py-2 text-right font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topVendors.slice(0, 5).map((v, i) => (
                        <tr
                          key={i}
                          className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-orange-50/30 transition`}
                        >
                          <td className="py-2.5 font-medium text-gray-800">
                            {v.vendorName}
                          </td>
                          <td className="py-2.5 text-right text-gray-600">
                            {v.orderCount}
                          </td>
                          <td className="py-2.5 text-right font-bold text-gray-800">
                            {formatCurrency(v.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  No vendor data available
                </p>
              )}
            </div>

            {/* Payment Distribution */}
            <div className="p-6 transition-shadow bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
              <h3 className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-700">
                <CreditCard className="w-4 h-4 text-blue-500" />
                Payment Method Distribution
              </h3>
              {paymentDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={paymentDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                      label
                    >
                      {paymentDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-400">
                  No payment data
                </div>
              )}
            </div>
          </div>

          {/* ─── Tiffin Analytics ─────────────────────────────── */}
          {tiffin && tiffin.totalOrders > 0 && (
            <div className="p-6 transition-shadow bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
              <h3 className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-700">
                <Utensils className="w-4 h-4 text-amber-500" />
                Tiffin Analytics
              </h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatBox
                  label="Total Orders"
                  value={tiffin.totalOrders}
                  color="orange"
                />
                <StatBox
                  label="Revenue"
                  value={formatCurrency(tiffin.totalRevenue)}
                  color="green"
                />
                <StatBox
                  label="Avg Order Value"
                  value={formatCurrency(tiffin.averageOrderValue)}
                  color="blue"
                />
                <StatBox
                  label="Completion Rate"
                  value={
                    tiffin.completionRate !== undefined
                      ? `${tiffin.completionRate.toFixed(1)}%`
                      : "N/A"
                  }
                  color="purple"
                />
              </div>
              {tiffin.topTiffinVendors &&
                tiffin.topTiffinVendors.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                      Top Tiffin Vendors
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-2 md:grid-cols-3">
                      {tiffin.topTiffinVendors.slice(0, 3).map((v, i) => (
                        <div
                          key={i}
                          className="p-3 border border-gray-100 bg-gray-50 rounded-xl"
                        >
                          <p className="font-bold text-gray-800">
                            {v.vendorName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {v.orderCount} orders
                          </p>
                          <p className="text-sm font-bold text-orange-600">
                            {formatCurrency(v.revenue)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* ─── Top Products ──────────────────────────────────── */}
          {topProducts && topProducts.length > 0 && (
            <div className="p-6 transition-shadow bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
              <h3 className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-700">
                <Package className="w-4 h-4 text-green-500" />
                Top Selling Products
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-2 text-left font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                        Product
                      </th>
                      <th className="py-2 text-right font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                        Quantity
                      </th>
                      <th className="py-2 text-right font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.slice(0, 5).map((p, i) => (
                      <tr
                        key={i}
                        className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-orange-50/30 transition`}
                      >
                        <td className="py-2.5 font-medium text-gray-800">
                          {p.productName}
                        </td>
                        <td className="py-2.5 text-right text-gray-600">
                          {p.quantitySold}
                        </td>
                        <td className="py-2.5 text-right font-bold text-gray-800">
                          {formatCurrency(p.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── Revenue Comparison ───────────────────────────── */}
          {revenueComparison && (
            <div className="p-6 transition-shadow bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
              <h3 className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-700">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Revenue Comparison (vs Previous Period)
              </h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <ComparisonItem
                  label="Gross Revenue"
                  data={revenueComparison.grossRevenue}
                />
                <ComparisonItem
                  label="Net Revenue"
                  data={revenueComparison.netRevenue}
                />
                <ComparisonItem
                  label="Platform Commission"
                  data={revenueComparison.platformCommission}
                />
                <ComparisonItem
                  label="Avg Order Value"
                  data={revenueComparison.averageOrderValue}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─── KPI Card ──────────────────────────────────────────────────
function KpiCard({ title, value, icon: Icon, color, change }) {
  const colorMap = {
    orange: "text-orange-500 bg-orange-50",
    blue: "text-blue-500 bg-blue-50",
    green: "text-green-500 bg-green-50",
    purple: "text-purple-500 bg-purple-50",
    amber: "text-amber-500 bg-amber-50",
    red: "text-red-500 bg-red-50",
  };

  const changeColor =
    change && change > 0
      ? "text-green-600"
      : change && change < 0
        ? "text-red-600"
        : "text-gray-400";

  return (
    <div className="p-4 transition-shadow bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
            {title}
          </p>
          <p className="mt-1 text-2xl font-black text-gray-900">{value}</p>
        </div>
        <div className={`p-2 rounded-xl ${colorMap[color] || "bg-gray-50"}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {change !== undefined && change !== null && (
        <div className="flex items-center gap-1 mt-2">
          {change >= 0 ? (
            <TrendingUp className="w-3 h-3 text-green-500" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-500" />
          )}
          <span className={`text-xs font-bold ${changeColor}`}>
            {change > 0 ? "+" : ""}
            {change.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-400">vs last period</span>
        </div>
      )}
    </div>
  );
}

// ─── Chart Card ──────────────────────────────────────────────
function ChartCard({ title, icon: Icon, children }) {
  return (
    <div className="p-6 transition-shadow bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-orange-500" />
        <h3 className="text-sm font-bold text-gray-700">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Stat Box ────────────────────────────────────────────────
function StatBox({ label, value, color = "gray" }) {
  const colorMap = {
    orange: "text-orange-600",
    green: "text-green-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    red: "text-red-600",
    gray: "text-gray-900",
  };
  return (
    <div className="p-3 text-center border border-gray-100 bg-gray-50 rounded-xl">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-xl font-black ${colorMap[color] || "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}

// ─── Comparison Item ──────────────────────────────────────────
function ComparisonItem({ label, data }) {
  if (!data) return null;
  return (
    <div className="p-3 border border-gray-100 bg-gray-50 rounded-xl">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <div className="flex items-end gap-2 mt-1">
        <p className="text-lg font-black text-gray-900">
          ₹{data.current.toLocaleString("en-IN")}
        </p>
        <span
          className={`text-xs font-bold ${
            data.percentageChange >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {data.percentageChange >= 0 ? "+" : ""}
          {data.percentageChange.toFixed(1)}%
        </span>
      </div>
      <p className="text-xs text-gray-400">
        Previous: ₹{data.previous.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

export default AdminAnalytics;
