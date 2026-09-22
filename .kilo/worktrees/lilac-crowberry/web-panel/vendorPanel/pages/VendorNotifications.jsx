import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Send,
  Users,
  UserCog,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Plus,
  Eye,
  Trash2,
  LoaderCircle,
  MessageSquare,
  Megaphone,
  Search,
  Calendar,
} from "lucide-react";

// ─── Dummy Data ─────────────────────────────────────────────
const generateDummyNotifications = () => {
  const audiences = ["admin", "customers", "both"];
  const statuses = ["sent", "pending", "failed"];
  const titles = [
    "New Menu Items Added",
    "Special Discount for Weekend",
    "Delivery Time Change",
    "Holiday Hours",
    "New Partner Offer",
    "Seasonal Specials",
  ];
  const messages = [
    "We've added delicious new items to our menu. Check them out!",
    "Enjoy 20% off on all orders this weekend. Use code WEEKEND20.",
    "Due to heavy traffic, delivery times may be extended by 15 minutes.",
    "We will be closed on Monday for maintenance. Thank you for your understanding.",
    "We've partnered with local farms for fresh ingredients. Taste the difference!",
    "Try our new mango lassi – the perfect summer drink.",
  ];
  const notifications = [];
  const now = new Date();

  for (let i = 1; i <= 8; i++) {
    const audience = audiences[Math.floor(Math.random() * audiences.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const title = titles[i % titles.length];
    const message = messages[i % messages.length];
    const sentAt = new Date(
      now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000,
    );
    notifications.push({
      id: `notif_${i}`,
      title,
      message,
      audience,
      status,
      sentAt: sentAt.toISOString(),
      // For failed, add error message
      error:
        status === "failed" ? "Failed to deliver. Check network." : undefined,
    });
  }
  return notifications.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
};

// ─── Status Badge ──────────────────────────────────────────
function StatusBadge({ status }) {
  const config = {
    sent: {
      label: "Sent",
      className: "bg-green-50 text-green-600 border-green-200",
      icon: CheckCircle,
    },
    pending: {
      label: "Pending",
      className: "bg-amber-50 text-amber-600 border-amber-200",
      icon: Clock,
    },
    failed: {
      label: "Failed",
      className: "bg-red-50 text-red-600 border-red-200",
      icon: AlertCircle,
    },
  };
  const c = config[status] || config.pending;
  const Icon = c.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${c.className}`}
    >
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

// ─── Audience Badge ────────────────────────────────────────
function AudienceBadge({ audience }) {
  const config = {
    admin: {
      label: "Admin",
      className: "bg-blue-50 text-blue-600 border-blue-200",
      icon: UserCog,
    },
    customers: {
      label: "Customers",
      className: "bg-purple-50 text-purple-600 border-purple-200",
      icon: Users,
    },
    both: {
      label: "Admin & Customers",
      className: "bg-indigo-50 text-indigo-600 border-indigo-200",
      icon: Users,
    },
  };
  const c = config[audience] || config.admin;
  const Icon = c.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${c.className}`}
    >
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

// ─── Send Notification Modal ──────────────────────────────
function SendNotificationModal({ onClose, onSend }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("both");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError("Please fill in title and message.");
      return;
    }
    setError("");
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      onSend({
        title: title.trim(),
        message: message.trim(),
        audience,
        status: "sent", // assume success
        sentAt: new Date().toISOString(),
      });
      setLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-gray-100 p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 text-orange-600 bg-orange-100 rounded-full">
            <Megaphone className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Send Notification</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
              className="mt-1 w-full rounded-xl border border-gray-200 py-2.5 px-4 text-sm outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Write your message here..."
              className="mt-1 w-full rounded-xl border border-gray-200 py-2.5 px-4 text-sm outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              Send to
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 py-2.5 px-4 text-sm outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white appearance-none"
            >
              <option value="admin">Admin only</option>
              <option value="customers">Customers only</option>
              <option value="both">Admin & Customers</option>
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <LoaderCircle className="w-4 h-4 animate-spin" />}
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────
export default function VendorNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterAudience, setFilterAudience] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Load dummy data
  useEffect(() => {
    const dummy = generateDummyNotifications();
    setNotifications(dummy);
    setFilteredNotifications(dummy);
    setLoading(false);
  }, []);

  // Filter
  useEffect(() => {
    let result = notifications;
    if (filterAudience !== "all") {
      result = result.filter((n) => n.audience === filterAudience);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q),
      );
    }
    setFilteredNotifications(result);
  }, [notifications, filterAudience, searchQuery]);

  const handleSend = (newNotif) => {
    const notifWithId = {
      ...newNotif,
      id: `notif_${Date.now()}`,
    };
    setNotifications((prev) => [notifWithId, ...prev]);
  };

  const deleteNotification = (id) => {
    if (window.confirm("Delete this notification?")) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  // Stats
  const total = notifications.length;
  const sent = notifications.filter((n) => n.status === "sent").length;
  const pending = notifications.filter((n) => n.status === "pending").length;
  const failed = notifications.filter((n) => n.status === "failed").length;
  const toAdmin = notifications.filter(
    (n) => n.audience === "admin" || n.audience === "both",
  ).length;
  const toCustomers = notifications.filter(
    (n) => n.audience === "customers" || n.audience === "both",
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoaderCircle className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 mx-auto space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-400">
            Send announcements to admin and customers.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Send Notification
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Total" value={total} icon={Bell} color="gray" />
        <StatCard label="Sent" value={sent} icon={CheckCircle} color="green" />
        <StatCard label="Pending" value={pending} icon={Clock} color="amber" />
        <StatCard
          label="Failed"
          value={failed}
          icon={AlertCircle}
          color="red"
        />
        <StatCard
          label="To Customers"
          value={toCustomers}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or message..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
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
        <div className="flex gap-2">
          <FilterChip
            label="All"
            active={filterAudience === "all"}
            onClick={() => setFilterAudience("all")}
          />
          <FilterChip
            label="Admin"
            active={filterAudience === "admin"}
            onClick={() => setFilterAudience("admin")}
            color="blue"
          />
          <FilterChip
            label="Customers"
            active={filterAudience === "customers"}
            onClick={() => setFilterAudience("customers")}
            color="purple"
          />
          <FilterChip
            label="Both"
            active={filterAudience === "both"}
            onClick={() => setFilterAudience("both")}
            color="indigo"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/80">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Audience
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
              <AnimatePresence>
                {filteredNotifications.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <div className="flex items-center justify-center py-12 text-gray-400">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        No notifications found
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredNotifications.map((notif) => (
                    <motion.tr
                      key={notif.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="transition-colors hover:bg-gray-50/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(notif.sentAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {notif.title}
                          </div>
                          <div className="text-xs text-gray-400 truncate max-w-[200px]">
                            {notif.message}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <AudienceBadge audience={notif.audience} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={notif.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            title="View message"
                            onClick={() =>
                              alert(
                                `Title: ${notif.title}\n\nMessage: ${notif.message}`,
                              )
                            }
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteNotification(notif.id)}
                            className="rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <SendNotificationModal
            onClose={() => setIsModalOpen(false)}
            onSend={handleSend}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color = "orange" }) {
  const colorClasses = {
    gray: "bg-gray-50 text-gray-500",
    green: "bg-green-50 text-green-500",
    amber: "bg-amber-50 text-amber-500",
    red: "bg-red-50 text-red-500",
    purple: "bg-purple-50 text-purple-500",
    orange: "bg-orange-50 text-orange-500",
    blue: "bg-blue-50 text-blue-500",
    indigo: "bg-indigo-50 text-indigo-500",
  };
  return (
    <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
      <div className={`p-2 rounded-full ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs font-medium text-gray-400">{label}</p>
      </div>
    </div>
  );
}

// ─── Filter Chip ────────────────────────────────────────────
function FilterChip({ label, active, onClick, color = "gray" }) {
  const colorMap = {
    gray: "border-gray-200 bg-gray-50 text-gray-600",
    blue: "border-blue-200 bg-blue-50 text-blue-600",
    purple: "border-purple-200 bg-purple-50 text-purple-600",
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-600",
  };
  const activeMap = {
    gray: "ring-2 ring-gray-300 border-gray-400",
    blue: "ring-2 ring-blue-300 border-blue-400",
    purple: "ring-2 ring-purple-300 border-purple-400",
    indigo: "ring-2 ring-indigo-300 border-indigo-400",
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all hover:scale-105 ${
        active
          ? `${colorMap[color]} ${activeMap[color]}`
          : "border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-600"
      }`}
    >
      {label}
    </button>
  );
}
