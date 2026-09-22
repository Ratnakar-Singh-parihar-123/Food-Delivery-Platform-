import React, { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  RefreshCw,
  IndianRupee,
  Users,
  Truck,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  LoaderCircle,
  Store,
  Package,
  Filter,
  FileText,
} from "lucide-react";
import {
  getPaymentOverview,
  getVendorSettlements,
  processVendorSettlement,
  getRiderEarnings,
  getRiderPayouts,
  processRiderPayout,
  getRefunds,
  getReconciliation,
  getPaymentAnalytics,
} from "../../../src/api/adminApi";

const AdminPayments = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Date filter for analytics
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });

  // Data states
  const [overview, setOverview] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [riderEarnings, setRiderEarnings] = useState([]);
  const [riderPayouts, setRiderPayouts] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [reconciliation, setReconciliation] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  // Settlement filter
  const [settlementFilter, setSettlementFilter] = useState("");

  // Load data based on active tab
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      let promises = {};

      switch (activeTab) {
        case "overview":
          promises.overview = getPaymentOverview();
          promises.analytics = getPaymentAnalytics(startDate, endDate);
          break;
        case "settlements":
          promises.settlements = getVendorSettlements({
            status: settlementFilter || undefined,
          });
          break;
        case "rider-earnings":
          promises.riderEarnings = getRiderEarnings();
          break;
        case "rider-payouts":
          promises.riderPayouts = getRiderPayouts();
          break;
        case "refunds":
          promises.refunds = getRefunds();
          break;
        case "reconciliation":
          promises.reconciliation = getReconciliation();
          break;
        default:
          break;
      }

      const results = await Promise.allSettled(Object.values(promises));
      const keys = Object.keys(promises);
      results.forEach((result, index) => {
        const key = keys[index];
        if (result.status === "fulfilled") {
          if (key === "overview") setOverview(result.value?.data);
          else if (key === "analytics") setAnalytics(result.value?.data);
          else if (key === "settlements")
            setSettlements(result.value?.data?.settlements || []);
          else if (key === "riderEarnings")
            setRiderEarnings(result.value?.data?.earnings || []);
          else if (key === "riderPayouts")
            setRiderPayouts(result.value?.data?.payouts || []);
          else if (key === "refunds")
            setRefunds(result.value?.data?.refunds || []);
          else if (key === "reconciliation")
            setReconciliation(result.value?.data);
        } else {
          console.error(`Failed to load ${key}:`, result.reason);
          setError(`Failed to load ${key} data`);
        }
      });

      setSuccess("Data refreshed");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [activeTab, settlementFilter, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => loadData();

  // Process settlement
  const handleProcessSettlement = async (settlementId) => {
    if (!window.confirm("Process this settlement?")) return;
    try {
      await processVendorSettlement(settlementId);
      setSuccess("Settlement processed successfully");
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to process settlement");
    }
  };

  // Process payout
  const handleProcessPayout = async (payoutId) => {
    if (!window.confirm("Process this rider payout?")) return;
    try {
      await processRiderPayout(payoutId);
      setSuccess("Payout processed successfully");
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to process payout");
    }
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "₹0";
    return `₹${Number(value).toLocaleString("en-IN")}`;
  };

  const formatNumber = (value) => {
    if (value === undefined || value === null) return "0";
    return Number(value).toLocaleString("en-IN");
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 mx-auto space-y-6 max-w-7xl sm:p-6">
      {/* ─── HEADER ─────────────────────────────────────────── */}
      <div className="relative p-6 overflow-hidden shadow-xl rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-100/30 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 translate-x-1/2 -translate-y-1/2 opacity-10">
          <CreditCard className="w-full h-full text-white" />
        </div>
        <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white uppercase bg-white/20 backdrop-blur-sm rounded-full">
              <CreditCard className="w-3.5 h-3.5" />
              Payment Management
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
              Payments
            </h1>
            <p className="mt-1 text-orange-100">
              Manage payments, settlements, and rider payouts.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-orange-700 transition duration-200 bg-white rounded-lg shadow-md hover:shadow-lg hover:scale-105"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ─── ALERTS ──────────────────────────────────────────── */}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-green-700 border border-green-200 rounded-xl bg-green-50 animate-in fade-in slide-in-from-top-2">
          <span className="text-green-500">✓</span>
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 border border-red-200 rounded-xl bg-red-50 animate-in fade-in slide-in-from-top-2">
          <span className="text-red-500">✗</span>
          {error}
        </div>
      )}

      {/* ─── TABS ────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1 p-1 bg-white border border-gray-200 shadow-sm rounded-xl">
        {[
          { id: "overview", label: "Overview", icon: CreditCard },
          { id: "settlements", label: "Vendor Settlements", icon: Store },
          { id: "rider-earnings", label: "Rider Earnings", icon: Truck },
          { id: "rider-payouts", label: "Rider Payouts", icon: FileText },
          { id: "refunds", label: "Refunds", icon: XCircle },
          { id: "reconciliation", label: "Reconciliation", icon: CheckCircle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition ${
              activeTab === tab.id
                ? "bg-orange-500 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── LOADING ─────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* ─── CONTENT ────────────────────────────────────────── */}
      {!loading && (
        <>
          {activeTab === "overview" && (
            <OverviewTab
              overview={overview}
              analytics={analytics}
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              formatCurrency={formatCurrency}
              formatNumber={formatNumber}
            />
          )}

          {activeTab === "settlements" && (
            <SettlementsTab
              settlements={settlements}
              filter={settlementFilter}
              setFilter={setSettlementFilter}
              onProcess={handleProcessSettlement}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          )}

          {activeTab === "rider-earnings" && (
            <RiderEarningsTab
              earnings={riderEarnings}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          )}

          {activeTab === "rider-payouts" && (
            <RiderPayoutsTab
              payouts={riderPayouts}
              onProcess={handleProcessPayout}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          )}

          {activeTab === "refunds" && (
            <RefundsTab
              refunds={refunds}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          )}

          {activeTab === "reconciliation" && (
            <ReconciliationTab
              data={reconciliation}
              formatCurrency={formatCurrency}
            />
          )}
        </>
      )}
    </div>
  );
};

