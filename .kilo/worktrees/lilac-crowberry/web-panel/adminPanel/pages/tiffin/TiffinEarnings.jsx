// src/pages/admin/TiffinEarnings.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Store,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Users,
  Eye,
} from "lucide-react";
import { getTiffinHouses } from "../../../src/api/adminApi";

export default function TiffinEarnings() {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalHouses: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await getTiffinHouses({ limit: 100 });
      const vendors = response.data?.data?.vendors || [];
      setHouses(vendors);
      // Calculate summary
      const totalRevenue = vendors.reduce(
        (sum, v) => sum + (v.totalRevenue || 0),
        0,
      );
      const totalOrders = vendors.reduce(
        (sum, v) => sum + (v.totalOrders || 0),
        0,
      );
      setSummary({ totalRevenue, totalOrders, totalHouses: vendors.length });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-black">Tiffin House Earnings</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`₹${summary.totalRevenue.toLocaleString()}`}
          color="green"
        />
        <StatCard
          icon={Users}
          label="Total Orders"
          value={summary.totalOrders}
          color="blue"
        />
        <StatCard
          icon={Store}
          label="Total Houses"
          value={summary.totalHouses}
          color="purple"
        />
      </div>
      <div className="overflow-x-auto bg-white shadow rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                Business
              </th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                Owner
              </th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                Total Orders
              </th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                Total Revenue
              </th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                Rating
              </th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {houses.map((house) => (
              <tr key={house._id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                  {house.businessName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {house.ownerFirstName} {house.ownerLastName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {house.totalOrders || 0}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  ₹{(house.totalRevenue || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {house.rating || 0} ★
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap">
                  <button className="text-orange-600 hover:text-orange-800">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colorClasses = {
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <div className="flex items-center gap-4 p-4 bg-white shadow rounded-xl">
      <div className={`p-3 rounded-full ${colorClasses[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
