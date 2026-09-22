import { useEffect, useState } from "react";

import { Search, Users } from "lucide-react";

import { getVendorCustomersApi } from "../../src/api/vendorApi";

export default function VendorCustomers() {
  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");

  useEffect(() => {
    getVendorCustomersApi().then((response) =>
      setCustomers(response.data.customers || []),
    );
  }, []);

  const filtered = customers.filter((item) => {
    const name = `${item.customer?.firstName || ""} ${
      item.customer?.lastName || ""
    }`.toLowerCase();

    return name.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-950">Customers</h1>

        <p className="mt-2 text-sm text-gray-400">
          Only customers who have ordered from your business are shown.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-4 top-1/2" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="w-full pr-4 text-sm bg-white border border-gray-200 outline-none h-11 rounded-xl pl-11 focus:border-orange-400"
        />
      </div>

      <div className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="w-10 h-10 mx-auto text-gray-300" />

            <p className="mt-3 text-sm font-bold text-gray-500">
              No customers yet
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-[10px] uppercase tracking-wider text-gray-400">
                <th className="px-5 py-4">Customer</th>

                <th className="px-5 py-4">Orders</th>

                <th className="px-5 py-4">Delivered</th>

                <th className="px-5 py-4">Total Spent</th>

                <th className="px-5 py-4">Last Order</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.customer?._id}
                  className="border-t border-gray-100"
                >
                  <td className="px-5 py-4">
                    <p className="font-bold text-gray-900">
                      {item.customer?.firstName} {item.customer?.lastName}
                    </p>

                    <p className="text-xs text-gray-400">
                      {item.customer?.phone}
                    </p>
                  </td>

                  <td className="px-5 py-4 font-bold">{item.totalOrders}</td>

                  <td className="px-5 py-4">{item.deliveredOrders}</td>

                  <td className="px-5 py-4 font-bold">₹{item.totalSpent}</td>

                  <td className="px-5 py-4 text-xs text-gray-400">
                    {new Date(item.lastOrderAt).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
