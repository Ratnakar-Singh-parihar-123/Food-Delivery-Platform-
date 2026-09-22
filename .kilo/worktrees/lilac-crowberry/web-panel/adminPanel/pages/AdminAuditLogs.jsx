import { useEffect, useState } from "react";

import {
  Activity,
  Search,
  ShieldCheck,
  AlertCircle,
  UserRound,
  Clock3,
  Eye,
  X,
  LoaderCircle,
  RefreshCw,
  Filter,
  FileText,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { getAuditLogs, getAuditLogStats } from "../../src/api/adminApi";

import { getApiError } from "../../src/api/getApiError";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    failed: 0,
    adminActions: 0,
  });

  const [loading, setLoading] = useState(true);

  const [selectedLog, setSelectedLog] = useState(null);

  const [search, setSearch] = useState("");

  const [module, setModule] = useState("");

  const [status, setStatus] = useState("");

  const [error, setError] = useState("");

  /* ==========================================
     LOAD
  ========================================== */

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [logsResponse, statsResponse] = await Promise.all([
        getAuditLogs({
          search,
          module,
          status,
        }),

        getAuditLogStats(),
      ]);

      setLogs(logsResponse?.data?.logs || []);

      setStats(statsResponse?.data || {});
    } catch (error) {
      setError(getApiError(error, "Unable to load audit logs."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [module, status]);

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <button
        type="button"
        onClick={loadData}
        className="inline-flex items-center gap-2 px-4 text-sm font-bold text-gray-700 bg-white border border-gray-200 shadow-sm h-11 rounded-xl"
      >
        <RefreshCw className="w-4 h-4" />
        Refresh
      </button>

      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Activity} label="Total Logs" value={stats.total || 0} />

        <Stat icon={Clock3} label="Today" value={stats.today || 0} />

        <Stat icon={AlertCircle} label="Failed" value={stats.failed || 0} />

        <Stat
          icon={UserRound}
          label="Admin Actions"
          value={stats.adminActions || 0}
        />
      </div>

      {/* FILTERS */}

      <div className="flex flex-col gap-3 p-4 bg-white border border-gray-200 shadow-sm rounded-2xl lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-4 top-1/2" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                loadData();
              }
            }}
            placeholder="Search admin, target or description..."
            className="w-full pr-4 text-sm border border-gray-200 outline-none h-11 rounded-xl pl-11 focus:border-orange-400"
          />
        </div>

        <select
          value={module}
          onChange={(event) => setModule(event.target.value)}
          className="px-4 text-sm bg-white border border-gray-200 h-11 rounded-xl"
        >
          <option value="">All Modules</option>

          <option value="vendor">Vendor</option>

          <option value="customer">Customer</option>

          <option value="coupon">Coupon</option>

          <option value="banner">Banner</option>

          <option value="notification">Notification</option>

          <option value="order">Order</option>

          <option value="settings">Settings</option>

          <option value="auth">Authentication</option>
        </select>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="px-4 text-sm bg-white border border-gray-200 h-11 rounded-xl"
        >
          <option value="">All Status</option>

          <option value="success">Success</option>

          <option value="failed">Failed</option>
        </select>

        <button
          onClick={loadData}
          className="inline-flex items-center justify-center gap-2 px-5 text-sm font-bold text-white bg-orange-500 h-11 rounded-xl"
        >
          <Filter className="w-4 h-4" />
          Apply
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 text-sm font-bold text-red-600 border border-red-200 rounded-xl bg-red-50">
          {error}
        </div>
      )}

      {/* TABLE */}

      <section className="overflow-hidden rounded-[26px] border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <LoaderCircle className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center">
            <FileText className="w-10 h-10 mx-auto text-gray-300" />

            <p className="mt-3 font-bold text-gray-700">No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="px-5 py-4">Admin</th>

                  <th className="px-5 py-4">Action</th>

                  <th className="px-5 py-4">Module</th>

                  <th className="px-5 py-4">Description</th>

                  <th className="px-5 py-4">Status</th>

                  <th className="px-5 py-4">Date</th>

                  <th className="px-5 py-4" />
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-gray-900">
                        {log.actor?.name || "System"}
                      </p>

                      <p className="mt-0.5 text-[10px] text-gray-400">
                        {log.actor?.email || log.actor?.type}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-600">
                        {formatText(log.action)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold text-gray-600 capitalize">
                      {log.module}
                    </td>

                    <td className="max-w-[320px] px-5 py-4">
                      <p className="text-xs text-gray-600 truncate">
                        {log.description}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {log.status === "success" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                          <XCircle className="h-3.5 w-3.5" />
                          Failed
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-[11px] text-gray-400">
                      {new Date(log.createdAt).toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="p-2 text-gray-400 rounded-lg hover:bg-orange-50 hover:text-orange-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* DETAIL MODAL */}

      {selectedLog && (
        <LogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[22px] border border-gray-200 bg-white p-5 shadow-sm">
      <span className="flex items-center justify-center w-10 h-10 text-orange-500 rounded-xl bg-orange-50">
        <Icon className="w-5 h-5" />
      </span>

      <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black text-gray-950">{value}</p>
    </div>
  );
}

function LogDetailModal({ log, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between px-6 py-5 bg-white border-b border-gray-100">
          <div>
            <h2 className="text-xl font-black text-gray-950">
              Audit Log Details
            </h2>

            <p className="mt-1 text-xs text-gray-400">{log._id}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <Info label="Description" value={log.description} />

          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Actor" value={log.actor?.name || log.actor?.type} />

            <Info label="Action" value={formatText(log.action)} />

            <Info label="Module" value={log.module} />

            <Info label="IP Address" value={log.request?.ip || "N/A"} />

            <Info label="Method" value={log.request?.method || "N/A"} />

            <Info label="API Path" value={log.request?.path || "N/A"} />
          </div>

          {log.changes?.before && (
            <JsonBox title="Before" data={log.changes.before} />
          )}

          {log.changes?.after && (
            <JsonBox title="After" data={log.changes.after} />
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="p-4 rounded-xl bg-gray-50">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-gray-800 break-words">
        {value || "N/A"}
      </p>
    </div>
  );
}

function JsonBox({ title, data }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold text-gray-700">{title}</p>

      <pre className="p-4 overflow-x-auto text-xs leading-6 text-gray-200 rounded-xl bg-gray-950">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function formatText(value = "") {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
