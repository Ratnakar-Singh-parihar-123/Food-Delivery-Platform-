// src/pages/admin/TiffinApprovals.jsx
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Eye,
  FileCheck2,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Store,
  UserRound,
  X,
  XCircle,
  TrendingUp,
  TrendingDown,
  Users,
} from "lucide-react";

import {
  getPendingTiffinVendorsApi,
  approveVendorApi,
  rejectVendorApi,
} from "../../../src/api/adminApi";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:9000";

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function AdminTiffinApprovals() {
  const [tiffinVendors, setTiffinVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getPendingTiffinVendorsApi();
      setTiffinVendors(response.data?.data?.vendors || []);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Unable to load tiffin house requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    const text = search.trim().toLowerCase();
    if (!text) return tiffinVendors;
    return tiffinVendors.filter((item) => {
      const searchable = [
        item.businessName,
        item.ownerFirstName,
        item.ownerLastName,
        item.email,
        item.phone,
        item.address?.city,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(text);
    });
  }, [search, tiffinVendors]);

  const handleApprove = async (item) => {
    try {
      setActionLoading(item._id);
      await approveVendorApi(item._id);
      setTiffinVendors((prev) => prev.filter((v) => v._id !== item._id));
      setSelectedItem(null);
      setSuccess("Tiffin house approved successfully.");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to approve.");
    } finally {
      setActionLoading("");
    }
  };

  const openReject = (item) => {
    setRejectReason("");
    setRejectModal({ item });
  };

  const handleReject = async () => {
    const reason = rejectReason.trim();
    if (!reason) {
      setError("Please enter a rejection reason.");
      return;
    }
    const { item } = rejectModal;
    try {
      setActionLoading(item._id);
      await rejectVendorApi(item._id, reason);
      setTiffinVendors((prev) => prev.filter((v) => v._id !== item._id));
      setRejectModal(null);
      setSelectedItem(null);
      setRejectReason("");
      setSuccess("Tiffin house rejected.");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to reject.");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="p-4 mx-auto space-y-6 max-w-7xl sm:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-black sm:text-3xl">
          Tiffin House Approvals
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and verify new tiffin center applications.
        </p>
      </div>

      {/* Refresh Button */}
      <button
        type="button"
        onClick={loadData}
        className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-bold text-black backdrop-blur-sm transition hover:bg-orange/30 hover:scale-105"
      >
        <RefreshCw className="w-5 h-5" />
        Refresh
      </button>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          icon={Clock3}
          label="Total Pending"
          value={tiffinVendors.length}
          description="Awaiting review"
          color="gray"
          change="+4%"
          changeType="up"
        />
        <StatsCard
          icon={Store}
          label="Tiffin Houses"
          value={tiffinVendors.length}
          description="New registrations"
          color="amber"
          change="+2%"
          changeType="up"
        />
        <StatsCard
          icon={BadgeCheck}
          label="Verification"
          value="Manual"
          description="Admin controlled"
          color="green"
          change="0%"
          changeType="up"
        />
        <StatsCard
          icon={Building2}
          label="Pending KYC"
          value={tiffinVendors.filter((v) => !v.isEmailVerified).length}
          description="Documents pending"
          color="purple"
          change="-1%"
          changeType="down"
        />
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {(success || error) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${
              success
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {success ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <CircleAlert className="w-5 h-5 shrink-0" />
            )}
            {success || error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filter Bar */}
      <section className="p-4 border shadow-lg rounded-3xl border-gray-200/60 bg-white/80 shadow-gray-200/40 backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex w-full rounded-2xl bg-gray-100/80 p-1.5 sm:w-auto">
            <div className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold bg-white text-orange-600 shadow-sm">
              <Store className="w-4 h-4" />
              Tiffin Houses
              <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] text-orange-600">
                {tiffinVendors.length}
              </span>
            </div>
          </div>
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-4 top-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search business, owner..."
              className="w-full pr-4 text-sm transition border border-gray-200 outline-none h-11 rounded-xl bg-gray-50/50 pl-11 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>
      </section>

      {/* Table */}
      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-gray-200/60 bg-white/80 backdrop-blur-sm shadow-lg shadow-gray-200/40">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <BadgeCheck className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden border shadow-lg rounded-3xl border-gray-200/60 bg-white/80 backdrop-blur-sm shadow-gray-200/40">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 text-left text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-200/60">
                <tr>
                  <th className="w-12 px-3 py-3">#</th>
                  <th className="w-12 px-3 py-3">Image</th>
                  <th className="px-3 py-3">Business</th>
                  <th className="hidden px-3 py-3 sm:table-cell">Owner</th>
                  <th className="hidden px-3 py-3 md:table-cell">Email</th>
                  <th className="hidden px-3 py-3 lg:table-cell">Phone</th>
                  <th className="hidden px-3 py-3 xl:table-cell">City</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/80">
                {filteredItems.map((item, index) => {
                  const isProcessing = actionLoading === item._id;
                  const name = item.businessName || "Unnamed";
                  const owner =
                    `${item.ownerFirstName || ""} ${item.ownerLastName || ""}`.trim() ||
                    "—";
                  const imageSrc =
                    item.profileImage || item.coverImage || item.logo;
                  const imgUrl = imageSrc
                    ? imageSrc.startsWith("http")
                      ? imageSrc
                      : `${API_ORIGIN}${imageSrc}`
                    : null;

                  return (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ delay: index * 0.03, duration: 0.2 }}
                      className="transition-colors cursor-pointer hover:bg-orange-50/40"
                      onClick={() => setSelectedItem({ item })}
                    >
                      <td className="px-3 py-3 text-xs text-gray-400">
                        {index + 1}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center w-8 h-8 overflow-hidden rounded-full bg-gray-100/80">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={name}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <Store className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-bold text-gray-900">
                        <div className="flex items-center gap-2">
                          <span>{name}</span>
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-amber-600">
                            Pending
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-3 py-3 text-xs text-gray-600 sm:table-cell">
                        {owner}
                      </td>
                      <td className="hidden px-3 py-3 text-xs text-gray-500 md:table-cell">
                        {item.email || "—"}
                      </td>
                      <td className="hidden px-3 py-3 text-xs text-gray-500 lg:table-cell">
                        {item.phone || "—"}
                      </td>
                      <td className="hidden px-3 py-3 text-xs text-gray-500 xl:table-cell">
                        {item.address?.city || "—"}
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-600">
                          <Clock3 className="w-3 h-3" />
                          Pending
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div
                          className="flex items-center justify-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedItem({ item })}
                            className="p-1.5 text-gray-400 transition rounded-lg hover:bg-gray-100 hover:text-gray-600"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => openReject(item)}
                            className="p-1.5 text-red-400 transition rounded-lg hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleApprove(item)}
                            className="p-1.5 text-green-400 transition rounded-lg hover:bg-green-50 hover:text-green-600 disabled:opacity-40"
                            title="Approve"
                          >
                            {isProcessing ? (
                              <LoaderCircle className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination (simple) */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200/60">
            <p className="text-xs text-gray-400">
              Showing {filteredItems.length} of {tiffinVendors.length}{" "}
              applications
            </p>
            <div className="flex gap-1">
              <PaginationButton label="Previous" />
              <PaginationButton label="1" active />
              <PaginationButton label="2" />
              <PaginationButton label="Next" />
            </div>
          </div>
        </div>
      )}

      {/* Details Drawer */}
      <AnimatePresence>
        {selectedItem && (
          <DetailsDrawer
            data={selectedItem.item}
            loading={actionLoading === selectedItem.item._id}
            onClose={() => setSelectedItem(null)}
            onApprove={() => handleApprove(selectedItem.item)}
            onReject={() => openReject(selectedItem.item)}
          />
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModal && (
          <RejectModal
            data={rejectModal.item}
            reason={rejectReason}
            setReason={setRejectReason}
            loading={actionLoading === rejectModal.item._id}
            onClose={() => {
              setRejectModal(null);
              setRejectReason("");
            }}
            onSubmit={handleReject}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS (unchanged)
// ============================================================

function StatsCard({
  icon: Icon,
  label,
  value,
  description,
  color,
  change,
  changeType,
}) {
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
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm ${bg}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
            {label}
          </p>
          <p className="mt-1 text-2xl font-black text-gray-900">{value}</p>
          <p className="mt-1 text-xs text-gray-400">{description}</p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/60 backdrop-blur-sm ${textColor}`}
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

function DetailsDrawer({ data, loading, onClose, onApprove, onReject }) {
  const title = data.businessName || "Tiffin House";
  const documents = [
    { label: "FSSAI Certificate", path: data.documents?.fssaiCertificate },
    { label: "Owner ID Proof", path: data.documents?.ownerIdProof },
    { label: "PAN Card", path: data.documents?.panCard },
  ];

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
        className="absolute top-0 right-0 flex flex-col w-full h-full max-w-2xl shadow-2xl bg-white/95 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200/80">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-500">
              Tiffin House Review
            </p>
            <h2 className="mt-1 text-xl font-black text-gray-950">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 transition rounded-xl hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* User Info */}
          <section className="p-5 border rounded-2xl border-gray-200/60 bg-gray-50/50 backdrop-blur-sm">
            <div className="flex gap-4">
              <Avatar
                image={data.profileImage || data.coverImage}
                title={title}
                type="vendor"
              />
              <div>
                <h3 className="font-black text-gray-950">{title}</h3>
                <p className="mt-1 text-xs text-gray-400">{data.email}</p>
                <p className="mt-1 text-xs text-gray-400">{data.phone}</p>
              </div>
            </div>
          </section>

          <DetailSection title="Business Information">
            <Detail label="Business Name" value={data.businessName} />
            <Detail
              label="Business Type"
              value={data.businessType?.replace(/_/g, " ")}
            />
            <Detail
              label="Food Type"
              value={data.foodType?.replace(/_/g, " ")}
            />
            <Detail label="FSSAI Number" value={data.fssaiNumber} />
            <Detail label="PAN" value={data.panNumber} />
            <Detail
              label="Email Verified"
              value={data.isEmailVerified ? "Yes" : "No"}
            />
          </DetailSection>

          <DetailSection title="Owner Information">
            <Detail
              label="Owner"
              value={`${data.ownerFirstName || ""} ${data.ownerLastName || ""}`.trim()}
            />
            <Detail label="Email" value={data.email} />
            <Detail label="Phone" value={data.phone} />
          </DetailSection>

          <DetailSection title="Business Address">
            <Detail label="Address" value={data.address?.addressLine} />
            <Detail label="Landmark" value={data.address?.landmark} />
            <Detail label="City" value={data.address?.city} />
            <Detail label="State" value={data.address?.state} />
            <Detail label="Pincode" value={data.address?.pincode} />
          </DetailSection>

          {/* Documents */}
          <section>
            <h3 className="mb-3 text-sm font-black text-gray-900">
              Verification Documents
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.label}
                  label={doc.label}
                  path={doc.path}
                />
              ))}
            </div>
          </section>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="grid grid-cols-2 gap-3 p-5 border-t border-gray-200/80 bg-white/80 backdrop-blur-sm">
          <button
            type="button"
            disabled={loading}
            onClick={onReject}
            className="flex items-center justify-center h-12 gap-2 font-bold text-red-600 transition border border-red-200 rounded-xl bg-red-50 hover:bg-red-100 disabled:opacity-50"
          >
            <XCircle className="w-5 h-5" />
            Reject
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onApprove}
            className="flex items-center justify-center h-12 gap-2 font-bold text-white transition shadow-lg rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-200 hover:shadow-xl disabled:opacity-60"
          >
            {loading ? (
              <LoaderCircle className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            Approve
          </button>
        </div>
      </motion.aside>
    </motion.div>
  );
}

function RejectModal({ data, reason, setReason, loading, onClose, onSubmit }) {
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
            <span className="flex items-center justify-center text-red-500 h-11 w-11 rounded-2xl bg-red-50">
              <XCircle className="w-5 h-5" />
            </span>
            <h2 className="mt-4 text-xl font-black text-gray-950">
              Reject Tiffin House
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Please provide a clear reason. This can later be shown to the
              applicant.
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
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={5}
          placeholder="Example: FSSAI document is unclear. Please upload a valid document..."
          className="w-full p-4 mt-5 text-sm transition border border-gray-200 outline-none resize-none rounded-2xl focus:border-red-300 focus:ring-2 focus:ring-red-100"
        />

        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-gray-600 transition border border-gray-200 h-11 rounded-xl hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onSubmit}
            className="flex items-center justify-center gap-2 font-bold text-white transition h-11 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 hover:shadow-md disabled:opacity-50"
          >
            {loading && <LoaderCircle className="w-4 h-4 animate-spin" />}
            Reject Application
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// REUSABLE COMPONENTS
// ============================================================

function Avatar({ image, title, type }) {
  const src = image
    ? image.startsWith("http")
      ? image
      : `${API_ORIGIN}${image}`
    : null;
  return (
    <div className="flex items-center justify-center overflow-hidden text-orange-500 h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50">
      {src ? (
        <img
          src={src}
          alt={title || "Profile"}
          className="object-cover w-full h-full"
        />
      ) : (
        <Store className="w-6 h-6" />
      )}
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-black text-gray-900">{title}</h3>
      <div className="grid gap-3 p-4 border rounded-2xl border-gray-200/60 bg-white/60 backdrop-blur-sm sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-gray-800 capitalize break-words">
        {value || "N/A"}
      </p>
    </div>
  );
}

function DocumentCard({ label, path }) {
  const url = path
    ? path.startsWith("http")
      ? path
      : `${API_ORIGIN}${path}`
    : null;
  return (
    <div className="flex items-center gap-3 p-4 border rounded-2xl border-gray-200/60 bg-white/50 backdrop-blur-sm">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${url ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}
      >
        <FileCheck2 className="w-5 h-5" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 truncate">{label}</p>
        <p className="mt-0.5 text-[10px] text-gray-400">
          {url ? "Document uploaded" : "Not uploaded"}
        </p>
      </div>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center w-8 h-8 text-orange-600 transition rounded-lg bg-orange-50 hover:bg-orange-100"
        >
          <Eye className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-20 text-center border border-gray-300 border-dashed rounded-3xl bg-white/80 backdrop-blur-sm"
    >
      <span className="flex items-center justify-center mx-auto text-green-500 h-14 w-14 rounded-2xl bg-green-50">
        <CheckCircle2 className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-lg font-black text-gray-900">
        No pending tiffin houses
      </h3>
      <p className="mt-2 text-sm text-gray-400">
        All applications have been reviewed.
      </p>
    </motion.div>
  );
}

function PaginationButton({ label, active = false }) {
  return (
    <button
      className={`rounded-lg border px-2.5 py-0.5 text-[10px] font-bold transition-all duration-200 ${
        active
          ? "border-orange-500 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/30"
          : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300"
      }`}
    >
      {label}
    </button>
  );
}
