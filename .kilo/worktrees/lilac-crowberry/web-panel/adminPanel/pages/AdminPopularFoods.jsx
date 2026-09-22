// adminPanel/pages/PopularFoods.jsx
import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  CheckCircle,
  AlertCircle,
  LoaderCircle,
  Trash2,
  Power,
  PowerOff,
} from "lucide-react";
import {
  getAdminPopularFoods,
  togglePopularFood,
  deletePopularFood,
} from "../../src/api/adminApi";
import { buildImageUrl } from "../../src/utils/helpers.js";

export default function AdminPopularFoods() {
  const [popularFoods, setPopularFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter === "active") params.isActive = "true";
      else if (statusFilter === "inactive") params.isActive = "false";
      if (searchQuery) params.search = searchQuery;
      const res = await getAdminPopularFoods(params);
      setPopularFoods(res.data.popularFoods || []);
    } catch (err) {
      setError("Failed to load popular foods");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, searchQuery]);

  const handleToggle = async (id, currentStatus) => {
    setActionLoading(id);
    try {
      await togglePopularFood(id, !currentStatus);
      await fetchData();
    } catch (err) {
      alert("Failed to toggle status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this popular food entry?")) return;
    setActionLoading(id);
    try {
      await deletePopularFood(id);
      await fetchData();
    } catch (err) {
      alert("Failed to delete");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoaderCircle className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Popular Foods</h1>
          <p className="text-sm text-gray-500">
            Manage popular food items across the platform
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded-xl">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
          <button
            onClick={() => setError("")}
            className="ml-auto text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by item or vendor..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Pending/Inactive</option>
        </select>
      </div>

      <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/80">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Item
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Vendor
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {popularFoods.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="flex items-center justify-center py-12 text-gray-400">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      No popular foods found
                    </div>
                  </td>
                </tr>
              ) : (
                popularFoods.map((pf) => {
                  const isActive = pf.isActive;
                  const isLoading = actionLoading === pf._id;
                  return (
                    <tr key={pf._id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {pf.menuItem?.image && (
                            <img
                              src={buildImageUrl(pf.menuItem.image)}
                              alt={pf.menuItem.name}
                              className="object-cover w-10 h-10 border rounded-lg"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {pf.menuItem?.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {pf.menuItem?.description?.slice(0, 40)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {pf.vendor?.profileImage && (
                            <img
                              src={buildImageUrl(pf.vendor.profileImage)}
                              alt={pf.vendor.businessName}
                              className="object-cover w-6 h-6 rounded-full"
                            />
                          )}
                          <span className="text-gray-700">
                            {pf.vendor?.businessName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">
                        ₹{pf.menuItem?.price}
                      </td>
                      <td className="px-4 py-3">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            <AlertCircle className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggle(pf._id, isActive)}
                            disabled={isLoading}
                            className={`p-1.5 rounded-lg transition ${
                              isActive
                                ? "text-yellow-500 hover:bg-yellow-50"
                                : "text-green-500 hover:bg-green-50"
                            }`}
                            title={isActive ? "Deactivate" : "Activate"}
                          >
                            {isLoading ? (
                              <LoaderCircle className="w-4 h-4 animate-spin" />
                            ) : isActive ? (
                              <PowerOff className="w-4 h-4" />
                            ) : (
                              <Power className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(pf._id)}
                            disabled={isLoading}
                            className="p-1.5 text-red-400 rounded-lg hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
