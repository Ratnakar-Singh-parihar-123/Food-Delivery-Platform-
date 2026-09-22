const statusColors = {
  Pending: "bg-gray-100 text-gray-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Preparing: "bg-yellow-100 text-yellow-700",
  Ready: "bg-indigo-100 text-indigo-700",
  "Waiting Rider": "bg-orange-100 text-orange-700",
  "Picked Up": "bg-purple-100 text-purple-700",
  "On The Way": "bg-cyan-100 text-cyan-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }) {
  const classes = statusColors[status] || "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${classes}`}
    >
      {status}
    </span>
  );
}