// ─── OVERVIEW TAB ─────────────────────────────────────────────

function OverviewTab({
  overview,
  analytics,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  formatCurrency,
  formatNumber,
}) {
  const data = overview || {};
  const analyticsData = analytics || {};

  return (
    <div className="space-y-6">
      {/* Date range filter */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-orange-400"
          />
          <span className="text-gray-400">—</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-orange-400"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard
          title="Total Collected"
          value={formatCurrency(data.totalCollected)}
          icon={IndianRupee}
          color="orange"
        />
        <KpiCard
          title="Vendor Payable"
          value={formatCurrency(data.vendorPayable)}
          icon={Store}
          color="blue"
        />
        <KpiCard
          title="Rider Payable"
          value={formatCurrency(data.riderPayable)}
          icon={Truck}
          color="green"
        />
        <KpiCard
          title="Platform Commission"
          value={formatCurrency(data.platformCommission)}
          icon={CreditCard}
          color="purple"
        />
      </div>

      {/* Analytics (if available) */}
      {analyticsData && (
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <h3 className="mb-4 text-sm font-bold text-gray-700">
            Payment Analytics
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <SummaryItem
              label="Total Payments"
              value={formatNumber(analyticsData.totalPayments)}
            />
            <SummaryItem
              label="Successful"
              value={formatNumber(analyticsData.successful)}
            />
            <SummaryItem
              label="Failed"
              value={formatNumber(analyticsData.failed)}
            />
            <SummaryItem
              label="Refunded"
              value={formatNumber(analyticsData.refunded)}
            />
          </div>
          {analyticsData.paymentMethodBreakdown &&
            analyticsData.paymentMethodBreakdown.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Payment Methods
                </p>
                <div className="flex flex-wrap gap-3">
                  {analyticsData.paymentMethodBreakdown.map((item, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-700 rounded-full bg-gray-50"
                    >
                      {item._id}: {item.count}
                    </span>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

// ─── SETTLEMENTS TAB ─────────────────────────────────────────

function SettlementsTab({
  settlements,
  filter,
  setFilter,
  onProcess,
  formatCurrency,
  formatDate,
}) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    eligible: "bg-green-100 text-green-700",
    processing: "bg-blue-100 text-blue-700",
    paid: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
    held: "bg-gray-100 text-gray-700",
    reversed: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-orange-400"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="eligible">Eligible</option>
          <option value="processing">Processing</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="held">Held</option>
          <option value="reversed">Reversed</option>
        </select>
      </div>

      {settlements.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          No settlements found
        </div>
      ) : (
        <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-600 uppercase">
                    Vendor
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-600 uppercase">
                    Order
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-right text-gray-600 uppercase">
                    Gross
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-right text-gray-600 uppercase">
                    Commission
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-right text-gray-600 uppercase">
                    Net Payable
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-right text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {settlements.map((item) => (
                  <tr
                    key={item._id}
                    className="transition hover:bg-orange-50/30"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.vendorId?.businessName || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.orderId?._id || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-800">
                      {formatCurrency(item.grossAmount)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-800">
                      {formatCurrency(item.commission)}
                    </td>
                    <td className="px-4 py-3 font-bold text-right text-gray-900">
                      {formatCurrency(item.netPayable)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${statusColors[item.status] || "bg-gray-100"}`}
                      >
                        {item.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.status === "eligible" && (
                        <button
                          onClick={() => onProcess(item._id)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition"
                        >
                          Process
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RIDER EARNINGS TAB ─────────────────────────────────────

function RiderEarningsTab({ earnings, formatCurrency, formatDate }) {
  return (
    <div className="space-y-4">
      {earnings.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          No rider earnings found
        </div>
      ) : (
        <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-600 uppercase">
                    Rider
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-600 uppercase">
                    Order
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-right text-gray-600 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-right text-gray-600 uppercase">
                    Earned At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {earnings.map((item) => (
                  <tr
                    key={item._id}
                    className="transition hover:bg-orange-50/30"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.riderId?.name || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.orderId?._id || "N/A"}
                    </td>
                    <td className="px-4 py-3 font-bold text-right text-gray-900">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          item.status === "eligible"
                            ? "bg-green-100 text-green-700"
                            : item.status === "paid"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-right text-gray-500">
                      {formatDate(item.earnedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RIDER PAYOUTS TAB ──────────────────────────────────────

function RiderPayoutsTab({ payouts, onProcess, formatCurrency, formatDate }) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-blue-100 text-blue-700",
    processing: "bg-purple-100 text-purple-700",
    paid: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-4">
      {payouts.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          No rider payouts found
        </div>
      ) : (
        <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-600 uppercase">
                    Rider
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-600 uppercase">
                    Period
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-right text-gray-600 uppercase">
                    Gross
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-right text-gray-600 uppercase">
                    Net Payable
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-right text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payouts.map((item) => (
                  <tr
                    key={item._id}
                    className="transition hover:bg-orange-50/30"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.riderId?.name || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {item.periodStart && formatDate(item.periodStart)} —{" "}
                      {item.periodEnd && formatDate(item.periodEnd)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-800">
                      {formatCurrency(item.grossEarnings)}
                    </td>
                    <td className="px-4 py-3 font-bold text-right text-gray-900">
                      {formatCurrency(item.netPayable)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${statusColors[item.status] || "bg-gray-100"}`}
                      >
                        {item.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.status === "approved" && (
                        <button
                          onClick={() => onProcess(item._id)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition"
                        >
                          Process
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── REFUNDS TAB ─────────────────────────────────────────────

function RefundsTab({ refunds, formatCurrency, formatDate }) {
  const statusColors = {
    requested: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    completed: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-4">
      {refunds.length === 0 ? (
        <div className="py-12 text-center text-gray-400">No refunds found</div>
      ) : (
        <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-600 uppercase">
                    Order
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-right text-gray-600 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-600 uppercase">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-center text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-right text-gray-600 uppercase">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {refunds.map((item) => (
                  <tr
                    key={item._id}
                    className="transition hover:bg-orange-50/30"
                  >
                    <td className="px-4 py-3 text-gray-600">
                      {item.orderId?._id || "N/A"}
                    </td>
                    <td className="px-4 py-3 font-bold text-right text-gray-900">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.reason || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${statusColors[item.status] || "bg-gray-100"}`}
                      >
                        {item.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-right text-gray-500">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RECONCILIATION TAB ──────────────────────────────────────

function ReconciliationTab({ data, formatCurrency }) {
  if (!data) {
    return (
      <div className="py-12 text-center text-gray-400">
        No reconciliation data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard
          title="Captured Amount"
          value={formatCurrency(data.capturedAmount)}
          icon={CheckCircle}
          color="green"
        />
        <KpiCard
          title="Refunded Amount"
          value={formatCurrency(data.refundedAmount)}
          icon={XCircle}
          color="red"
        />
        <KpiCard
          title="Transferred Amount"
          value={formatCurrency(data.transferredAmount)}
          icon={TrendingUp}
          color="blue"
        />
        <KpiCard
          title="Pending Amount"
          value={formatCurrency(data.pendingAmount)}
          icon={Clock}
          color="orange"
        />
      </div>
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <p className="text-sm text-gray-500">
          <strong>Reconciliation Summary:</strong> Total captured payments ={" "}
          {formatCurrency(data.capturedAmount)}, of which{" "}
          {formatCurrency(data.refundedAmount)} refunded,{" "}
          {formatCurrency(data.transferredAmount)} transferred to vendors, and{" "}
          {formatCurrency(data.pendingAmount)} pending settlement.
        </p>
      </div>
    </div>
  );
}

// ─── SUB-COMPONENTS ────────────────────────────────────────────

function KpiCard({ title, value, icon: Icon, color }) {
  const colorMap = {
    orange: "text-orange-500 bg-orange-50 border-orange-100",
    blue: "text-blue-500 bg-blue-50 border-blue-100",
    green: "text-green-500 bg-green-50 border-green-100",
    purple: "text-purple-500 bg-purple-50 border-purple-100",
    red: "text-red-500 bg-red-50 border-red-100",
    amber: "text-amber-500 bg-amber-50 border-amber-100",
    emerald: "text-emerald-500 bg-emerald-50 border-emerald-100",
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

function SummaryItem({ label, value }) {
  return (
    <div className="p-3 border border-gray-100 bg-gray-50 rounded-xl">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className="text-lg font-black text-gray-900">{value}</p>
    </div>
  );
}

export default AdminPayments;
