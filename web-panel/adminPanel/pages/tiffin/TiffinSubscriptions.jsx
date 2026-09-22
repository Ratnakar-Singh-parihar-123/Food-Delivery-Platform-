// src/pages/admin/TiffinSubscriptions.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Users, Calendar, Clock, Eye } from "lucide-react";
import {
  getAllSubscriptionPlans,
  getAllSubscriptions,
} from "../../../src/api/adminApi";

export default function TiffinSubscriptions() {
  const [activeTab, setActiveTab] = useState("plans");
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === "plans") {
        const res = await getAllSubscriptionPlans();
        setPlans(res.data?.data || []);
      } else {
        const res = await getAllSubscriptions();
        setSubscriptions(res.data?.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-black">Tiffin House Subscriptions</h1>
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("plans")}
          className={`px-4 py-2 font-medium ${activeTab === "plans" ? "border-b-2 border-orange-500 text-orange-600" : "text-gray-500"}`}
        >
          Plans
        </button>
        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`px-4 py-2 font-medium ${activeTab === "subscriptions" ? "border-b-2 border-orange-500 text-orange-600" : "text-gray-500"}`}
        >
          Active Subscriptions
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-10">Loading...</div>
      ) : activeTab === "plans" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan._id} className="p-4 bg-white shadow rounded-xl">
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <p className="text-sm text-gray-500">{plan.description}</p>
              <p className="mt-2 text-2xl font-bold">₹{plan.price}</p>
              <p className="text-sm text-gray-500">
                Duration: {plan.duration} days
              </p>
              <p className="text-sm text-gray-500">
                Meals/day: {plan.mealsPerDay}
              </p>
              <p className="text-xs text-gray-400">
                House: {plan.houseId?.businessName || "N/A"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                  Plan
                </th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                  Start
                </th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                  End
                </th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub._id}>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {sub.customerId?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {sub.planId?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(sub.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(sub.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${sub.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <button className="text-orange-600 hover:text-orange-800">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
