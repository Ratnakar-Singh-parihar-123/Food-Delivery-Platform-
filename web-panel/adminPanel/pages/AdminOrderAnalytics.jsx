import React, { useEffect, useState, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Calendar,
  RefreshCw,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  LoaderCircle,
  Store,
  Package,
} from "lucide-react";

import {
  getOrderAnalytics,
  getOverviewAnalytics,
} from "../../src/api/adminApi";

const COLORS = [
  "#f97316",
  "#fb923c",
  "#fbbf24",
  "#34d399",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
];

const AdminOrderAnalytics = () => {
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

  const [orderData, setOrderData] = useState(null);
  const [overview, setOverview] = useState(null);

  const loadData = useCallback(async () => {
    if (!startDate || !endDate) return;
    try {
      setLoading(true);
      setError("");
      const [orderRes, overviewRes] = await Promise.all([
        getOrderAnalytics(startDate, endDate),
        getOverviewAnalytics(startDate, endDate),
      ]);

      setOrderData(orderRes?.data || null);
      setOverview(overviewRes?.data || null);
      setSuccess("Data refreshed");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load order data");
      console.error("Order load error:", err);
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

  // Prepare status data for pie chart
  const statusData = orderData
    ? Object.keys(orderData)
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
          value: orderData[key] || 0,
        }))
        .filter((item) => item.value > 0)
    : [];

  // Prepare data for bar chart (same as statusData but sorted)
  const barData = [...statusData].sort((a, b) => b.value - a.value);

  const totalOrders = orderData?.totalOrders || 0;
  const completionRate = orderData?.completionRate || 0;
  const cancellationRate = orderData?.cancellationRate || 0;
  const avgOrderValue = overview?.revenue?.averageOrderValue || 0;

  return (
    <div className="p-4 mx-auto space-y-6 max-w-7xl sm:p-6">
      {/* ─── HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
            Order Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track order volume, status distribution, completion rates, and
            trends.
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
      {!loading && orderData && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiCard
              title="Total Orders"
              value={formatNumber(totalOrders)}
              icon={ShoppingBag}
              color="orange"
            />
            <KpiCard
              title="Completion Rate"
              value={`${completionRate.toFixed(1)}%`}
              icon={CheckCircle}
              color="green"
            />
            <KpiCard
              title="Cancellation Rate"
              value={`${cancellationRate.toFixed(1)}%`}
              icon={XCircle}
              color="red"
            />
            <KpiCard
              title="Avg Order Value"
              value={formatCurrency(avgOrderValue)}
              icon={TrendingUp}
              color="blue"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Order Status Distribution" icon={Package}>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {statusData.map((entry, index) => (
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
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-gray-400">
                  No status data
                </div>
              )}
            </ChartCard>

            <ChartCard title="Orders by Status" icon={BarChart}>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={barData}
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
                    />
                    <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-gray-400">
                  No data
                </div>
              )}
            </ChartCard>
          </div>

          {/* Status Breakdown Table */}
          <div className="p-6 transition-all duration-200 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
            <h3 className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-700">
              <Clock className="w-4 h-4 text-orange-500" />
              Order Status Breakdown
            </h3>
            {statusData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="py-3 text-left font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                        Status
                      </th>
                      <th className="py-3 text-right font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                        Count
                      </th>
                      <th className="py-3 text-right font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusData.map((item, i) => (
                      <tr
                        key={i}
                        className={`border-b border-gray-50 ${
                          i % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                        } hover:bg-orange-50/40 transition`}
                      >
                        <td className="py-3 font-medium text-gray-800">
                          {item.name}
                        </td>
                        <td className="py-3 text-right text-gray-600">
                          {item.value}
                        </td>
                        <td className="py-3 text-right text-gray-800">
                          {totalOrders > 0
                            ? ((item.value / totalOrders) * 100).toFixed(1)
                            : 0}
                          %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No status data available</p>
            )}
          </div>

          {/* Quick Summary */}
          <div className="p-6 border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl">
            <h3 className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-700">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <SummaryItem
                label="Total Orders"
                value={formatNumber(totalOrders)}
              />
              <SummaryItem
                label="Completed"
                value={formatNumber(orderData.delivered || 0)}
              />
              <SummaryItem
                label="Cancelled"
                value={formatNumber(orderData.cancelled || 0)}
              />
              <SummaryItem
                label="Completion Rate"
                value={`${completionRate.toFixed(1)}%`}
                highlight={completionRate > 70}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ─── SUB-COMPONENTS ────────────────────────────────────────────

function KpiCard({ title, value, icon: Icon, color }) {
  const colorMap = {
    orange: "text-orange-500 bg-orange-50 border-orange-100",
    green: "text-green-500 bg-green-50 border-green-100",
    red: "text-red-500 bg-red-50 border-red-100",
    blue: "text-blue-500 bg-blue-50 border-blue-100",
    purple: "text-purple-500 bg-purple-50 border-purple-100",
    amber: "text-amber-500 bg-amber-50 border-amber-100",
  };

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
    </div>
  );
}

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

function SummaryItem({ label, value, highlight }) {
  return (
    <div className="p-3 bg-white border border-gray-100 shadow-sm rounded-xl">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p
        className={`text-lg font-black ${highlight ? "text-green-600" : "text-gray-900"}`}
      >
        {value}
      </p>
    </div>
  );
}

export default AdminOrderAnalytics;
