import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Plus,
  LoaderCircle,
  Trash2,
  Pencil,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Store,
  Mail,
  Phone,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  Calendar,
  CreditCard,
  Award,
  Users,
  ShoppingBag,
  IndianRupee,
} from "lucide-react";

import {
  getAllVendorsApi as getTopVendors,
  toggleVendorActive,
  toggleVendorTop,
} from "../../src/api/adminApi";
import { getApiError } from "../../src/api/getApiError";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:9000";

const TopVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("all");
  const [businessType, setBusinessType] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(12);

  // Modal
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadVendors = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        approvalStatus: approvalStatus !== "all" ? approvalStatus : undefined,
        businessType: businessType !== "all" ? businessType : undefined,
        onlyTop: true,
      };
      const response = await getTopVendors(params);
      const data = response?.data || {};
      setVendors(data.vendors || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      setError(getApiError(err, "Failed to load vendors"));
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, approvalStatus, businessType]);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  // Toggle active status
  const handleToggleActive = async (vendor) => {
    try {
      const newStatus = !vendor.isActive;
      await toggleVendorActive(vendor._id, newStatus);
      setVendors((prev) =>
        prev.map((v) =>
          v._id === vendor._id ? { ...v, isActive: newStatus } : v,
        ),
      );
      setSuccess(`Vendor ${newStatus ? "activated" : "deactivated"}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(getApiError(err, "Failed to toggle status"));
      setTimeout(() => setError(""), 3000);
    }
  };

  // Toggle top vendor
  const handleToggleTop = async (vendor) => {
    try {
      const newTop = !vendor.isTop;
      await toggleVendorTop(vendor._id, newTop);
      setVendors((prev) =>
        prev.map((v) => (v._id === vendor._id ? { ...v, isTop: newTop } : v)),
      );
      setSuccess(`Vendor ${newTop ? "marked as top" : "removed from top"}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(getApiError(err, "Failed to toggle top status"));
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      setPage(1);
      loadVendors();
    }
  };

  // Open modal with vendor details
  const openModal = (vendor) => {
    setSelectedVendor(vendor);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedVendor(null);
  };

  return (
    <div className="space-y-6">
      {/* HEADER – Orange/Amber gradient */}
      <section className="rounded-[28px] border border-orange-100 bg-gradient-to-br from-orange-500 to-amber-500 p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white">
              <Store className="h-3.5 w-3.5" />
              Top Vendors
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
              Featured Vendors
            </h1>
            <p className="mt-2 text-sm text-orange-100">
              Manage vendors marked as "Top". Toggle active status or remove
              from featured list.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 px-5 text-sm font-bold text-orange-700 transition bg-white shadow-lg h-11 rounded-xl shadow-orange-100 hover:shadow-xl"
          >
            <Plus className="w-4 h-4" />
            Add Vendor
          </button>
        </div>
      </section>

      {/* FILTERS – Orange focus */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-4 top-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search by name, email, phone..."
            className="w-full pr-4 text-sm border border-gray-200 outline-none h-11 rounded-xl pl-11 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <select
          value={approvalStatus}
          onChange={(e) => {
            setApprovalStatus(e.target.value);
            setPage(1);
          }}
          className="px-4 text-sm bg-white border border-gray-200 outline-none h-11 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={businessType}
          onChange={(e) => {
            setBusinessType(e.target.value);
            setPage(1);
          }}
          className="px-4 text-sm bg-white border border-gray-200 outline-none h-11 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        >
          <option value="all">All Types</option>
          <option value="restaurant">Restaurant</option>
          <option value="cafe">Cafe</option>
          <option value="bakery">Bakery</option>
          <option value="food_truck">Food Truck</option>
        </select>

        <button
          onClick={() => {
            setPage(1);
            loadVendors();
          }}
          className="px-5 text-sm font-bold text-white transition bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl h-11 hover:shadow-md"
        >
          Search
        </button>
      </div>

      {/* ALERTS – unchanged */}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-green-700 border border-green-200 rounded-xl bg-green-50">
          <CheckCircle2 className="w-4 h-4" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-600 border border-red-200 rounded-xl bg-red-50">
          <XCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* TABLE – Orange hover */}
      {loading ? (
        <div className="flex min-h-[350px] items-center justify-center">
          <LoaderCircle className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : vendors.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-gray-300 bg-white py-20 text-center">
          <Store className="w-10 h-10 mx-auto text-gray-300" />
          <h3 className="mt-4 font-black text-gray-800">
            No top vendors found
          </h3>
          <p className="mt-2 text-sm text-gray-400">
            Mark a vendor as "Top" from the main vendor list.
          </p>
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
                    Owner
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-600 uppercase">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-600 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-gray-600 uppercase">
                    Top
                  </th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wider text-right text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendors.map((vendor) => (
                  <tr
                    key={vendor._id}
                    className="transition cursor-pointer hover:bg-orange-50/40"
                    onClick={() => openModal(vendor)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {vendor.profileImage ? (
                          <img
                            src={`${API_ORIGIN}${vendor.profileImage}`}
                            alt={vendor.businessName}
                            className="object-cover w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-10 h-10 font-bold text-orange-600 bg-orange-100 rounded-full">
                            {vendor.businessName?.charAt(0) || "V"}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900">
                            {vendor.businessName}
                          </p>
                          <span
                            className={`text-[10px] font-semibold ${
                              vendor.approvalStatus === "approved"
                                ? "text-green-600"
                                : vendor.approvalStatus === "pending"
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {vendor.approvalStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {vendor.ownerFirstName} {vendor.ownerLastName}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-700">{vendor.email}</div>
                      <div className="text-xs text-gray-500">
                        {vendor.phone || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 capitalize">
                      {vendor.businessType || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          vendor.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {vendor.isActive ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                        {vendor.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {vendor.isTop ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                          <Star className="w-3 h-3 fill-amber-500" /> Top
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(vendor);
                          }}
                          className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-500 hover:text-orange-600 transition"
                          title={vendor.isActive ? "Deactivate" : "Activate"}
                        >
                          {vendor.isActive ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleTop(vendor);
                          }}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-500 hover:text-amber-500 transition"
                          title={vendor.isTop ? "Remove from top" : "Mark top"}
                        >
                          {vendor.isTop ? (
                            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                          ) : (
                            <StarOff className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Edit logic
                          }}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Delete logic
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAGINATION – unchanged */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 px-2 py-3">
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-2 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* VENDOR DETAIL MODAL – Orange accents */}
      {modalOpen && selectedVendor && (
        <VendorModal vendor={selectedVendor} onClose={closeModal} />
      )}
    </div>
  );
};

/* =====================================================
   VENDOR MODAL
===================================================== */
function VendorModal({ vendor, onClose }) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-white border-b border-gray-100 rounded-t-[28px]">
          <div className="flex items-center gap-4">
            <div className="overflow-hidden border-2 border-gray-200 rounded-full w-14 h-14">
              {vendor.profileImage ? (
                <img
                  src={`${API_ORIGIN}${vendor.profileImage}`}
                  alt={vendor.businessName}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-2xl font-bold text-orange-600 bg-orange-100">
                  {vendor.businessName?.charAt(0) || "V"}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-950">
                {vendor.businessName}
              </h2>
              <p className="text-sm text-gray-500">
                {vendor.ownerFirstName} {vendor.ownerLastName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 transition rounded-xl hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatBox
              icon={Award}
              label="Approval"
              value={vendor.approvalStatus.toUpperCase()}
              valueColor={
                vendor.approvalStatus === "approved"
                  ? "text-green-600"
                  : vendor.approvalStatus === "pending"
                    ? "text-yellow-600"
                    : "text-red-600"
              }
            />
            <StatBox
              icon={Eye}
              label="Status"
              value={vendor.isActive ? "Active" : "Inactive"}
              valueColor={vendor.isActive ? "text-green-600" : "text-gray-600"}
            />
            <StatBox
              icon={Star}
              label="Top Vendor"
              value={vendor.isTop ? "Yes" : "No"}
              valueColor={vendor.isTop ? "text-amber-500" : "text-gray-400"}
            />
            <StatBox
              icon={ShoppingBag}
              label="Total Orders"
              value={vendor.totalOrders || 0}
              valueColor="text-orange-600"
            />
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left column */}
            <div className="space-y-4">
              <DetailSection title="Business Details" icon={Building2}>
                <DetailItem label="Business Name" value={vendor.businessName} />
                <DetailItem label="Type" value={vendor.businessType || "N/A"} />
                <DetailItem
                  label="Food Type"
                  value={vendor.foodType || "N/A"}
                />
                <DetailItem
                  label="Description"
                  value={vendor.description || "N/A"}
                />
                <DetailItem
                  label="FSSAI Number"
                  value={vendor.fssaiNumber || "N/A"}
                />
                <DetailItem label="PAN" value={vendor.panNumber || "N/A"} />
                <DetailItem label="GST" value={vendor.gstNumber || "N/A"} />
              </DetailSection>

              <DetailSection title="Contact Details" icon={Phone}>
                <DetailItem label="Email" value={vendor.email} />
                <DetailItem label="Phone" value={vendor.phone || "N/A"} />
              </DetailSection>

              <DetailSection title="Address" icon={MapPin}>
                <DetailItem
                  label="Address"
                  value={vendor.address?.addressLine || "N/A"}
                />
                <DetailItem
                  label="Landmark"
                  value={vendor.address?.landmark || "N/A"}
                />
                <DetailItem
                  label="City"
                  value={vendor.address?.city || "N/A"}
                />
                <DetailItem
                  label="State"
                  value={vendor.address?.state || "N/A"}
                />
                <DetailItem
                  label="Pincode"
                  value={vendor.address?.pincode || "N/A"}
                />
              </DetailSection>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <DetailSection title="Bank Details" icon={CreditCard}>
                <DetailItem
                  label="Account Holder"
                  value={vendor.bankDetails?.accountHolderName || "N/A"}
                />
                <DetailItem
                  label="Account Number"
                  value={vendor.bankDetails?.accountNumber || "N/A"}
                />
                <DetailItem
                  label="IFSC Code"
                  value={vendor.bankDetails?.ifscCode || "N/A"}
                />
                <DetailItem
                  label="Bank Name"
                  value={vendor.bankDetails?.bankName || "N/A"}
                />
                <DetailItem
                  label="UPI ID"
                  value={vendor.bankDetails?.upiId || "N/A"}
                />
                <DetailItem
                  label="Verified"
                  value={vendor.bankDetails?.isVerified ? "Yes" : "No"}
                />
              </DetailSection>

              <DetailSection title="Operational Details" icon={Clock}>
                <DetailItem
                  label="Online"
                  value={vendor.isOnline ? "Online" : "Offline"}
                />
                <DetailItem
                  label="Accepting Orders"
                  value={vendor.acceptingOrders ? "Yes" : "No"}
                />
                <DetailItem
                  label="Minimum Order"
                  value={`₹${vendor.minimumOrderAmount || 0}`}
                />
                <DetailItem
                  label="Avg. Prep Time"
                  value={`${vendor.averagePreparationTime || 0} min`}
                />
                <DetailItem
                  label="Commission"
                  value={`${vendor.commissionPercentage || 15}%`}
                />
              </DetailSection>

              <DetailSection title="Ratings & Revenue" icon={IndianRupee}>
                <DetailItem
                  label="Rating"
                  value={vendor.rating?.toFixed(1) || "0.0"}
                />
                <DetailItem
                  label="Total Ratings"
                  value={vendor.totalRatings || 0}
                />
                <DetailItem
                  label="Total Revenue"
                  value={`₹${(vendor.totalRevenue || 0).toLocaleString()}`}
                />
                <DetailItem
                  label="Completed Orders"
                  value={vendor.completedOrders || 0}
                />
              </DetailSection>

              <DetailSection title="Timings" icon={Calendar}>
                {vendor.timings && vendor.timings.length > 0 ? (
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    {vendor.timings.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between py-1 border-b border-gray-50"
                      >
                        <span className="text-gray-600 capitalize">
                          {t.day}
                        </span>
                        <span className="font-medium text-gray-800">
                          {t.isClosed
                            ? "Closed"
                            : `${t.openTime} - ${t.closeTime}`}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No timings set</p>
                )}
              </DetailSection>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between pt-4 text-xs text-gray-400 border-t border-gray-100">
            <span>Created: {formatDate(vendor.createdAt)}</span>
            <span>Updated: {formatDate(vendor.updatedAt)}</span>
            <span>Last Login: {formatDate(vendor.lastLoginAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   HELPER COMPONENTS
===================================================== */
function StatBox({ icon: Icon, label, value, valueColor = "text-gray-900" }) {
  return (
    <div className="p-3 text-center bg-gray-50 rounded-xl">
      <Icon className="w-5 h-5 mx-auto text-gray-400" />
      <p className="text-[10px] font-bold text-gray-500 mt-1">{label}</p>
      <p className={`text-sm font-black ${valueColor}`}>{value}</p>
    </div>
  );
}

function DetailSection({ title, icon: Icon, children }) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl">
      <h3 className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-700">
        <Icon className="w-4 h-4 text-orange-500" />
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="flex justify-between py-1 text-sm border-b border-gray-100">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800 truncate max-w-[60%]">
        {value || "N/A"}
      </span>
    </div>
  );
}

export default TopVendors;
