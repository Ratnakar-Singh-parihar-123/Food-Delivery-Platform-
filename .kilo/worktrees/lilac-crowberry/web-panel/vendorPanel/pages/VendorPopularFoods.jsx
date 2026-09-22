// vendorPanel/pages/PopularFoods.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  LoaderCircle,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useVendor } from "../../src/context/VendorContext";
import {
  getVendorPopularFoods,
  addPopularFood,
  removePopularFood,
  getVendorMenuItems,
} from "../../src/api/vendorApi";
import { buildImageUrl } from "../../src/utils/helpers.js";

export default function VendorPopularFoods() {
  const { vendor } = useVendor();
  const vendorId = vendor?._id || vendor?.id;

  const [popularFoods, setPopularFoods] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [error, setError] = useState("");

  const fetchData = async () => {
    if (!vendorId) return;
    try {
      setLoading(true);
      const [popularRes, menuRes] = await Promise.all([
        getVendorPopularFoods(),
        getVendorMenuItems(vendorId),
      ]);
      setPopularFoods(popularRes.data.popularFoods || []);
      setMenuItems(menuRes.data.items || []);
    } catch (err) {
      setError("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [vendorId]);

  const handleAdd = async () => {
    if (!selectedItemId) return;
    setSubmitting(true);
    try {
      await addPopularFood(selectedItemId);
      setSelectedItemId("");
      await fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to add");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (popularFoodId) => {
    if (!window.confirm("Remove this item from popular list?")) return;
    try {
      await removePopularFood(popularFoodId);
      await fetchData();
    } catch (err) {
      alert("Failed to remove");
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Popular Foods</h1>
          <p className="text-sm text-gray-500">Manage your popular dishes</p>
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

      {/* Add new */}
      <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
        <h3 className="mb-3 text-sm font-bold text-gray-700">
          Add Item to Popular List
        </h3>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="flex-1 min-w-[200px] rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          >
            <option value="">Select a menu item</option>
            {menuItems.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name} (₹{item.price})
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!selectedItemId || submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 disabled:opacity-50"
          >
            {submitting ? (
              <LoaderCircle className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add
          </button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/80">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Item
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {popularFoods.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="flex items-center justify-center py-12 text-gray-400">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      No popular foods added yet
                    </div>
                  </td>
                </tr>
              ) : (
                popularFoods.map((pf) => (
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
                        <span className="font-medium text-gray-900">
                          {pf.menuItem?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {pf.menuItem?.categoryId?.name || "Uncategorized"}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900">
                      ₹{pf.menuItem?.price}
                    </td>
                    <td className="px-4 py-3">
                      {pf.isActive ? (
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
                      <button
                        onClick={() => handleRemove(pf._id)}
                        className="p-1.5 text-red-400 rounded-lg hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
