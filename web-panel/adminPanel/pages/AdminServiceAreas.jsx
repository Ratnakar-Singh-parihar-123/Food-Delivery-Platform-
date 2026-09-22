// src/adminPanel/pages/AdminServiceAreas.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Power,
  PowerOff,
  LoaderCircle,
  AlertCircle,
  X,
  Check,
  MapPin,
} from "lucide-react";
import {
  getServiceAreas,
  createServiceArea,
  updateServiceArea,
  deleteServiceArea,
  toggleServiceAreaStatus,
} from "../../src/api/adminApi";

export default function AdminServiceAreas() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState("all");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    latitude: "",
    longitude: "",
    radius: 5000,
    deliveryCharge: 0,
    minOrderAmount: 0,
    estimatedDeliveryTime: 30,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchAreas = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filterActive !== "all") params.isActive = filterActive === "active";
      const res = await getServiceAreas(params);
      setAreas(res.data.areas || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load service areas");
    } finally {
      setLoading(false);
    }
  }, [search, filterActive]);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  // ─── Handlers ──────────────────────────────────────────
  const openCreateModal = () => {
    setEditingArea(null);
    setFormData({
      name: "",
      latitude: "",
      longitude: "",
      radius: 5000,
      deliveryCharge: 0,
      minOrderAmount: 0,
      estimatedDeliveryTime: 30,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (area) => {
    setEditingArea(area);
    setFormData({
      name: area.name,
      latitude: area.location.coordinates[1],
      longitude: area.location.coordinates[0],
      radius: area.radius || 5000,
      deliveryCharge: area.deliveryCharge || 0,
      minOrderAmount: area.minOrderAmount || 0,
      estimatedDeliveryTime: area.estimatedDeliveryTime || 30,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleToggle = async (area) => {
    try {
      await toggleServiceAreaStatus(area._id, !area.isActive);
      fetchAreas();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service area?"))
      return;
    try {
      await deleteServiceArea(id);
      fetchAreas();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.latitude) errors.latitude = "Latitude is required";
    if (!formData.longitude) errors.longitude = "Longitude is required";
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        radius: parseInt(formData.radius),
        deliveryCharge: parseFloat(formData.deliveryCharge),
        minOrderAmount: parseFloat(formData.minOrderAmount),
        estimatedDeliveryTime: parseInt(formData.estimatedDeliveryTime),
      };

      if (editingArea) {
        await updateServiceArea(editingArea._id, payload);
      } else {
        await createServiceArea(payload);
      }
      setModalOpen(false);
      fetchAreas();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderCircle className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Areas</h1>
          <p className="text-sm text-gray-500">
            Manage delivery coverage zones
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-orange-500 rounded-lg hover:bg-orange-600"
        >
          <Plus className="w-4 h-4" />
          Add Area
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="w-full py-2.5 pl-10 pr-4 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
          <button
            onClick={() => setError("")}
            className="ml-auto text-xs font-bold text-red-500 hover:text-red-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden bg-white border border-gray-200 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-xs font-bold text-left text-gray-400 uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-xs font-bold text-left text-gray-400 uppercase">
                  Location
                </th>
                <th className="px-4 py-3 text-xs font-bold text-left text-gray-400 uppercase">
                  Radius
                </th>
                <th className="px-4 py-3 text-xs font-bold text-left text-gray-400 uppercase">
                  Delivery Charge
                </th>
                <th className="px-4 py-3 text-xs font-bold text-left text-gray-400 uppercase">
                  Min Order
                </th>
                <th className="px-4 py-3 text-xs font-bold text-left text-gray-400 uppercase">
                  Est. Time
                </th>
                <th className="px-4 py-3 text-xs font-bold text-left text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-bold text-right text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {areas.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-400">
                    No service areas found
                  </td>
                </tr>
              ) : (
                areas.map((area) => (
                  <tr key={area._id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {area.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="inline-flex items-center gap-1 text-xs">
                        <MapPin className="w-3 h-3" />
                        {area.location.coordinates[1].toFixed(4)},{" "}
                        {area.location.coordinates[0].toFixed(4)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{area.radius}m</td>
                    <td className="px-4 py-3 text-gray-600">
                      ₹{area.deliveryCharge}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      ₹{area.minOrderAmount}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {area.estimatedDeliveryTime} min
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full ${
                          area.isActive
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-50 text-gray-400"
                        }`}
                      >
                        {area.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggle(area)}
                          className="p-1.5 text-gray-400 rounded-lg hover:bg-gray-100"
                          title={area.isActive ? "Deactivate" : "Activate"}
                        >
                          {area.isActive ? (
                            <PowerOff className="w-4 h-4" />
                          ) : (
                            <Power className="w-4 h-4 text-green-500" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(area)}
                          className="p-1.5 text-gray-400 rounded-lg hover:bg-gray-100"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(area._id)}
                          className="p-1.5 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Create/Edit Modal ──────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingArea ? "Edit Service Area" : "Add Service Area"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 mt-1 border border-gray-200 outline-none rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  placeholder="e.g., Indore City"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                    className="w-full px-4 py-2 mt-1 border border-gray-200 outline-none rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="22.7196"
                  />
                  {formErrors.latitude && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.latitude}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                    className="w-full px-4 py-2 mt-1 border border-gray-200 outline-none rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="75.8577"
                  />
                  {formErrors.longitude && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.longitude}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Radius (meters)
                  </label>
                  <input
                    type="number"
                    value={formData.radius}
                    onChange={(e) =>
                      setFormData({ ...formData, radius: e.target.value })
                    }
                    className="w-full px-4 py-2 mt-1 border border-gray-200 outline-none rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Est. Delivery Time (min)
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedDeliveryTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedDeliveryTime: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 mt-1 border border-gray-200 outline-none rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Delivery Charge (₹)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.deliveryCharge}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deliveryCharge: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 mt-1 border border-gray-200 outline-none rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Min Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minOrderAmount: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 mt-1 border border-gray-200 outline-none rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                  ) : null}
                  {editingArea ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
