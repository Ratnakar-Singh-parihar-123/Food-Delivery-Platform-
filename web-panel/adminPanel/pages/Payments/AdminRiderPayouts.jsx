import React, { useEffect, useState, useCallback } from "react";
import {
  RefreshCw,
  Truck,
  IndianRupee,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  LoaderCircle,
  Calendar,
} from "lucide-react";
import { getRiderPayouts, processRiderPayout } from "../../../src/api/adminApi";

const AdminRiderPayouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [riderFilter, setRiderFilter] = useState("");

  const loadPayouts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (riderFilter) params.riderId = riderFilter;
      const response = await getRiderPayouts(params);
      setPayouts(response?.data?.payouts || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load rider payouts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, riderFilter]);

  useEffect(() => {
    loadPayouts();
  }, [loadPayouts]);

  const handleProcess = async (payoutId) => {
    if (!window.confirm("Process this rider payout?")) return;
    try {
      await processRiderPayout(payoutId);
      setSuccess("Rider payout processed successfully");
      loadPayouts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to process payout");
      setTimeout(() => setError(""), 3000);
    }
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "₹0";
    return `₹${Number(value).toLocaleString("en-IN")}`;
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

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-blue-100 text-blue-700",
    processing: "bg-purple-100 text-purple-700",
    paid: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="p-4 mx-auto space-y-6 max-w-7xl sm:p-6">
      {/* ─── HEADER ─────────────────────────────────────────── */}
      <div className="relative p-6 overflow-hidden shadow-xl rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-100/30 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 translate-x-1/2 -translate-y-1/2 opacity-10">
          <Truck className="w-full h-full text-white" />
        </div>
        <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white uppercase bg-white/20 backdrop-blur-sm rounded-full">
              <Truck className="w-3.5 h-3.5" />
              Rider Payouts
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
              Rider Payouts
            </h1>
            <p className="mt-1 text-orange-100">
              Manage weekly payouts to delivery partners.
            </p>
          </div>
          <button
            onClick={loadPayouts}
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
          <CheckCircle className="w-4 h-4 text-green-500" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 border border-red-200 rounded-xl bg-red-50 animate-in fade-in slide-in-from-top-2">
          <XCircle className="w-4 h-4 text-red-500" />
          {error}
        </div>
      )}

      {/* ─── FILTERS ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Filter:</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-orange-400"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="processing">Processing</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="text"
          placeholder="Rider ID"
          value={riderFilter}
          onChange={(e) => setRiderFilter(e.target.value)}
          className="w-40 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-orange-400"
        />
        <span className="ml-auto text-sm text-gray-400">
          {payouts.length} payout{payouts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ─── CONTENT ────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Truck className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>
      ) : payouts.length === 0 ? (
        <div className="py-12 text-center bg-white border border-gray-200 rounded-2xl">
          <Truck className="w-12 h-12 mx-auto text-gray-300" />
          <h3 className="mt-4 text-lg font-black text-gray-800">
            No rider payouts found
          </h3>
          <p className="mt-2 text-sm text-gray-400">
            Try changing your filter or refresh the page.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-4 text-xs font-bold tracking-wider text-left text-gray-500 uppercase">
                    Rider
                  </th>
                  <th className="px-5 py-4 text-xs font-bold tracking-wider text-left text-gray-500 uppercase">
                    Period
                  </th>
                  <th className="px-5 py-4 text-xs font-bold tracking-wider text-right text-gray-500 uppercase">
                    Gross
                  </th>
                  <th className="px-5 py-4 text-xs font-bold tracking-wider text-right text-gray-500 uppercase">
                    Adjustments
                  </th>
                  <th className="px-5 py-4 text-xs font-bold tracking-wider text-right text-gray-500 uppercase">
                    Net Payable
                  </th>
                  <th className="px-5 py-4 text-xs font-bold tracking-wider text-center text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-5 py-4 text-xs font-bold tracking-wider text-right text-gray-500 uppercase">
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
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {item.riderId?.name || "N/A"}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-600">
                      {item.periodStart && formatDate(item.periodStart)} —{" "}
                      {item.periodEnd && formatDate(item.periodEnd)}
                    </td>
                    <td className="px-5 py-4 text-right text-gray-800">
                      {formatCurrency(item.grossEarnings)}
                    </td>
                    <td className="px-5 py-4 text-right text-gray-800">
                      {formatCurrency(item.adjustments)}
                    </td>
                    <td className="px-5 py-4 font-bold text-right text-gray-900">
                      {formatCurrency(item.netPayable)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold ${statusColors[item.status] || "bg-gray-100"}`}
                      >
                        {item.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {item.status === "approved" ? (
                        <button
                          onClick={() => handleProcess(item._id)}
                          className="px-4 py-1.5 text-xs font-bold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition"
                        >
                          Process
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
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
};

export default AdminRiderPayouts;
