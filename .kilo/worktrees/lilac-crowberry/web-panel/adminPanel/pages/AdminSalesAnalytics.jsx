import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Store,
  ShoppingBag,
  IndianRupee,
  Package,
  Award,
  CreditCard,
  CheckCircle,
} from "lucide-react";

import {
  getOverviewAnalytics,
  getRevenueComparison,
  getVendorAnalytics,
  getProductAnalytics,
  getPaymentAnalytics,
} from "../../src/api/adminApi";

const COLORS = [
  "#f97316",
  "#fb923c",
  "#fbbf24",
  "#34d399",
  "#60a5fa",
  "#a78bfa",
];

const AdminSalesAnalytics = () => {
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
  const [revenueComparison, setRevenueComparison] = useState(null);
  const [vendors, setVendors] = useState(null);
  const [products, setProducts] = useState(null);
  const [payments, setPayments] = useState(null);

  const loadData = useCallback(async () => {
    if (!startDate || !endDate) return;
    try {
      setLoading(true);
      setError("");
      const [overviewRes, comparisonRes, vendorsRes, productsRes, paymentsRes] =
        await Promise.all([
          getOverviewAnalytics(startDate, endDate),
          getRevenueComparison(startDate, endDate),
          getVendorAnalytics(startDate, endDate),
          getProductAnalytics(startDate, endDate),
          getPaymentAnalytics(startDate, endDate),
        ]);

      setOverview(overviewRes?.data || null);
      setRevenueComparison(comparisonRes?.data || null);
      setVendors(vendorsRes?.data || null);
      setProducts(productsRes?.data || null);
      setPayments(paymentsRes?.data || null);
      setSuccess("Data refreshed");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load sales data");
      console.error("Sales load error:", err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => loadData();

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "₹0";
    return `₹${Number(value).toLocaleString("en-IN")}`;
  };

  const formatNumber = (value) => {
    if (value === undefined || value === null) return "0";
    return Number(value).toLocaleString("en-IN");
  };

  const topVendors = vendors?.topVendors || [];
  const topProducts = products?.topProducts || [];
  const paymentDistribution = payments?.paymentMethodDistribution
    ? Object.keys(payments.paymentMethodDistribution).map((key) => ({
        name: key,
        value: payments.paymentMethodDistribution[key],
      }))
    : [];

  const vendorSalesData = topVendors.slice(0, 8).map((v) => ({
    name:
      v.vendorName?.length > 15
        ? v.vendorName.substring(0, 12) + "…"
        : v.vendorName,
    revenue: v.revenue || 0,
    orders: v.orderCount || 0,
  }));

  const productSalesData = topProducts.slice(0, 8).map((p) => ({
    name:
      p.productName?.length > 15
        ? p.productName.substring(0, 12) + "…"
        : p.productName,
    revenue: p.revenue || 0,
    quantity: p.quantitySold || 0,
  }));

  const revenueData = overview?.revenue || {};
  const orderData = overview?.orders || {};

  return (
    <div className="p-4 mx-auto space-y-6 max-w-7xl sm:p-6">
      {/* ─── HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
            Sales Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track revenue, orders, top products, and vendor performance.
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

      {/* ─── LOADING ─────────────────────────────────────────── */}
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
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiCard
              title="Total Sales"
              value={formatCurrency(revenueData.grossRevenue)}
              icon={IndianRupee}
              color="orange"
              change={revenueComparison?.grossRevenue?.percentageChange}
            />
            <KpiCard
              title="Orders"
              value={formatNumber(orderData.totalOrders)}
              icon={ShoppingBag}
              color="blue"
            />
            <KpiCard
              title="Average Order Value"
              value={formatCurrency(revenueData.averageOrderValue)}
              icon={TrendingUp}
              color="green"
            />
            <KpiCard
              title="Completed Orders"
              value={formatNumber(orderData.delivered || 0)}
              icon={CheckCircle}
              color="purple"
            />
          </div>

          {/* Sales Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Sales by Vendor" icon={Store}>
              {vendorSalesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={vendorSalesData}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={80}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#f97316"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-gray-400">
                  No vendor sales data
                </div>
              )}
            </ChartCard>

            <ChartCard title="Sales by Product" icon={Package}>
              {productSalesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={productSalesData}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={80}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#60a5fa"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-gray-400">
                  No product sales data
                </div>
              )}
            </ChartCard>
          </div>

          {/* Top Vendors & Payment Distribution */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TopVendorsTable
              topVendors={topVendors}
              formatCurrency={formatCurrency}
            />
            <PaymentDistributionChart
              paymentDistribution={paymentDistribution}
            />
          </div>

          {/* Top Products Table */}
          {topProducts.length > 0 && (
            <TopProductsTable
              topProducts={topProducts}
              formatCurrency={formatCurrency}
            />
          )}

          {/* Revenue Comparison */}
          {revenueComparison && (
            <ComparisonSection revenueComparison={revenueComparison} />
          )}
        </>
      )}
    </div>
  );
};

// ─── KPI CARD ──────────────────────────────────────────────────
function KpiCard({ title, value, icon: Icon, color, change }) {
  const colorMap = {
    orange: "text-orange-500 bg-orange-50 border-orange-100",
    blue: "text-blue-500 bg-blue-50 border-blue-100",
    green: "text-green-500 bg-green-50 border-green-100",
    purple: "text-purple-500 bg-purple-50 border-purple-100",
    amber: "text-amber-500 bg-amber-50 border-amber-100",
    red: "text-red-500 bg-red-50 border-red-100",
  };

  const changeColor =
    change && change > 0
      ? "text-green-600"
      : change && change < 0
        ? "text-red-600"
        : "text-gray-400";

  return (
    <div className="p-4 transition-all duration-200 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
            {title}
          </p>
          <p className="mt-1 text-2xl font-black text-gray-900">{value}</p>
        </div>
        <div
          className={`p-2 rounded-xl border ${colorMap[color] || "bg-gray-50 border-gray-200"}`}
        >
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

// ─── CHART CARD ──────────────────────────────────────────────
function ChartCard({ title, icon: Icon, children }) {
  return (
    <div className="p-6 transition-all duration-200 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-orange-500" />
        <h3 className="text-sm font-bold text-gray-700">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── TOP VENDORS TABLE ──────────────────────────────────────
function TopVendorsTable({ topVendors, formatCurrency }) {
  return (
    <div className="p-6 transition-all duration-200 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
      <h3 className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-700">
        <Award className="w-4 h-4 text-orange-500" />
        Top Vendors by Revenue
      </h3>
      {topVendors.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className="py-3 text-left font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                  Vendor
                </th>
                <th className="py-3 text-right font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                  Orders
                </th>
                <th className="py-3 text-right font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {topVendors.slice(0, 5).map((v, i) => (
                <tr
                  key={i}
                  className={`border-b border-gray-50 ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  } hover:bg-orange-50/40 transition`}
                >
                  <td className="py-3 font-medium text-gray-800">
                    {v.vendorName}
                  </td>
                  <td className="py-3 text-right text-gray-600">
                    {v.orderCount}
                  </td>
                  <td className="py-3 font-bold text-right text-gray-800">
                    {formatCurrency(v.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-400">No vendor data available</p>
      )}
    </div>
  );
}

// ─── PAYMENT DISTRIBUTION CHART ────────────────────────────
function PaymentDistributionChart({ paymentDistribution }) {
  return (
    <div className="p-6 transition-all duration-200 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
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
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {paymentDistribution.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="white"
                  strokeWidth={2}
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
  );
}

// ─── TOP PRODUCTS TABLE ─────────────────────────────────────
function TopProductsTable({ topProducts, formatCurrency }) {
  return (
    <div className="p-6 transition-all duration-200 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
      <h3 className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-700">
        <Package className="w-4 h-4 text-green-500" />
        Top Selling Products
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-100">
              <th className="py-3 text-left font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                Product
              </th>
              <th className="py-3 text-right font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                Quantity
              </th>
              <th className="py-3 text-right font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody>
            {topProducts.slice(0, 5).map((p, i) => (
              <tr
                key={i}
                className={`border-b border-gray-50 ${
                  i % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                } hover:bg-orange-50/40 transition`}
              >
                <td className="py-3 font-medium text-gray-800">
                  {p.productName}
                </td>
                <td className="py-3 text-right text-gray-600">
                  {p.quantitySold}
                </td>
                <td className="py-3 font-bold text-right text-gray-800">
                  {formatCurrency(p.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── COMPARISON SECTION ─────────────────────────────────────
function ComparisonSection({ revenueComparison }) {
  return (
    <div className="p-6 transition-all duration-200 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
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
  );
}

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
      <p className="mt-1 text-xs text-gray-400">
        Previous: ₹{data.previous.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

export default AdminSalesAnalytics;
