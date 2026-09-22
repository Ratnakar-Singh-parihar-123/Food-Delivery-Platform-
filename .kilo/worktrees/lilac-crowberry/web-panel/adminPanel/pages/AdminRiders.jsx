import { useEffect, useState } from "react";

import {
  Ban,
  Bike,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Eye,
  LoaderCircle,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Star,
  ToggleLeft,
  ToggleRight,
  Unlock,
} from "lucide-react";

// import {
//   blockRiderApi,
//   getAllRidersApi,
//   getRiderByIdApi,
//   getRiderStatsApi,
//   unblockRiderApi,
//   updateRiderStatusApi,
// } from "../../src/api/riderApi";
import {
  getAllRidersApi,
  getRiderStatsApi,
  getRiderByIdApi,
  blockRiderApi,
  unblockRiderApi,
  updateRiderStatusApi,
} from "../../src/api/adminApi";

import { useNavigate } from "react-router-dom";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:9000";

export default function AdminRiders() {
  const navigate = useNavigate();

  const [riders, setRiders] = useState([]);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const [approvalStatus, setApprovalStatus] = useState("");

  const [workStatus, setWorkStatus] = useState("");

  const [vehicleType, setVehicleType] = useState("");

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState("");

  const [selectedRider, setSelectedRider] = useState(null);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const loadData = async (selectedPage = page) => {
    try {
      setLoading(true);
      setError("");

      const [riderResponse, statsResponse] = await Promise.all([
        getAllRidersApi({
          page: selectedPage,
          limit: 20,

          ...(search.trim()
            ? {
                search: search.trim(),
              }
            : {}),

          ...(approvalStatus
            ? {
                approvalStatus,
              }
            : {}),

          ...(workStatus
            ? {
                workStatus,
              }
            : {}),

          ...(vehicleType
            ? {
                vehicleType,
              }
            : {}),
        }),

        getRiderStatsApi(),
      ]);

      setRiders(riderResponse?.data?.riders || []);

      setPagination(riderResponse?.data?.pagination || {});

      setStats(statsResponse?.data || {});
    } catch (error) {
      setError(error?.response?.data?.message || "Unable to load riders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(page);
  }, [page, approvalStatus, workStatus, vehicleType]);

  const openDetails = async (riderId) => {
    try {
      setActionLoading(riderId);

      const response = await getRiderByIdApi(riderId);

      setSelectedRider(response?.data?.rider || null);
    } catch (error) {
      setError(error?.response?.data?.message || "Unable to load rider");
    } finally {
      setActionLoading("");
    }
  };

  const toggleActive = async (rider) => {
    try {
      setActionLoading(rider._id);

      const next = !rider.isActive;

      await updateRiderStatusApi(rider._id, next);

      setRiders((previous) =>
        previous.map((item) =>
          item._id === rider._id
            ? {
                ...item,
                isActive: next,

                ...(next
                  ? {}
                  : {
                      isOnline: false,
                      isAvailable: false,
                    }),
              }
            : item,
        ),
      );
    } catch (error) {
      setError(error?.response?.data?.message || "Unable to update rider");
    } finally {
      setActionLoading("");
    }
  };

  const block = async (rider) => {
    const reason = window.prompt("Enter block reason");

    if (!reason?.trim()) return;

    try {
      setActionLoading(rider._id);

      await blockRiderApi(rider._id, reason.trim());

      setRiders((previous) =>
        previous.map((item) =>
          item._id === rider._id
            ? {
                ...item,
                isBlocked: true,
                blockReason: reason.trim(),
                isOnline: false,
                isAvailable: false,
              }
            : item,
        ),
      );

      setSuccess("Rider blocked successfully");
    } catch (error) {
      setError(error?.response?.data?.message || "Unable to block rider");
    } finally {
      setActionLoading("");
    }
  };

  const unblock = async (rider) => {
    try {
      setActionLoading(rider._id);

      await unblockRiderApi(rider._id);

      setRiders((previous) =>
        previous.map((item) =>
          item._id === rider._id
            ? {
                ...item,
                isBlocked: false,
                blockReason: "",
              }
            : item,
        ),
      );

      setSuccess("Rider unblocked successfully");
    } catch (error) {
      setError(error?.response?.data?.message || "Unable to unblock rider");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-orange-100 bg-gradient-to-br from-white via-orange-50/50 to-red-50/30 p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
              <Bike className="w-4 h-4" />
              Delivery Management
            </span>

            <h1 className="mt-4 text-3xl font-black text-gray-950">
              All Riders
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage delivery partners, KYC, online status and rider accounts.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => loadData(page)}
              className="inline-flex items-center gap-2 px-4 text-sm font-bold bg-white border border-gray-200 h-11 rounded-xl"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>

            <button
              onClick={() => navigate("/admin/riders/add")}
              className="inline-flex items-center gap-2 px-5 text-sm font-bold text-white bg-orange-500 h-11 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Add Rider
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total Riders" value={stats.total} />

        <Stat label="Approved" value={stats.approved} />

        <Stat label="Online" value={stats.online} />

        <Stat label="Available" value={stats.available} />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm font-bold text-red-600 border border-red-200 rounded-xl bg-red-50">
          <CircleAlert className="w-4 h-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 text-sm font-bold text-green-700 border border-green-200 rounded-xl bg-green-50">
          {success}
        </div>
      )}

      <section className="flex flex-col gap-3 rounded-[24px] border border-gray-200 bg-white p-4 shadow-sm xl:flex-row">
        <div className="relative flex-1">
          <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-4 top-1/2" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                loadData(1);
              }
            }}
            placeholder="Search name, email, phone or vehicle..."
            className="w-full pr-4 text-sm border border-gray-200 outline-none h-11 rounded-xl bg-gray-50 pl-11 focus:border-orange-400"
          />
        </div>

        <select
          value={approvalStatus}
          onChange={(event) => {
            setApprovalStatus(event.target.value);
            setPage(1);
          }}
          className="px-4 text-sm border border-gray-200 h-11 rounded-xl"
        >
          <option value="">All Approval Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={workStatus}
          onChange={(event) => {
            setWorkStatus(event.target.value);
            setPage(1);
          }}
          className="px-4 text-sm border border-gray-200 h-11 rounded-xl"
        >
          <option value="">All Work Status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="available">Available</option>
          <option value="blocked">Blocked</option>
        </select>

        <select
          value={vehicleType}
          onChange={(event) => {
            setVehicleType(event.target.value);
            setPage(1);
          }}
          className="px-4 text-sm border border-gray-200 h-11 rounded-xl"
        >
          <option value="">All Vehicles</option>
          <option value="bike">Bike</option>
          <option value="scooter">Scooter</option>
          <option value="bicycle">Bicycle</option>
          <option value="ev_bike">EV Bike</option>
        </select>

        <button
          onClick={() => loadData(1)}
          className="px-6 text-sm font-bold text-white bg-orange-500 h-11 rounded-xl"
        >
          Search
        </button>
      </section>

      <section className="overflow-hidden rounded-[26px] border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <LoaderCircle className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : riders.length === 0 ? (
          <div className="py-20 text-center">
            <Bike className="mx-auto text-gray-300 h-11 w-11" />

            <p className="mt-4 font-black text-gray-800">No riders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">
                  <th className="px-5 py-4">Rider</th>
                  <th className="px-5 py-4">Vehicle</th>
                  <th className="px-5 py-4">City</th>
                  <th className="px-5 py-4">Approval</th>
                  <th className="px-5 py-4">Work Status</th>
                  <th className="px-5 py-4">Deliveries</th>
                  <th className="px-5 py-4">Rating</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {riders.map((rider) => (
                  <tr
                    key={rider._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <RiderImage rider={rider} />

                        <div>
                          <p className="font-black text-gray-900">
                            {rider.firstName} {rider.lastName}
                          </p>

                          <p className="text-[10px] text-gray-400">
                            {rider.phone}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-gray-700 capitalize">
                        {rider.vehicle?.type?.replace(/_/g, " ") || "N/A"}
                      </p>

                      <p className="text-[10px] text-gray-400">
                        {rider.vehicle?.number}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold text-gray-600">
                      {rider.address?.city || "N/A"}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge value={rider.approvalStatus} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        <span
                          className={`rounded-full px-2 py-1 text-[9px] font-black ${
                            rider.isOnline
                              ? "bg-green-50 text-green-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {rider.isOnline ? "ONLINE" : "OFFLINE"}
                        </span>

                        {rider.isAvailable && (
                          <span className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-black text-blue-600">
                            AVAILABLE
                          </span>
                        )}

                        {rider.isBlocked && (
                          <span className="rounded-full bg-red-50 px-2 py-1 text-[9px] font-black text-red-600">
                            BLOCKED
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-xs font-black text-gray-700">
                      {rider.stats?.completedDeliveries || 0}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-700">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />

                        {rider.rating?.average || 0}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openDetails(rider._id)}
                          className="p-2 text-gray-400 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                        >
                          {actionLoading === rider._id ? (
                            <LoaderCircle className="w-4 h-4 animate-spin" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => toggleActive(rider)}
                          className="p-2 text-green-500 rounded-lg hover:bg-green-50"
                        >
                          {rider.isActive ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </button>

                        {rider.isBlocked ? (
                          <button
                            onClick={() => unblock(rider)}
                            className="p-2 text-green-500 rounded-lg hover:bg-green-50"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => block(rider)}
                            className="p-2 text-red-500 rounded-lg hover:bg-red-50"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Page {pagination.page} of {pagination.pages}
            </p>

            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((previous) => previous - 1)}
                className="flex items-center justify-center border rounded-lg h-9 w-9 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((previous) => previous + 1)}
                className="flex items-center justify-center border rounded-lg h-9 w-9 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {selectedRider && (
        <RiderDrawer
          rider={selectedRider}
          onClose={() => setSelectedRider(null)}
        />
      )}
    </div>
  );
}

function RiderImage({ rider }) {
  const source = rider.profileImage
    ? rider.profileImage.startsWith("http")
      ? rider.profileImage
      : `${API_ORIGIN}${rider.profileImage}`
    : null;

  return (
    <div className="flex items-center justify-center overflow-hidden text-orange-500 h-11 w-11 rounded-xl bg-orange-50">
      {source ? (
        <img
          src={source}
          alt={rider.firstName}
          className="object-cover w-full h-full"
        />
      ) : (
        <Bike className="w-5 h-5" />
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-[22px] border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-gray-950">{value || 0}</p>
    </div>
  );
}

function StatusBadge({ value }) {
  const styles = {
    approved: "bg-green-50 text-green-600",
    pending: "bg-amber-50 text-amber-600",
    rejected: "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${
        styles[value] || "bg-gray-100 text-gray-500"
      }`}
    >
      {value}
    </span>
  );
}

function RiderDrawer({ rider, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/50">
      <div className="absolute inset-0" onClick={onClose} />

      <aside className="absolute top-0 right-0 w-full h-full max-w-2xl p-6 overflow-y-auto bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="float-right px-4 py-2 text-sm font-bold border rounded-xl"
        >
          Close
        </button>

        <h2 className="text-2xl font-black">
          {rider.firstName} {rider.lastName}
        </h2>

        <div className="grid gap-4 mt-6 sm:grid-cols-2">
          <Info label="Email" value={rider.email} />

          <Info label="Phone" value={rider.phone} />

          <Info label="Vehicle" value={rider.vehicle?.type} />

          <Info label="Vehicle Number" value={rider.vehicle?.number} />

          <Info label="Licence" value={rider.drivingLicenseNumber} />

          <Info label="Approval" value={rider.approvalStatus} />

          <Info label="KYC" value={rider.kycStatus} />

          <Info
            label="Total Earnings"
            value={`₹${rider.earnings?.total || 0}`}
          />

          <Info
            label="Completed Deliveries"
            value={rider.stats?.completedDeliveries || 0}
          />

          <Info
            label="Address"
            value={`${rider.address?.addressLine || ""}, ${rider.address?.city || ""}`}
          />
        </div>
      </aside>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="p-4 rounded-xl bg-gray-50">
      <p className="text-[10px] font-black uppercase text-gray-400">{label}</p>

      <p className="mt-1 text-sm font-bold text-gray-800 capitalize">
        {value || "N/A"}
      </p>
    </div>
  );
}
