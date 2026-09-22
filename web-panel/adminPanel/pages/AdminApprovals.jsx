import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeCheck,
  Bike,
  Building2,
  CheckCircle2,
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
  ShieldCheck,
  Store,
  UserRound,
  X,
  XCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import {
  approveRiderApi,
  approveVendorApi,
  getPendingRidersApi,
  getPendingVendorsApi,
  rejectRiderApi,
  rejectVendorApi,
} from "../../src/api/adminApi";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:9000";

export default function AdminApprovals() {
  const [activeTab, setActiveTab] = useState("vendor");
  const [vendors, setVendors] = useState([]);
  const [riders, setRiders] = useState([]);
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
      const [vendorResponse, riderResponse] = await Promise.allSettled([
        getPendingVendorsApi(),
        getPendingRidersApi(),
      ]);
      if (vendorResponse.status === "fulfilled") {
        setVendors(vendorResponse.value?.data?.vendors || []);
      } else {
        console.error("VENDOR ERROR:", vendorResponse.reason);
      }
      if (riderResponse.status === "fulfilled") {
        setRiders(riderResponse.value?.data?.riders || []);
      } else {
        console.error("RIDER ERROR:", riderResponse.reason);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load approvals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentItems = activeTab === "vendor" ? vendors : riders;

  const filteredItems = useMemo(() => {
    const text = search.trim().toLowerCase();
    if (!text) return currentItems;
    return currentItems.filter((item) => {
      const searchable = [
        item.businessName,
        item.ownerFirstName,
        item.ownerLastName,
        item.firstName,
        item.lastName,
        item.email,
        item.phone,
        item.city,
        item.address?.city,
        item.vehicleNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(text);
    });
  }, [search, currentItems]);

  const handleApprove = async (item) => {
    const id = item._id;
    try {
      setActionLoading(id);
      setError("");
      setSuccess("");
      if (activeTab === "vendor") {
        await approveVendorApi(id);
        setVendors((prev) => prev.filter((v) => v._id !== id));
      } else {
        await approveRiderApi(id);
        setRiders((prev) => prev.filter((r) => r._id !== id));
      }
      setSelectedItem(null);
      setSuccess(`${activeTab === "vendor" ? "Vendor" : "Rider"} approved.`);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to approve.");
    } finally {
      setActionLoading("");
    }
  };

  const openReject = (item) => {
    setRejectReason("");
    setRejectModal({ item, type: activeTab });
  };

  const handleReject = async () => {
    const reason = rejectReason.trim();
    if (!reason) {
      setError("Please enter a rejection reason.");
      return;
    }
    const { item, type } = rejectModal;
    try {
      setActionLoading(item._id);
      setError("");
      setSuccess("");
      if (type === "vendor") {
        await rejectVendorApi(item._id, reason);
        setVendors((prev) => prev.filter((v) => v._id !== item._id));
      } else {
        await rejectRiderApi(item._id, reason);
        setRiders((prev) => prev.filter((r) => r._id !== item._id));
      }
      setRejectModal(null);
      setSelectedItem(null);
      setRejectReason("");
      setSuccess(`${type === "vendor" ? "Vendor" : "Rider"} rejected.`);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to reject.");
    } finally {
      setActionLoading("");
    }
  };

  const totalPending = vendors.length + riders.length;
  const vendorCount = vendors.length;
  const riderCount = riders.length;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60">
      <div className="mx-auto space-y-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
              Approvals
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage pending vendor and rider applications.
            </p>
          </div>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:scale-105 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard
            icon={Clock3}
            label="Total Pending"
            value={totalPending}
            color="from-gray-50 to-gray-100"
            iconColor="text-gray-600"
          />
          <StatsCard
            icon={Store}
            label="Vendor Requests"
            value={vendorCount}
            color="from-amber-50 to-amber-100"
            iconColor="text-amber-600"
          />
          <StatsCard
            icon={Bike}
            label="Rider Requests"
            value={riderCount}
            color="from-purple-50 to-purple-100"
            iconColor="text-purple-600"
          />
          <StatsCard
            icon={BadgeCheck}
            label="Verification"
            value="Manual"
            color="from-green-50 to-green-100"
            iconColor="text-green-600"
          />
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {(success || error) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl border text-sm font-semibold ${
                success
                  ? "border-green-200 bg-green-50/80 text-green-700 backdrop-blur-sm"
                  : "border-red-200 bg-red-50/80 text-red-600 backdrop-blur-sm"
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

        {/* Filter Bar */}
        <section className="p-4 border shadow-lg bg-white/60 backdrop-blur-md rounded-3xl border-white/30 shadow-gray-200/40">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <div className="inline-flex p-1 rounded-2xl bg-gray-100/80">
                <TabButton
                  active={activeTab === "vendor"}
                  onClick={() => {
                    setActiveTab("vendor");
                    setSearch("");
                    setSelectedItem(null);
                  }}
                  icon={Store}
                  label="Vendors"
                  badge={vendorCount}
                />
                <TabButton
                  active={activeTab === "rider"}
                  onClick={() => {
                    setActiveTab("rider");
                    setSearch("");
                    setSelectedItem(null);
                  }}
                  icon={Bike}
                  label="Riders"
                  badge={riderCount}
                />
              </div>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-4 top-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  activeTab === "vendor"
                    ? "Search business, owner..."
                    : "Search rider..."
                }
                className="w-full pl-11 pr-4 py-2.5 bg-white/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
              />
            </div>
          </div>
        </section>

        {/* Content - Table */}
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState type={activeTab} />
        ) : (
          <div className="overflow-hidden border shadow-lg bg-white/70 backdrop-blur-md rounded-3xl border-white/30 shadow-gray-200/40">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200/60">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-500 uppercase">
                      {activeTab === "vendor" ? "Business" : "Rider"}
                    </th>
                    <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-500 uppercase">
                      Contact
                    </th>
                    {activeTab === "vendor" ? (
                      <>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-500 uppercase">
                          Type
                        </th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-500 uppercase">
                          City
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-500 uppercase">
                          Vehicle
                        </th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-500 uppercase">
                          Vehicle No.
                        </th>
                      </>
                    )}
                    <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-500 uppercase">
                      Applied
                    </th>
                    <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-500 uppercase">
                      Documents
                    </th>
                    <th className="px-4 py-3 text-xs font-bold tracking-wider text-right text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60 bg-white/50">
                  {filteredItems.map((item) => {
                    const isVendor = activeTab === "vendor";
                    const title = isVendor
                      ? item.businessName || "Unnamed"
                      : `${item.firstName || ""} ${item.lastName || ""}`.trim() ||
                        "Delivery Partner";
                    const contact = (
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {item.email || "N/A"}
                        </div>
                        <div className="text-gray-500">
                          {item.phone || "N/A"}
                        </div>
                      </div>
                    );
                    const appliedDate = item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("en-IN")
                      : "N/A";
                    const docFields = isVendor
                      ? [
                          item.documents?.fssaiCertificate ||
                            item.fssaiCertificate,
                          item.documents?.ownerIdProof || item.ownerIdProof,
                          item.documents?.panCard || item.panCard,
                        ]
                      : [
                          item.documents?.drivingLicense || item.drivingLicense,
                          item.documents?.idProof || item.idProof,
                          item.documents?.vehicleRc || item.vehicleRc,
                        ];
                    const hasAnyDoc = docFields.some((p) => p && p.length > 0);

                    return (
                      <tr
                        key={item._id}
                        className="transition hover:bg-orange-50/30"
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <Avatar
                              image={
                                isVendor
                                  ? item.profileImage || item.coverImage
                                  : item.profileImage
                              }
                              title={title}
                              type={activeTab}
                              size="sm"
                            />
                            <div>
                              <div className="font-bold text-gray-900">
                                {title}
                              </div>
                              {isVendor && (
                                <div className="text-xs text-gray-500">
                                  {item.ownerFirstName || ""}{" "}
                                  {item.ownerLastName || ""}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{contact}</td>
                        {isVendor ? (
                          <>
                            <td className="px-4 py-3 text-sm text-gray-700 capitalize whitespace-nowrap">
                              {item.businessType?.replace(/_/g, " ") || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                              {item.address?.city || "N/A"}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-sm text-gray-700 capitalize whitespace-nowrap">
                              {item.vehicleType || "N/A"}
                            </td>
                            <td className="px-4 py-3 font-mono text-sm text-gray-700 whitespace-nowrap">
                              {item.vehicleNumber || "N/A"}
                            </td>
                          </>
                        )}
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                          {appliedDate}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {hasAnyDoc ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                <FileCheck2 className="w-3 h-3" />
                                Uploaded
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                                <XCircle className="w-3 h-3" />
                                None
                              </span>
                            )}
                            <button
                              onClick={() =>
                                setSelectedItem({ item, type: activeTab })
                              }
                              className="p-1 text-orange-600 transition rounded-lg hover:bg-orange-50"
                              title="View Documents"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              disabled={actionLoading === item._id}
                              onClick={() => openReject(item)}
                              className="px-3 py-1 text-xs font-bold text-red-500 transition border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                            >
                              Reject
                            </button>
                            <button
                              disabled={actionLoading === item._id}
                              onClick={() => handleApprove(item)}
                              className="px-3 py-1 text-xs font-bold text-white transition rounded-lg shadow-md bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg disabled:opacity-50"
                            >
                              {actionLoading === item._id ? (
                                <LoaderCircle className="w-3 h-3 animate-spin" />
                              ) : (
                                "Approve"
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Details Drawer (shows full info + documents) */}
        <AnimatePresence>
          {selectedItem && (
            <DetailsDrawer
              data={selectedItem.item}
              type={selectedItem.type}
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
              type={rejectModal.type}
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
    </div>
  );
}

// ─── Stats Card ────────────────────────────────────────────
function StatsCard({ icon: Icon, label, value, color, iconColor }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 shadow-sm border border-white/30 ${color}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
            {label}
          </p>
          <p className="mt-1 text-3xl font-black text-gray-900">{value}</p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/60 backdrop-blur-sm ${iconColor}`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Tab Button ────────────────────────────────────────────
function TabButton({ active, icon: Icon, label, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
        active
          ? "bg-white text-orange-600 shadow-sm"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      <span
        className={`ml-1 rounded-full px-2 py-0.5 text-[10px] ${
          active ? "bg-orange-50 text-orange-600" : "bg-gray-200 text-gray-500"
        }`}
      >
        {badge}
      </span>
    </button>
  );
}

// ─── Avatar (supports small) ──────────────────────────────
function Avatar({ image, title, type, size = "default" }) {
  const src = image
    ? image.startsWith("http")
      ? image
      : `${API_ORIGIN}${image}`
    : null;
  const sizeClass =
    size === "sm" ? "h-10 w-10 rounded-xl" : "h-14 w-14 rounded-2xl";
  const iconSize = size === "sm" ? "w-4 h-4" : "w-6 h-6";

  return (
    <div
      className={`flex items-center justify-center overflow-hidden text-orange-500 shrink-0 bg-gradient-to-br from-orange-100 to-amber-100 ${sizeClass}`}
    >
      {src ? (
        <img src={src} alt={title} className="object-cover w-full h-full" />
      ) : type === "vendor" ? (
        <Store className={iconSize} />
      ) : (
        <UserRound className={iconSize} />
      )}
    </div>
  );
}

// ─── Details Drawer ────────────────────────────────────────
function DetailsDrawer({ data, type, loading, onClose, onApprove, onReject }) {
  const isVendor = type === "vendor";
  const title = isVendor
    ? data.businessName
    : `${data.firstName || ""} ${data.lastName || ""}`.trim();

  const documents = isVendor
    ? [
        { label: "FSSAI Certificate", path: data.documents?.fssaiCertificate },
        { label: "Owner ID Proof", path: data.documents?.ownerIdProof },
        { label: "PAN Card", path: data.documents?.panCard },
      ]
    : [
        {
          label: "Driving Licence",
          path: data.documents?.drivingLicense || data.drivingLicense,
        },
        {
          label: "Aadhaar / ID",
          path: data.documents?.idProof || data.idProof,
        },
        {
          label: "Vehicle RC",
          path: data.documents?.vehicleRc || data.vehicleRc,
        },
      ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25 }}
        className="absolute top-0 right-0 flex flex-col w-full h-full max-w-2xl shadow-2xl bg-white/95 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200/80">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-500">
              {isVendor ? "Vendor Review" : "Rider KYC Review"}
            </p>
            <h2 className="mt-1 text-2xl font-black text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition rounded-xl hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Profile */}
          <section className="flex items-center gap-4 p-5 border bg-gray-50/50 rounded-2xl border-gray-200/60">
            <Avatar
              image={data.profileImage || data.coverImage}
              title={title}
              type={type}
            />
            <div>
              <h3 className="font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{data.email}</p>
              <p className="text-sm text-gray-500">{data.phone}</p>
            </div>
          </section>

          {/* Vendor Sections */}
          {isVendor && (
            <>
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
                  value={`${data.ownerFirstName || ""} ${data.ownerLastName || ""}`}
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

              <DetailSection title="Working Hours">
                {data.timings && data.timings.length > 0 ? (
                  data.timings.map((t) => (
                    <div
                      key={t.day}
                      className="flex justify-between py-1 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-sm font-semibold text-gray-700 capitalize">
                        {t.day}
                      </span>
                      {t.isClosed ? (
                        <span className="text-sm font-medium text-red-500">
                          Closed
                        </span>
                      ) : (
                        <span className="text-sm text-gray-600">
                          {t.openTime} – {t.closeTime}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No timings set</p>
                )}
              </DetailSection>
            </>
          )}

          {/* Rider Sections */}
          {!isVendor && (
            <>
              <DetailSection title="Personal Information">
                <Detail label="Name" value={title} />
                <Detail label="Email" value={data.email} />
                <Detail label="Phone" value={data.phone} />
                <Detail
                  label="Date of Birth"
                  value={
                    data.dateOfBirth
                      ? new Date(data.dateOfBirth).toLocaleDateString("en-IN")
                      : "N/A"
                  }
                />
              </DetailSection>

              <DetailSection title="Vehicle Information">
                <Detail label="Vehicle Type" value={data.vehicleType} />
                <Detail label="Vehicle Number" value={data.vehicleNumber} />
                <Detail
                  label="Driving Licence"
                  value={data.drivingLicenseNumber || data.licenseNumber}
                />
              </DetailSection>
            </>
          )}

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

        {/* Footer Actions */}
        <div className="grid grid-cols-2 gap-3 p-5 border-t border-gray-200/80 bg-white/80 backdrop-blur-sm">
          <button
            disabled={loading}
            onClick={onReject}
            className="flex items-center justify-center h-12 gap-2 font-bold text-red-600 transition border border-red-200 rounded-xl bg-red-50 hover:bg-red-100 disabled:opacity-50"
          >
            <XCircle className="w-5 h-5" />
            Reject
          </button>
          <button
            disabled={loading}
            onClick={onApprove}
            className="flex items-center justify-center h-12 gap-2 font-bold text-white transition shadow-lg rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-xl disabled:opacity-60"
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

// ─── Reject Modal ──────────────────────────────────────────
function RejectModal({
  data,
  type,
  reason,
  setReason,
  loading,
  onClose,
  onSubmit,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        className="w-full max-w-lg p-6 border shadow-2xl rounded-3xl bg-white/95 backdrop-blur-xl border-white/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="flex items-center justify-center w-12 h-12 text-red-500 rounded-2xl bg-red-50">
              <XCircle className="w-6 h-6" />
            </span>
            <h2 className="mt-4 text-xl font-black text-gray-900">
              Reject {type === "vendor" ? "Vendor" : "Rider"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Provide a clear reason for rejection.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition rounded-xl hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={5}
          placeholder="Example: FSSAI document is unclear. Please upload a valid document."
          className="w-full p-4 mt-4 text-sm transition border border-gray-200 outline-none resize-none rounded-2xl focus:border-red-300 focus:ring-2 focus:ring-red-100"
        />

        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={onClose}
            className="font-bold text-gray-600 transition border border-gray-200 h-11 rounded-xl hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={onSubmit}
            className="flex items-center justify-center gap-2 font-bold text-white transition shadow-md h-11 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 hover:shadow-lg disabled:opacity-50"
          >
            {loading && <LoaderCircle className="w-4 h-4 animate-spin" />}
            Reject
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── DocumentCard (used in drawer) ────────────────────────
function DocumentCard({ label, path }) {
  const url = path
    ? path.startsWith("http")
      ? path
      : `${API_ORIGIN}${path}`
    : null;

  return (
    <div className="flex items-center gap-3 p-4 border bg-white/60 rounded-2xl border-gray-200/60">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          url ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
        }`}
      >
        <FileCheck2 className="w-5 h-5" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 truncate">{label}</p>
        <p className="text-[10px] text-gray-400">
          {url ? "Uploaded" : "Not uploaded"}
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

// ─── DetailSection & Detail ──────────────────────────────
function DetailSection({ title, children }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-black text-gray-900">{title}</h3>
      <div className="grid grid-cols-1 gap-3 p-4 border sm:grid-cols-2 bg-white/60 rounded-2xl border-gray-200/60 backdrop-blur-sm">
        {children}
      </div>
    </section>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-gray-800 break-words">
        {value || "N/A"}
      </p>
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────
function EmptyState({ type }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-20 text-center border-2 border-gray-300 border-dashed rounded-3xl bg-white/50 backdrop-blur-sm"
    >
      <span className="flex items-center justify-center w-16 h-16 text-green-500 rounded-2xl bg-green-50">
        <CheckCircle2 className="w-8 h-8" />
      </span>
      <h3 className="mt-4 text-lg font-black text-gray-900">
        No pending {type === "vendor" ? "vendors" : "riders"}
      </h3>
      <p className="mt-1 text-sm text-gray-400">
        All applications have been reviewed.
      </p>
    </motion.div>
  );
}
