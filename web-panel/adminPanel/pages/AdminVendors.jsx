import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  BadgeCheck,
  Ban,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Eye,
  LoaderCircle,
  Mail,
  MapPin,
  Percent,
  Phone,
  Search,
  ShieldCheck,
  Store,
  ToggleLeft,
  ToggleRight,
  Unlock,
  User,
  UserRound,
  X,
  Clock,
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import {
  blockVendorApi,
  getAllVendorsApi,
  getVendorByIdApi,
  unblockVendorApi,
  updateVendorCommissionApi,
  updateVendorStatusApi,
} from "../../src/api/adminApi";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:9000";

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 20,
  });
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [blockModal, setBlockModal] = useState(null);
  const [blockReason, setBlockReason] = useState("");
  const [commissionModal, setCommissionModal] = useState(null);
  const [commissionValue, setCommissionValue] = useState("");

  /* =====================================================
     LOAD VENDORS
  ===================================================== */

  const loadVendors = async (requestedPage = page) => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllVendorsApi({
        page: requestedPage,
        limit: 20,
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(status ? { status } : {}),
        ...(businessType ? { businessType } : {}),
      });

      setVendors(response?.data?.vendors || []);
      setPagination(
        response?.data?.pagination || {
          page: requestedPage,
          pages: 1,
          total: 0,
          limit: 20,
        },
      );
    } catch (error) {
      console.error("LOAD VENDORS ERROR:", error?.response?.data || error);
      setError(error?.response?.data?.message || "Unable to load vendors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors(page);
  }, [page, status, businessType]);

  const handleSearch = () => {
    if (page !== 1) {
      setPage(1);
      return;
    }
    loadVendors(1);
  };

  /* =====================================================
     DETAILS
  ===================================================== */

  const openVendorDetails = async (vendorId) => {
    try {
      setDetailLoading(true);
      setError("");
      const response = await getVendorByIdApi(vendorId);
      setSelectedVendor(response?.data?.vendor || null);
    } catch (error) {
      setError(
        error?.response?.data?.message || "Unable to load vendor details.",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  /* =====================================================
     ACTIVE STATUS
  ===================================================== */

  const handleToggleStatus = async (vendor) => {
    try {
      setActionLoading(vendor._id);
      const next = !vendor.isActive;
      await updateVendorStatusApi(vendor._id, next);
      setVendors((previous) =>
        previous.map((item) =>
          item._id === vendor._id
            ? {
                ...item,
                isActive: next,
                ...(next ? {} : { isOnline: false, acceptingOrders: false }),
              }
            : item,
        ),
      );
      setSuccess(
        next
          ? "Vendor activated successfully."
          : "Vendor deactivated successfully.",
      );
    } catch (error) {
      setError(
        error?.response?.data?.message || "Unable to update vendor status.",
      );
    } finally {
      setActionLoading("");
    }
  };

  /* =====================================================
     BLOCK
  ===================================================== */

  const handleBlock = async () => {
    if (!blockModal) return;
    const reason = blockReason.trim();
    if (!reason) {
      setError("Block reason is required.");
      return;
    }
    try {
      setActionLoading(blockModal._id);
      await blockVendorApi(blockModal._id, reason);
      setVendors((previous) =>
        previous.map((vendor) =>
          vendor._id === blockModal._id
            ? {
                ...vendor,
                isBlocked: true,
                blockReason: reason,
                isOnline: false,
                acceptingOrders: false,
              }
            : vendor,
        ),
      );
      setBlockModal(null);
      setBlockReason("");
      setSuccess("Vendor blocked successfully.");
    } catch (error) {
      setError(error?.response?.data?.message || "Unable to block vendor.");
    } finally {
      setActionLoading("");
    }
  };

  /* =====================================================
     UNBLOCK
  ===================================================== */

  const handleUnblock = async (vendor) => {
    try {
      setActionLoading(vendor._id);
      await unblockVendorApi(vendor._id);
      setVendors((previous) =>
        previous.map((item) =>
          item._id === vendor._id
            ? {
                ...item,
                isBlocked: false,
                blockReason: "",
              }
            : item,
        ),
      );
      setSuccess("Vendor unblocked successfully.");
    } catch (error) {
      setError(error?.response?.data?.message || "Unable to unblock vendor.");
    } finally {
      setActionLoading("");
    }
  };

  /* =====================================================
     COMMISSION
  ===================================================== */

  const openCommissionModal = (vendor) => {
    setCommissionModal(vendor);
    setCommissionValue(String(vendor.commissionPercentage || 0));
  };

  const saveCommission = async () => {
    if (!commissionModal) return;
    const commission = Number(commissionValue);
    if (Number.isNaN(commission) || commission < 0 || commission > 100) {
      setError("Commission must be between 0 and 100.");
      return;
    }
    try {
      setActionLoading(commissionModal._id);
      const response = await updateVendorCommissionApi(
        commissionModal._id,
        commission,
      );
      setVendors((previous) =>
        previous.map((vendor) =>
          vendor._id === commissionModal._id
            ? {
                ...vendor,
                commissionPercentage:
                  response?.data?.commissionPercentage ?? commission,
              }
            : vendor,
        ),
      );
      setCommissionModal(null);
      setSuccess("Vendor commission updated.");
    } catch (error) {
      setError(
        error?.response?.data?.message || "Unable to update commission.",
      );
    } finally {
      setActionLoading("");
    }
  };

  /* =====================================================
     STATS
  ===================================================== */

  const localStats = useMemo(() => {
    return {
      visible: vendors.length,
      approved: vendors.filter((vendor) => vendor.approvalStatus === "approved")
        .length,
      online: vendors.filter((vendor) => vendor.isOnline).length,
      blocked: vendors.filter((vendor) => vendor.isBlocked).length,
    };
  }, [vendors]);

  return (
    <div className="p-4 mx-auto space-y-6 max-w-7xl sm:p-6">
      {/* ─── HEADER ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-black sm:text-3xl">
          Vendor Management
        </h1>
        <p className="mt-1 text-sm text-geray-100">
          Manage all vendors, their status, commissions, and more.
        </p>
      </div>
      {/* <div className="relative p-6 overflow-hidden shadow-xl rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-500/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"></div>
      </div> */}

      {/* ─── STATS ───────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Vendors"
          value={pagination.total}
          icon={Store}
          color="gray"
          change="+12%"
          changeType="up"
        />
        <StatCard
          label="Approved"
          value={localStats.approved}
          icon={BadgeCheck}
          color="emerald"
          change="+8%"
          changeType="up"
        />
        <StatCard
          label="Online"
          value={localStats.online}
          icon={ToggleRight}
          color="green"
          change="+5%"
          changeType="up"
        />
        <StatCard
          label="Blocked"
          value={localStats.blocked}
          icon={Ban}
          color="red"
          change="-2%"
          changeType="down"
        />
      </div>

      {/* ─── ALERTS ──────────────────────────────────────────── */}
      <AnimatePresence>
        {(success || error) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`px-4 py-3 text-sm font-semibold rounded-2xl border ${
              success
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {success || error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── FILTERS ────────────────────────────────────────── */}
      <section className="p-4 border shadow-lg rounded-3xl border-gray-200/60 bg-white/80 backdrop-blur-sm shadow-gray-200/40">
        <div className="flex flex-col gap-3 xl:flex-row">
          <div className="relative flex-1">
            <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-4 top-1/2" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSearch();
              }}
              placeholder="Search business, owner, email or phone..."
              className="w-full pr-4 text-sm transition border border-gray-200 outline-none rounded-xl bg-gray-50/50 pl-11 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 h-11"
            />
          </div>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="px-4 text-sm bg-white border border-gray-200 outline-none h-11 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          >
            <option value="">All Approval Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={businessType}
            onChange={(event) => {
              setBusinessType(event.target.value);
              setPage(1);
            }}
            className="px-4 text-sm bg-white border border-gray-200 outline-none h-11 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          >
            <option value="">All Businesses</option>
            <option value="restaurant">Restaurant</option>
            <option value="dhaba">Dhaba</option>
            <option value="bakery">Bakery</option>
            <option value="cafe">Café</option>
            <option value="tiffin_center">Tiffin Centre</option>
            <option value="sweet_shop">Sweet Shop</option>
            <option value="fast_food">Fast Food</option>
            <option value="cloud_kitchen">Cloud Kitchen</option>
          </select>

          <button
            onClick={handleSearch}
            className="px-6 text-sm font-bold text-white transition shadow-sm h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-md"
          >
            Search
          </button>
        </div>
      </section>

      {/* ─── TABLE ──────────────────────────────────────────── */}
      <section className="overflow-hidden border shadow-lg rounded-3xl border-gray-200/60 bg-white/80 backdrop-blur-sm shadow-gray-200/40">
        {loading ? (
          <div className="flex min-h-[430px] items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Store className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </div>
        ) : vendors.length === 0 ? (
          <div className="py-20 text-center">
            <Store className="w-12 h-12 mx-auto text-gray-300" />
            <h3 className="mt-4 text-lg font-black text-gray-800">
              No vendors found
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full">
              <thead>
                <tr className="border-b border-gray-100/80 bg-gray-50/50 text-left text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">
                  <th className="px-5 py-4">Vendor</th>
                  <th className="px-5 py-4">Business</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Approval</th>
                  <th className="px-5 py-4">Store</th>
                  <th className="px-5 py-4">Commission</th>
                  <th className="px-5 py-4">Joined</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/60">
                <AnimatePresence>
                  {vendors.map((vendor) => (
                    <VendorRow
                      key={vendor._id}
                      vendor={vendor}
                      loading={actionLoading === vendor._id}
                      onView={() => openVendorDetails(vendor._id)}
                      onStatus={() => handleToggleStatus(vendor)}
                      onBlock={() => setBlockModal(vendor)}
                      onUnblock={() => handleUnblock(vendor)}
                      onCommission={() => openCommissionModal(vendor)}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {!loading && pagination.pages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-gray-100/80">
            <p className="text-xs text-gray-400">
              Page {pagination.page} of {pagination.pages} • {pagination.total}{" "}
              vendors
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="flex items-center justify-center transition border border-gray-200 h-9 w-9 rounded-xl hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page >= pagination.pages}
                onClick={() => setPage((prev) => prev + 1)}
                className="flex items-center justify-center transition border border-gray-200 h-9 w-9 rounded-xl hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ─── DETAILS DRAWER ─────────────────────────────────── */}
      <AnimatePresence>
        {(selectedVendor || detailLoading) && (
          <VendorDetailsDrawer
            vendor={selectedVendor}
            loading={detailLoading}
            onClose={() => setSelectedVendor(null)}
          />
        )}
      </AnimatePresence>

      {/* ─── BLOCK MODAL ───────────────────────────────────── */}
      <AnimatePresence>
        {blockModal && (
          <ActionModal
            title="Block Vendor"
            description={`Block ${blockModal.businessName}? Vendor will not be able to accept orders.`}
            value={blockReason}
            setValue={setBlockReason}
            placeholder="Enter block reason..."
            buttonLabel="Block Vendor"
            danger
            loading={actionLoading === blockModal._id}
            onClose={() => {
              setBlockModal(null);
              setBlockReason("");
            }}
            onSubmit={handleBlock}
          />
        )}
      </AnimatePresence>

      {/* ─── COMMISSION MODAL ───────────────────────────────── */}
      <AnimatePresence>
        {commissionModal && (
          <CommissionModal
            vendor={commissionModal}
            value={commissionValue}
            setValue={setCommissionValue}
            loading={actionLoading === commissionModal._id}
            onClose={() => setCommissionModal(null)}
            onSubmit={saveCommission}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── STAT CARD ────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color, change, changeType }) {
  const gradientMap = {
    gray: "from-gray-50 to-gray-100 border-gray-200",
    amber: "from-amber-50 to-amber-100 border-amber-200",
    purple: "from-purple-50 to-purple-100 border-purple-200",
    green: "from-green-50 to-green-100 border-green-200",
    emerald: "from-emerald-50 to-emerald-100 border-emerald-200",
    red: "from-red-50 to-red-100 border-red-200",
    blue: "from-blue-50 to-blue-100 border-blue-200",
    orange: "from-orange-50 to-orange-100 border-orange-200",
  };
  const colorMap = {
    gray: "text-gray-600",
    amber: "text-amber-600",
    purple: "text-purple-600",
    green: "text-green-600",
    emerald: "text-emerald-600",
    red: "text-red-600",
    blue: "text-blue-600",
    orange: "text-orange-600",
  };
  const bg = gradientMap[color] || gradientMap.gray;
  const textColor = colorMap[color] || colorMap.gray;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-sm ${bg}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
            {label}
          </p>
          <p className="mt-1 text-2xl font-black text-gray-900">{value}</p>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 backdrop-blur-sm ${textColor}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {change && (
        <div className="flex items-center gap-1 mt-2 text-xs font-medium">
          {changeType === "up" ? (
            <TrendingUp className="w-3 h-3 text-emerald-500" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-500" />
          )}
          <span
            className={
              changeType === "up" ? "text-emerald-600" : "text-red-600"
            }
          >
            {change}
          </span>
          <span className="text-gray-400">vs last period</span>
        </div>
      )}
    </motion.div>
  );
}

/* ─── VENDOR ROW ───────────────────────────────────────────── */
function VendorRow({
  vendor,
  loading,
  onView,
  onStatus,
  onBlock,
  onUnblock,
  onCommission,
}) {
  const image = vendor.profileImage || vendor.coverImage;
  const src = image
    ? image.startsWith("http")
      ? image
      : `${API_ORIGIN}${image}`
    : null;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="transition-colors cursor-pointer group hover:bg-orange-50/40"
      onClick={onView}
    >
      {/* Vendor Info */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center overflow-hidden text-orange-500 h-11 w-11 shrink-0 rounded-xl bg-orange-50">
            {src ? (
              <img
                src={src}
                alt={vendor.businessName}
                className="object-cover w-full h-full"
              />
            ) : (
              <Store className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-gray-900 max-w-[180px]">
              {vendor.businessName}
            </p>
            <p className="mt-1 truncate text-[10px] text-gray-400 max-w-[180px]">
              {vendor.email}
            </p>
          </div>
        </div>
      </td>

      {/* Business Type */}
      <td className="px-5 py-4">
        <p className="text-xs font-bold text-gray-700 capitalize">
          {vendor.businessType?.replace(/_/g, " ") || "N/A"}
        </p>
        <p className="mt-1 text-[10px] capitalize text-gray-400">
          {vendor.foodType?.replace(/_/g, " ")}
        </p>
      </td>

      {/* Location */}
      <td className="px-5 py-4">
        <p className="text-xs font-semibold text-gray-700">
          {vendor.address?.city || "N/A"}
        </p>
        <p className="mt-1 text-[10px] text-gray-400">
          {vendor.address?.state || ""}
        </p>
      </td>

      {/* Approval Status */}
      <td className="px-5 py-4">
        <StatusBadge value={vendor.approvalStatus} />
      </td>

      {/* Store Status */}
      <td className="px-5 py-4">
        <div className="flex flex-wrap gap-1">
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-black ${
              vendor.isOnline
                ? "bg-green-50 text-green-600"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {vendor.isOnline ? "ONLINE" : "OFFLINE"}
          </span>
          {vendor.isBlocked && (
            <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-[9px] font-black text-red-600">
              BLOCKED
            </span>
          )}
        </div>
      </td>

      {/* Commission */}
      <td className="px-5 py-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCommission();
          }}
          className="inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-1.5 text-xs font-black text-orange-600 transition hover:bg-orange-100"
        >
          <Percent className="h-3.5 w-3.5" />
          {vendor.commissionPercentage || 0}%
        </button>
      </td>

      {/* Joined Date */}
      <td className="px-5 py-4 text-[11px] text-gray-400">
        {vendor.createdAt
          ? new Date(vendor.createdAt).toLocaleDateString("en-IN")
          : "N/A"}
      </td>

      {/* Actions */}
      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-blue-50 hover:text-blue-600"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={(e) => {
              e.stopPropagation();
              onStatus();
            }}
            title={vendor.isActive ? "Deactivate" : "Activate"}
            className={`rounded-lg p-2 transition-colors ${
              vendor.isActive
                ? "text-green-500 hover:bg-green-50"
                : "text-gray-400 hover:bg-gray-100"
            }`}
          >
            {vendor.isActive ? (
              <ToggleRight className="w-4 h-4" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
          </button>

          {vendor.isBlocked ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUnblock();
              }}
              className="p-2 text-green-500 transition-colors rounded-lg hover:bg-green-50"
            >
              <Unlock className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBlock();
              }}
              className="p-2 text-red-500 transition-colors rounded-lg hover:bg-red-50"
            >
              <Ban className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </motion.tr>
  );
}

/* ─── VENDOR DETAILS DRAWER ───────────────────────────────── */
function VendorDetailsDrawer({ vendor, loading, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25 }}
        className="absolute top-0 right-0 w-full h-full max-w-2xl overflow-y-auto shadow-2xl bg-white/95 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Vendor Profile */}
        <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-sm border-gray-200/80">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 overflow-hidden rounded-full bg-gradient-to-br from-orange-100 to-orange-300">
                {vendor?.profileImage ? (
                  <img
                    src={
                      vendor.profileImage.startsWith("http")
                        ? vendor.profileImage
                        : `${API_ORIGIN}${vendor.profileImage}`
                    }
                    alt={vendor?.businessName}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <Store className="w-6 h-6 text-orange-500" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-950">
                  {vendor?.businessName || "Vendor"}
                </h2>
                <p className="text-sm text-gray-500">{vendor?.email || ""}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 transition-colors rounded-xl hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick status badges */}
          <div className="flex flex-wrap gap-2 px-6 pb-4">
            <StatusBadge value={vendor?.approvalStatus} />
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase ${
                vendor?.isOnline
                  ? "bg-green-50 text-green-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {vendor?.isOnline ? "Online" : "Offline"}
            </span>
            {vendor?.isBlocked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[9px] font-black uppercase text-red-600">
                Blocked
              </span>
            )}
            {vendor?.isActive ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[9px] font-black uppercase text-green-600">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[9px] font-black uppercase text-gray-500">
                Inactive
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <LoaderCircle className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : vendor ? (
          <div className="p-6 space-y-6">
            {/* Business Information */}
            <DetailCard title="Business Information" icon={Store}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailItem label="Business Name" value={vendor.businessName} />
                <DetailItem
                  label="Business Type"
                  value={vendor.businessType?.replace(/_/g, " ")}
                />
                <DetailItem
                  label="Food Type"
                  value={vendor.foodType?.replace(/_/g, " ")}
                />
                <DetailItem
                  label="Commission"
                  value={`${vendor.commissionPercentage || 0}%`}
                />
                <DetailItem label="FSSAI Number" value={vendor.fssaiNumber} />
                <DetailItem label="PAN Number" value={vendor.panNumber} />
              </div>
            </DetailCard>

            {/* Owner Information */}
            <DetailCard title="Owner Information" icon={User}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailItem
                  label="Full Name"
                  value={`${vendor.ownerFirstName || ""} ${vendor.ownerLastName || ""}`.trim()}
                />
                <DetailItem label="Email" value={vendor.email} />
                <DetailItem label="Phone" value={vendor.phone} />
                <DetailItem
                  label="Email Verified"
                  value={vendor.isEmailVerified ? "Yes" : "No"}
                />
              </div>
            </DetailCard>

            {/* Address */}
            <DetailCard title="Address" icon={MapPin}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailItem
                  label="Address Line"
                  value={vendor.address?.addressLine}
                />
                <DetailItem label="Landmark" value={vendor.address?.landmark} />
                <DetailItem label="City" value={vendor.address?.city} />
                <DetailItem label="State" value={vendor.address?.state} />
                <DetailItem label="Pincode" value={vendor.address?.pincode} />
              </div>
            </DetailCard>

            {/* Additional Info */}
            <DetailCard title="Additional Info" icon={Calendar}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailItem
                  label="Joined"
                  value={
                    vendor.createdAt
                      ? new Date(vendor.createdAt).toLocaleDateString("en-IN")
                      : "N/A"
                  }
                />
                <DetailItem
                  label="Last Updated"
                  value={
                    vendor.updatedAt
                      ? new Date(vendor.updatedAt).toLocaleDateString("en-IN")
                      : "N/A"
                  }
                />
                <DetailItem
                  label="Total Orders"
                  value={vendor.totalOrders || 0}
                />
                <DetailItem
                  label="Total Revenue"
                  value={`₹${vendor.totalRevenue || 0}`}
                />
              </div>
            </DetailCard>
          </div>
        ) : (
          <div className="flex min-h-[200px] items-center justify-center text-gray-400">
            No vendor data available
          </div>
        )}
      </motion.aside>
    </motion.div>
  );
}

/* ─── STATUS BADGE ─────────────────────────────────────────── */
function StatusBadge({ value }) {
  const styles = {
    approved: "bg-green-50 text-green-600",
    pending: "bg-amber-50 text-amber-600",
    rejected: "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase ${
        styles[value] || "bg-gray-100 text-gray-500"
      }`}
    >
      {value || "Unknown"}
    </span>
  );
}

/* ─── DETAIL CARD ──────────────────────────────────────────── */
function DetailCard({ title, icon: Icon, children }) {
  return (
    <div className="p-5 border rounded-2xl border-gray-100/80 bg-gray-50/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="rounded-lg bg-orange-50 p-1.5 text-orange-500">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-black text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="px-4 py-3 bg-white border shadow-sm rounded-xl border-gray-50">
      <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-0.5 break-words text-sm font-semibold text-gray-800">
        {value || "N/A"}
      </p>
    </div>
  );
}

/* ─── ACTION MODAL ──────────────────────────────────────────── */
function ActionModal({
  title,
  description,
  value,
  setValue,
  placeholder,
  buttonLabel,
  danger,
  loading,
  onClose,
  onSubmit,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        className="w-full max-w-lg p-6 border shadow-2xl rounded-3xl bg-white/95 backdrop-blur-md border-white/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              {description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 transition rounded-xl hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          rows={5}
          placeholder={placeholder}
          className="w-full p-4 mt-5 text-sm transition border border-gray-200 outline-none resize-none rounded-2xl focus:border-red-300 focus:ring-2 focus:ring-red-100"
        />
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={onClose}
            className="font-bold text-gray-600 transition border border-gray-200 h-11 rounded-xl hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className={`h-11 rounded-xl font-bold text-white transition hover:shadow-md disabled:opacity-50 ${
              danger
                ? "bg-gradient-to-r from-red-500 to-rose-500"
                : "bg-gradient-to-r from-orange-500 to-amber-500"
            }`}
          >
            {loading ? "Please wait..." : buttonLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── COMMISSION MODAL ──────────────────────────────────────── */
function CommissionModal({
  vendor,
  value,
  setValue,
  loading,
  onClose,
  onSubmit,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        className="w-full max-w-md p-6 border shadow-2xl rounded-3xl bg-white/95 backdrop-blur-md border-white/30"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-black text-gray-950">Update Commission</h2>
        <p className="mt-2 text-sm text-gray-500">{vendor.businessName}</p>
        <div className="relative mt-5">
          <input
            type="number"
            min="0"
            max="100"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="w-full px-4 pr-12 text-lg font-black transition border border-gray-200 outline-none h-14 rounded-2xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
          <Percent className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 right-4 top-1/2" />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={onClose}
            className="font-bold text-gray-600 transition border border-gray-200 h-11 rounded-xl hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="font-bold text-white transition h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-md disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Commission"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
