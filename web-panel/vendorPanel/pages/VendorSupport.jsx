import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Clock,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
  Zap,
  MessageSquare,
  HelpCircle,
  Phone,
  Mail,
  Send,
  Paperclip,
  ChevronRight,
  ChevronDown,
  Plus,
  Filter,
  User,
  Calendar,
  Tag,
  LifeBuoy,
  Headphones,
  BookOpen,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Clock as ClockIcon,
  Check,
  Minus,
  ArrowLeft,
} from "lucide-react";

// ─── Dummy Data Generator ──────────────────────────────────────
const generateDummyTickets = (count = 10) => {
  const subjects = [
    "Payment Issue - Order #ORD-1001",
    "Delivery Partner Not Responding",
    "Order Cancellation Request",
    "Wrong Items Delivered",
    "Refund Not Processed",
    "Technical Glitch in App",
    "Rider Arrived Late",
    "Customer Complaints",
    "Menu Update Required",
    "Account Suspension Query",
  ];
  const statuses = ["open", "in_progress", "resolved", "closed"];
  const priorities = ["low", "medium", "high", "urgent"];
  const messages = [
    "I need help with my recent order. The payment went through but the order status is still pending.",
    "The delivery partner assigned to my order is not responding to calls. Please help.",
    "I want to cancel order #ORD-1001. The customer requested cancellation.",
    "The customer received wrong items in their order. This is a serious issue.",
    "I've been waiting for my refund for 5 days now. Please expedite.",
    "The app keeps crashing when I try to accept new orders.",
    "My rider arrived 30 minutes late and the customer was angry.",
    "Several customers complained about missing items. Please look into this.",
    "I need to update my menu for the new season. How do I do this?",
    "My account was suspended without any warning. Please clarify.",
  ];
  const responses = [
    "We're looking into this. Will update you within 24 hours.",
    "Our team has been notified. A new rider will be assigned shortly.",
    "We've escalated this to our finance team. You'll hear back soon.",
    "We're processing your request. Please allow 2-3 business days.",
    "Issue resolved. Please confirm if everything is okay now.",
    "We've fixed the technical glitch. Please try again.",
    "We've taken action against the rider. Sorry for the inconvenience.",
    "We're investigating the missing items with our quality team.",
    "You can update your menu from the vendor dashboard settings.",
    "Your account has been reactivated. Apologies for the confusion.",
  ];

  const tickets = [];
  const now = new Date();

  for (let i = 1; i <= count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const hasResponse = status !== "open";
    const responseTime = hasResponse
      ? new Date(now.getTime() - Math.floor(Math.random() * 3 * 60 * 60 * 1000))
      : null;
    const createdAt = new Date(
      now.getTime() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
    );
    const updatedAt = hasResponse
      ? responseTime
      : new Date(
          createdAt.getTime() + Math.floor(Math.random() * 60 * 60 * 1000),
        );

    tickets.push({
      _id: `ticket_${i}`,
      ticketId: `TICK-${String(1000 + i).padStart(4, "0")}`,
      subject: subjects[i % subjects.length],
      message: messages[i % messages.length],
      status,
      priority,
      createdAt,
      updatedAt,
      response: hasResponse ? responses[i % responses.length] : null,
      responseTime,
      category: ["order", "payment", "delivery", "technical", "other"][
        Math.floor(Math.random() * 5)
      ],
      attachments: Math.random() > 0.7 ? 1 : 0,
    });
  }

  return tickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// ─── Status Badge ──────────────────────────────────────────────
function StatusBadge({ status }) {
  const config = {
    open: {
      label: "Open",
      className: "bg-amber-50 text-amber-600 border-amber-200",
      icon: AlertCircle,
    },
    in_progress: {
      label: "In Progress",
      className: "bg-blue-50 text-blue-600 border-blue-200",
      icon: Clock,
    },
    resolved: {
      label: "Resolved",
      className: "bg-green-50 text-green-600 border-green-200",
      icon: CheckCircle2,
    },
    closed: {
      label: "Closed",
      className: "bg-gray-50 text-gray-500 border-gray-200",
      icon: X,
    },
  };

  const c = config[status] || config.open;
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

// ─── Priority Badge ──────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const config = {
    low: {
      label: "Low",
      className: "bg-gray-50 text-gray-500 border-gray-200",
    },
    medium: {
      label: "Medium",
      className: "bg-blue-50 text-blue-500 border-blue-200",
    },
    high: {
      label: "High",
      className: "bg-orange-50 text-orange-500 border-orange-200",
    },
    urgent: {
      label: "Urgent",
      className: "bg-red-50 text-red-500 border-red-200",
    },
  };

  const c = config[priority] || config.low;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${c.className}`}
    >
      {c.label}
    </span>
  );
}

// ─── Ticket Detail Modal ──────────────────────────────────────
function TicketDetailModal({ ticket, onClose }) {
  if (!ticket) return null;

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
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-gray-100 p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">
                  {ticket.ticketId}
                </h2>
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
              <p className="mt-1 text-sm text-gray-400">
                {new Date(ticket.createdAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Subject & Message */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-900">
              {ticket.subject}
            </h4>
            <div className="p-4 mt-2 border border-gray-100 rounded-xl bg-gray-50">
              <p className="text-sm leading-relaxed text-gray-700">
                {ticket.message}
              </p>
            </div>
          </div>

          {/* Response */}
          {ticket.response && (
            <div className="p-4 mb-6 border border-orange-100 rounded-xl bg-orange-50">
              <p className="text-xs font-bold tracking-wider text-orange-600 uppercase">
                Support Response
              </p>
              <p className="mt-1 text-sm text-gray-700">{ticket.response}</p>
              {ticket.responseTime && (
                <p className="mt-1 text-[10px] text-gray-400">
                  {new Date(ticket.responseTime).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="p-3 border border-gray-100 rounded-xl bg-gray-50">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Category
              </p>
              <p className="mt-0.5 text-sm font-medium text-gray-700 capitalize">
                {ticket.category}
              </p>
            </div>
            <div className="p-3 border border-gray-100 rounded-xl bg-gray-50">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Status
              </p>
              <p className="mt-0.5 text-sm font-medium text-gray-700 capitalize">
                {ticket.status.replace("_", " ")}
              </p>
            </div>
            <div className="p-3 border border-gray-100 rounded-xl bg-gray-50">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Priority
              </p>
              <p className="mt-0.5 text-sm font-medium text-gray-700 capitalize">
                {ticket.priority}
              </p>
            </div>
            <div className="p-3 border border-gray-100 rounded-xl bg-gray-50">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Attachments
              </p>
              <p className="mt-0.5 text-sm font-medium text-gray-700">
                {ticket.attachments} file{ticket.attachments !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Reply Area */}
          {ticket.status !== "closed" && ticket.status !== "resolved" && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
                Add Reply
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your reply..."
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
                <button className="rounded-xl bg-orange-500 px-4 py-2.5 text-white transition-colors hover:bg-orange-600">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── New Ticket Modal ──────────────────────────────────────────
function NewTicketModal({ onClose, onSubmit }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("order");
  const [priority, setPriority] = useState("medium");

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) return;
    onSubmit({ subject, message, category, priority });
    onClose();
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
        className="relative w-full max-w-lg bg-white shadow-2xl rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                New Support Ticket
              </h3>
              <p className="text-sm text-gray-400">
                We'll get back to you as soon as possible
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-gray-100 p-1.5 text-gray-400 hover:bg-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                className="w-full mt-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                Message *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                rows={4}
                className="w-full mt-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-100 appearance-none bg-white"
                >
                  <option value="order">Order</option>
                  <option value="payment">Payment</option>
                  <option value="delivery">Delivery</option>
                  <option value="technical">Technical</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full mt-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-100 appearance-none bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                Attachments
              </label>
              <div className="flex items-center gap-2 p-3 mt-1 transition-colors border-2 border-gray-200 border-dashed cursor-pointer rounded-xl hover:border-orange-300">
                <Paperclip className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">
                  Drop files here or click to upload
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!subject.trim() || !message.trim()}
              className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Ticket
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function VendorSupport() {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load dummy data
  useEffect(() => {
    const dummy = generateDummyTickets(12);
    setTickets(dummy);
    setFilteredTickets(dummy);
    setLoading(false);
  }, []);

  // Filtering
  useEffect(() => {
    let result = tickets;

    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.ticketId.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q),
      );
    }

    setFilteredTickets(result);
  }, [tickets, statusFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const open = tickets.filter((t) => t.status === "open").length;
    const inProgress = tickets.filter((t) => t.status === "in_progress").length;
    const resolved = tickets.filter((t) => t.status === "resolved").length;
    const closed = tickets.filter((t) => t.status === "closed").length;
    const total = tickets.length;
    return { open, inProgress, resolved, closed, total };
  }, [tickets]);

  // Handlers
  const handleViewTicket = (ticket) => setSelectedTicket(ticket);

  const handleNewTicket = (data) => {
    const newTicket = {
      _id: `ticket_${Date.now()}`,
      ticketId: `TICK-${String(1000 + tickets.length + 1).padStart(4, "0")}`,
      subject: data.subject,
      message: data.message,
      category: data.category,
      priority: data.priority,
      status: "open",
      createdAt: new Date(),
      updatedAt: new Date(),
      response: null,
      responseTime: null,
      attachments: 0,
    };
    setTickets((prev) => [newTicket, ...prev]);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      const dummy = generateDummyTickets(12);
      setTickets(dummy);
      setFilteredTickets(dummy);
      setLoading(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderCircle className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 mx-auto space-y-6 max-w-7xl">
      {/* ─── Stats Row ────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon={AlertCircle}
          label="Open"
          value={stats.open}
          gradient="from-amber-400 to-yellow-400"
        />
        <StatCard
          icon={Clock}
          label="In Progress"
          value={stats.inProgress}
          gradient="from-blue-400 to-cyan-400"
        />
        <StatCard
          icon={CheckCircle2}
          label="Resolved"
          value={stats.resolved}
          gradient="from-green-400 to-emerald-400"
        />
        <StatCard
          icon={X}
          label="Closed"
          value={stats.closed}
          gradient="from-gray-400 to-gray-500"
        />
      </div>

      {/* ─── Quick Actions ────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-3">
        <button
          onClick={() => setShowNewTicket(true)}
          className="flex items-center justify-center gap-2 p-4 text-sm font-bold text-white transition-colors bg-orange-500 shadow-sm rounded-xl hover:bg-orange-600"
        >
          <Plus className="w-4 h-4" />
          New Support Ticket
        </button>
        <button className="flex items-center justify-center gap-2 p-4 text-sm font-bold text-gray-600 transition-colors bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
          <BookOpen className="w-4 h-4" />
          Help Center
        </button>
        <button className="flex items-center justify-center gap-2 p-4 text-sm font-bold text-gray-600 transition-colors bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
          <MessageSquare className="w-4 h-4" />
          Live Chat (Online)
        </button>
      </div>

      {/* ─── Filters ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
          Status:
        </span>
        {["all", "open", "in_progress", "resolved", "closed"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              statusFilter === s
                ? "bg-orange-500 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s === "all" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* ─── Search ────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by ticket ID or subject..."
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

      {/* ─── Ticket Table ──────────────────────────────────── */}
      <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/80">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Ticket ID
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Subject
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div className="flex items-center justify-center py-12 text-gray-400">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        No tickets found
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <motion.tr
                      key={ticket._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="transition-colors cursor-pointer hover:bg-gray-50/50"
                      onClick={() => handleViewTicket(ticket)}
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-gray-900">
                          {ticket.ticketId}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-600 truncate max-w-[200px] block">
                          {ticket.subject}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500 capitalize">
                          {ticket.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-400">
                          {new Date(ticket.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                            },
                          )}
                        </span>
                        <span className="block text-[10px] text-gray-300">
                          {new Date(ticket.createdAt).toLocaleTimeString(
                            "en-IN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ChevronRight className="inline w-4 h-4 text-gray-300" />
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── FAQ Section ────────────────────────────────────── */}
      <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-orange-500" />
          <h3 className="text-sm font-bold text-gray-900">
            Frequently Asked Questions
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <FaqItem
            question="How do I update my menu?"
            answer="Go to the Menu section from the sidebar and click 'Edit' on any item."
          />
          <FaqItem
            question="What do I do if a customer complains?"
            answer="Create a support ticket with all details and we'll help resolve it."
          />
          <FaqItem
            question="How do I view my earnings?"
            answer="Visit the Earnings page from the sidebar for a detailed breakdown."
          />
          <FaqItem
            question="How do I assign a rider to an order?"
            answer="Go to Live Orders, click the rider icon on any pending order."
          />
        </div>
      </div>

      {/* ─── Contact Support ────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 shadow-sm rounded-2xl">
          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full">
            <Phone className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              Call Us
            </p>
            <p className="text-sm font-bold text-gray-900">+91 1800-123-4567</p>
            <p className="text-[10px] text-gray-400">Mon-Sat, 9AM - 9PM</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 shadow-sm rounded-2xl">
          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full">
            <Mail className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              Email Us
            </p>
            <p className="text-sm font-bold text-gray-900">
              support@vendorhub.com
            </p>
            <p className="text-[10px] text-gray-400">
              Response within 24 hours
            </p>
          </div>
        </div>
      </div>

      {/* ─── Modals ────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedTicket && (
          <TicketDetailModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
          />
        )}
        {showNewTicket && (
          <NewTicketModal
            onClose={() => setShowNewTicket(false)}
            onSubmit={handleNewTicket}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── StatCard ──────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, gradient }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400 }}
      className="relative overflow-hidden rounded-[22px] border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div
        className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${gradient} opacity-10`}
      />
      <div className="relative">
        <div
          className={`inline-flex rounded-xl bg-gradient-to-br ${gradient} p-2.5 text-white shadow-lg`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <p className="mt-4 text-xs font-semibold text-gray-400">{label}</p>
        <p className="mt-1 text-2xl font-black text-gray-950">{value}</p>
      </div>
    </motion.div>
  );
}

// ─── FAQ Item ──────────────────────────────────────────────────
function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="overflow-hidden border border-gray-100 rounded-xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 text-left transition-colors hover:bg-gray-50"
      >
        <span className="text-sm font-medium text-gray-800">{question}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-3 text-sm text-gray-500">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
