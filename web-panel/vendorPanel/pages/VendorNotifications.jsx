import { useEffect, useMemo, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  Bell,
  Send,
  Users,
  Bike,
  Store,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Plus,
  Eye,
  LoaderCircle,
  Megaphone,
  Search,
  Calendar,
  ChevronRight,
  Tag,
  ShieldCheck,
  User,
  Layers,
  RefreshCw,
  Copy,
  ExternalLink,
  Inbox,
  Filter,
  Sparkles,
} from "lucide-react";

import {
  createVendorNotification,
  getVendorNotificationHistory,
} from "../../src/api/vendorApi";

import { getApiError } from "../../src/api/getApiError";

/* =====================================================
   HELPERS
===================================================== */

const getNotificationId = (n) => n?._id || n?.id || n?.notificationId;

const getNotificationDate = (n) => n?.createdAt || n?.sentAt || n?.updatedAt;

/* =====================================================
   AUDIENCE VALUE
===================================================== */

const getAudienceValue = (notification) => {
  const audience = notification?.audience;
  if (!audience) return "unknown";
  if (typeof audience === "string") return audience;

  const type = audience?.type;

  if (type === "all") return "all";
  if (type === "vendor_customers") return "vendor_customers";
  if (type === "users") return "specific";

  if (type === "role") {
    const roles = Array.isArray(audience?.roles) ? audience.roles : [];
    const hasCustomer = roles.includes("customer");
    const hasRider = roles.includes("rider");
    const hasVendor = roles.includes("vendor");

    if (hasCustomer && hasRider) return "customers_riders";
    if (hasCustomer) return "customers";
    if (hasRider) return "riders";
    if (hasVendor) return "vendors";
    return "role";
  }

  return "unknown";
};

const getAudienceLabel = (notification) => {
  const value = getAudienceValue(notification);
  const labels = {
    all: "Everyone",
    customers: "Customers",
    riders: "Riders",
    vendors: "Vendors",
    vendor_customers: "My Customers",
    customers_riders: "Customers & Riders",
    specific: "Specific Users",
    role: "Role Based",
    unknown: "Unknown",
  };
  return labels[value] || "Unknown";
};

const getSenderType = (n) =>
  n?.sender?.type ||
  n?.senderType ||
  n?.createdByType ||
  n?.sourceType ||
  "unknown";

const getSenderName = (n) =>
  n?.sender?.name ||
  n?.senderName ||
  n?.createdByName ||
  n?.vendorName ||
  n?.vendor?.name ||
  (getSenderType(n) === "admin" ? "FoodMitra Admin" : "Unknown");

const getStatus = (n) =>
  n?.status || (n?.isActive === false ? "inactive" : "sent");

const formatDate = (date) => {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =====================================================
   SHARED BADGE STYLES
===================================================== */

const badgeBase =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap";

/* =====================================================
   STATUS BADGE
===================================================== */

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
    inactive: {
      label: "Inactive",
      className: "bg-gray-50 text-gray-500 border-gray-200",
      icon: AlertCircle,
    },
  };
  const current = config[status] || config.sent;
  const Icon = current.icon;

  return (
    <span className={`${badgeBase} ${current.className}`}>
      <Icon className="w-3 h-3" />
      {current.label}
    </span>
  );
}

/* =====================================================
   AUDIENCE BADGE
===================================================== */

function AudienceBadge({ notification }) {
  const audience = getAudienceValue(notification);
  const config = {
    all: {
      label: "Everyone",
      className: "bg-orange-50 text-orange-600 border-orange-200",
      icon: Users,
    },
    customers: {
      label: "Customers",
      className: "bg-purple-50 text-purple-600 border-purple-200",
      icon: Users,
    },
    riders: {
      label: "Riders",
      className: "bg-blue-50 text-blue-600 border-blue-200",
      icon: Bike,
    },
    vendors: {
      label: "Vendors",
      className: "bg-indigo-50 text-indigo-600 border-indigo-200",
      icon: Store,
    },
    vendor_customers: {
      label: "My Customers",
      className: "bg-pink-50 text-pink-600 border-pink-200",
      icon: Store,
    },
    customers_riders: {
      label: "Customers & Riders",
      className: "bg-cyan-50 text-cyan-600 border-cyan-200",
      icon: Users,
    },
    specific: {
      label: "Specific Users",
      className: "bg-gray-50 text-gray-600 border-gray-200",
      icon: User,
    },
    role: {
      label: "Role Based",
      className: "bg-cyan-50 text-cyan-600 border-cyan-200",
      icon: Layers,
    },
  };
  const current = config[audience] || {
    label: getAudienceLabel(notification),
    className: "bg-gray-50 text-gray-500 border-gray-200",
    icon: Layers,
  };
  const Icon = current.icon;

  return (
    <span className={`${badgeBase} ${current.className}`}>
      <Icon className="w-3 h-3" />
      {current.label}
    </span>
  );
}

/* =====================================================
   SENDER BADGE
===================================================== */

function SenderBadge({ notification }) {
  const senderType = getSenderType(notification);
  const config = {
    admin: {
      label: "Admin",
      className: "bg-orange-50 text-orange-600 border-orange-200",
      icon: ShieldCheck,
    },
    vendor: {
      label: "Vendor",
      className: "bg-purple-50 text-purple-600 border-purple-200",
      icon: Store,
    },
    rider: {
      label: "Rider",
      className: "bg-blue-50 text-blue-600 border-blue-200",
      icon: Bike,
    },
    customer: {
      label: "Customer",
      className: "bg-green-50 text-green-600 border-green-200",
      icon: User,
    },
  };
  const current = config[senderType] || {
    label: "Unknown",
    className: "bg-gray-50 text-gray-500 border-gray-200",
    icon: Bell,
  };
  const Icon = current.icon;

  return (
    <span className={`${badgeBase} ${current.className}`}>
      <Icon className="w-3 h-3" />
      {current.label}
    </span>
  );
}

/* =====================================================
   TYPE BADGE
===================================================== */

function TypeBadge({ type }) {
  const config = {
    general: {
      label: "General",
      className: "bg-gray-50 text-gray-600 border-gray-200",
    },
    promotion: {
      label: "Promotion",
      className: "bg-orange-50 text-orange-600 border-orange-200",
    },
    offer: {
      label: "Offer",
      className: "bg-green-50 text-green-600 border-green-200",
    },
    system: {
      label: "System",
      className: "bg-blue-50 text-blue-600 border-blue-200",
    },
    warning: {
      label: "Warning",
      className: "bg-red-50 text-red-600 border-red-200",
    },
  };
  const current = config[type] || config.general;

  return (
    <span className={`${badgeBase} ${current.className}`}>{current.label}</span>
  );
}

/* =====================================================
   SEND NOTIFICATION MODAL
===================================================== */

function SendNotificationModal({ onClose, onSend }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all_customers");
  const [discountType, setDiscountType] = useState("none");
  const [discountValue, setDiscountValue] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please enter notification title.");
      return;
    }
    if (!message.trim()) {
      setError("Please enter notification message.");
      return;
    }
    if (
      discountType === "percentage" &&
      (!discountValue ||
        Number(discountValue) < 1 ||
        Number(discountValue) > 100)
    ) {
      setError("Percentage discount must be between 1 and 100.");
      return;
    }
    if (discountType === "fixed" && Number(discountValue) < 0) {
      setError("Fixed discount cannot be negative.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        message: message.trim(),
        audience,
        discountType,
        discountValue: Number(discountValue) || 0,
        couponCode: couponCode.trim().toUpperCase(),
        expiresAt: null,
      };

      await onSend(payload);
      onClose();
    } catch (err) {
      setError(
        getApiError?.(err) ||
          err?.response?.data?.message ||
          "Failed to send notification.",
      );
    } finally {
      setLoading(false);
    }
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
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute p-2 text-gray-400 transition bg-gray-100 rounded-full right-5 top-5 hover:bg-gray-200 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 text-orange-600 bg-orange-100 rounded-2xl">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Send Notification
            </h2>
            <p className="text-sm text-gray-400">
              Send a notification to your customers or delivery riders.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
              Notification Title *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Weekend Special Offer"
              maxLength={100}
              className="w-full px-4 py-3 text-sm transition border border-gray-200 outline-none rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
            />
            <p className="mt-1 text-right text-[10px] text-gray-400">
              {title.length}/100
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
              Message *
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your notification message..."
              maxLength={500}
              className="w-full px-4 py-3 text-sm transition border border-gray-200 outline-none resize-none rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
            />
            <p className="mt-1 text-right text-[10px] text-gray-400">
              {message.length}/500
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
              Send To *
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-white border border-gray-200 outline-none rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
            >
              <option value="all_customers">All My Customers</option>
              <option value="all_riders">All Delivery Riders</option>
            </select>

            <div className="flex items-start gap-2 p-3 mt-2 border border-orange-100 rounded-xl bg-orange-50">
              {audience === "all_customers" ? (
                <Users className="w-4 h-4 mt-0.5 shrink-0 text-orange-500" />
              ) : (
                <Bike className="w-4 h-4 mt-0.5 shrink-0 text-orange-500" />
              )}
              <p className="text-xs leading-5 text-orange-700">
                {audience === "all_customers"
                  ? "This notification will be sent to customers who have previously completed a delivered order from your business."
                  : "This notification will be sent to delivery riders through the rider notification channel."}
              </p>
            </div>
          </div>

          <div className="p-4 border border-orange-100 rounded-2xl bg-orange-50/50">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold text-gray-800">
                Offer Details
              </span>
              <span className="text-xs text-gray-400">Optional</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-400"
              >
                <option value="none">No Discount</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Flat Amount</option>
              </select>

              <input
                type="number"
                min="0"
                max={discountType === "percentage" ? 100 : undefined}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="Discount value"
                disabled={discountType === "none"}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none disabled:bg-gray-100 focus:border-orange-400"
              />

              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Coupon code"
                maxLength={30}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm uppercase outline-none focus:border-orange-400 sm:col-span-2"
              />
            </div>
          </div>

          <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0 text-gray-500" />
              <div>
                <p className="text-sm font-bold text-gray-800">
                  Vendor notification
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Notifications are sent from your approved vendor account. They
                  are delivered through FoodMitra's notification system.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 text-sm text-red-600 border border-red-100 rounded-xl bg-red-50">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 text-sm font-bold text-gray-600 transition border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center flex-1 gap-2 py-3 text-sm font-bold text-white transition bg-orange-500 shadow-sm rounded-xl hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <LoaderCircle className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {loading ? "Sending..." : "Send Notification"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* =====================================================
   DETAIL MODAL
===================================================== */

function NotificationDetailModal({ notification, onClose }) {
  if (!notification) return null;

  const discountType = notification?.offer?.discountType;
  const discountValue = notification?.offer?.discountValue;
  const hasOffer =
    discountType && discountType !== "none" && Number(discountValue) > 0;
  const senderType = getSenderType(notification);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ type: "spring", damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        <div className="sticky top-0 z-10 px-6 py-4 border-b border-gray-100 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 text-orange-600 bg-orange-100 rounded-2xl">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">
                  Notification Details
                </h2>
                <p className="text-xs text-gray-400">
                  {formatDateTime(getNotificationDate(notification))}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 transition bg-gray-100 rounded-full hover:bg-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <TypeBadge type={notification.type} />
              <AudienceBadge notification={notification} />
              <SenderBadge notification={notification} />
              <StatusBadge status={getStatus(notification)} />
            </div>
            <h2 className="text-2xl font-bold leading-tight text-gray-900">
              {notification.title || "Notification"}
            </h2>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-6 h-6 bg-white rounded-lg">
                <Megaphone className="h-3.5 w-3.5 text-orange-500" />
              </div>
              <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                Message
              </span>
            </div>
            <p className="text-sm leading-6 text-gray-700 whitespace-pre-wrap">
              {notification.message || "No message available."}
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-2xl">
            <p className="mb-3 text-xs font-bold tracking-wider text-gray-400 uppercase">
              Notification Source
            </p>
            <div className="flex items-center gap-3">
              <div className="p-3 text-orange-500 rounded-xl bg-orange-50">
                {senderType === "vendor" ? (
                  <Store className="w-5 h-5" />
                ) : senderType === "rider" ? (
                  <Bike className="w-5 h-5" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {getSenderName(notification)}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {senderType} notification
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-2xl">
            <p className="mb-3 text-xs font-bold tracking-wider text-gray-400 uppercase">
              Audience
            </p>
            <div className="flex items-center gap-3">
              <AudienceBadge notification={notification} />
              <p className="text-xs text-gray-500">
                Targeted to{" "}
                <span className="font-bold text-gray-800">
                  {getAudienceLabel(notification)}
                </span>
                .
              </p>
            </div>
          </div>

          {hasOffer && (
            <div className="p-5 border border-orange-200 rounded-2xl bg-orange-50">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-5 h-5 text-orange-500" />
                <span className="font-bold text-gray-900">Offer Details</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-3xl font-black text-orange-600">
                    {discountType === "percentage"
                      ? `${discountValue}% OFF`
                      : `₹${discountValue} OFF`}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Promotional discount
                  </p>
                </div>
                {notification?.offer?.couponCode && (
                  <div className="px-4 py-3 bg-white border border-orange-300 border-dashed rounded-xl">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                      Coupon Code
                    </p>
                    <p className="mt-1 font-black tracking-wider text-gray-900">
                      {notification.offer.couponCode}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {notification?.action?.label && (
            <div className="p-4 border border-gray-200 rounded-2xl">
              <p className="mb-3 text-xs font-bold tracking-wider text-gray-400 uppercase">
                Action
              </p>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-gray-900">
                    {notification.action.label}
                  </p>
                  {notification.action.url && (
                    <p className="mt-1 text-xs text-gray-400 break-all">
                      {notification.action.url}
                    </p>
                  )}
                </div>
                <ExternalLink className="w-5 h-5 text-orange-500 shrink-0" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <InfoBox
              label="Created"
              value={formatDateTime(notification.createdAt)}
            />
            <InfoBox
              label="Priority"
              value={notification.priority || "normal"}
            />
            <InfoBox label="Audience" value={getAudienceLabel(notification)} />
          </div>

          {getNotificationId(notification) && (
            <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Notification ID
                  </p>
                  <p className="mt-1 font-mono text-xs text-gray-600 break-all">
                    {String(getNotificationId(notification))}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const id = getNotificationId(notification);
                    if (id) navigator.clipboard?.writeText(String(id));
                  }}
                  className="p-2 text-gray-400 transition bg-white border border-gray-200 rounded-lg shrink-0 hover:text-orange-500 hover:border-orange-200"
                  title="Copy notification ID"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 text-sm font-bold text-white transition bg-orange-500 rounded-xl hover:bg-orange-600"
          >
            Close Details
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* =====================================================
   INFO BOX
===================================================== */

function InfoBox({ label, value }) {
  return (
    <div className="p-3 bg-white border border-gray-200 rounded-xl">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-gray-800 capitalize truncate">
        {value}
      </p>
    </div>
  );
}

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function VendorNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  /* "" means NO filter — this fixes the "all" conflict */
  const [audienceFilter, setAudienceFilter] = useState("");
  const [senderFilter, setSenderFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  /* =====================================================
     LOAD NOTIFICATIONS
  ===================================================== */

  const loadNotifications = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const response = await getVendorNotificationHistory();
      const data =
        response?.data?.notifications || response?.notifications || [];

      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Vendor notification history error:",
        error?.response?.data || error,
      );
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications(true);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications(false);
  };

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    if (audienceFilter) {
      result = result.filter((n) => getAudienceValue(n) === audienceFilter);
    }

    if (senderFilter) {
      result = result.filter((n) => getSenderType(n) === senderFilter);
    }

    if (typeFilter) {
      result = result.filter((n) => n?.type === typeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter((n) => {
        const title = n?.title || "";
        const message = n?.message || "";
        const sender = getSenderName(n);
        return (
          title.toLowerCase().includes(query) ||
          message.toLowerCase().includes(query) ||
          sender.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [notifications, audienceFilter, senderFilter, typeFilter, searchQuery]);

  /* =====================================================
     SEND
  ===================================================== */

  const handleSend = async (payload) => {
    try {
      await createVendorNotification(payload);
      await loadNotifications(false);
    } catch (error) {
      console.error(
        "Create vendor notification error:",
        error?.response?.data || error,
      );
      throw error;
    }
  };

  /* =====================================================
     STATS
  ===================================================== */

  const total = notifications.length;

  const adminReceived = notifications.filter(
    (n) => getSenderType(n) === "admin",
  ).length;

  const vendorSent = notifications.filter(
    (n) => getSenderType(n) === "vendor",
  ).length;

  const customerNotifications = notifications.filter((n) => {
    const a = getAudienceValue(n);
    return (
      a === "customers" ||
      a === "vendor_customers" ||
      a === "specific" ||
      a === "all" ||
      a === "customers_riders"
    );
  }).length;

  const riderNotifications = notifications.filter((n) => {
    const a = getAudienceValue(n);
    return a === "riders" || a === "all" || a === "customers_riders";
  }).length;

  const activeNotifications = notifications.filter(
    (n) => getStatus(n) === "sent",
  ).length;

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 rounded-2xl bg-orange-50">
            <LoaderCircle className="text-orange-500 h-7 w-7 animate-spin" />
          </div>
          <p className="text-sm font-medium text-gray-400">
            Loading notifications...
          </p>
        </div>
      </div>
    );
  }

  const hasActiveFilters =
    audienceFilter || senderFilter || typeFilter || searchQuery.trim();

  return (
    <div className="px-4 pb-10 mx-auto space-y-6 max-w-7xl">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 text-orange-600 bg-orange-100 rounded-2xl">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Notifications</h1>
            <p className="mt-1 text-sm text-gray-400">
              View FoodMitra updates and send notifications to your customers or
              delivery riders.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            onClick={() => setIsSendModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600"
          >
            <Plus className="w-4 h-4" />
            Send Notification
          </button>
        </div>
      </div>

      {/* =================================================
          INFO BANNER
      ================================================= */}

      <div className="p-4 border border-orange-100 rounded-2xl bg-orange-50">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0 text-orange-500" />
          <div>
            <p className="text-sm font-bold text-orange-800">
              Vendor Notification Center
            </p>
            <p className="mt-1 text-xs leading-5 text-orange-700">
              You can receive notifications from FoodMitra Admin and view
              notifications sent from your vendor account. You can also send
              notifications to your customers and delivery riders.
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          STATS
      ================================================= */}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total" value={total} icon={Bell} color="gray" />
        <StatCard
          label="Admin Received"
          value={adminReceived}
          icon={ShieldCheck}
          color="orange"
        />
        <StatCard
          label="Vendor Sent"
          value={vendorSent}
          icon={Store}
          color="purple"
        />
        <StatCard
          label="Customers"
          value={customerNotifications}
          icon={Users}
          color="pink"
        />
        <StatCard
          label="Riders"
          value={riderNotifications}
          icon={Bike}
          color="blue"
        />
        <StatCard
          label="Active"
          value={activeNotifications}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* =================================================
          SOURCE SUMMARY
      ================================================= */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SourceCard
          icon={ShieldCheck}
          title="Admin Notifications"
          description="Updates and announcements sent by FoodMitra Admin"
          count={adminReceived}
          color="orange"
        />
        <SourceCard
          icon={Store}
          title="Your Notifications"
          description="Notifications created from your vendor account"
          count={vendorSent}
          color="purple"
        />
      </div>

      {/* =================================================
          SEARCH / FILTER
      ================================================= */}

      <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, message or sender..."
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
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

        {/* Filter groups */}

        <FilterGroup
          label="Audience"
          icon={Users}
          options={[
            { value: "", label: "All", color: "gray" },
            {
              value: "vendor_customers",
              label: "My Customers",
              color: "pink",
            },
            { value: "customers", label: "Customers", color: "purple" },
            { value: "riders", label: "Riders", color: "blue" },
            { value: "all", label: "Everyone", color: "orange" },
          ]}
          value={audienceFilter}
          onChange={setAudienceFilter}
        />

        <FilterGroup
          label="Source"
          icon={ShieldCheck}
          options={[
            { value: "", label: "All Sources", color: "gray" },
            { value: "admin", label: "Admin", color: "orange" },
            { value: "vendor", label: "Vendor", color: "purple" },
          ]}
          value={senderFilter}
          onChange={setSenderFilter}
        />

        <FilterGroup
          label="Type"
          icon={Layers}
          options={[
            { value: "", label: "All Types", color: "gray" },
            { value: "promotion", label: "Promotion", color: "orange" },
            { value: "general", label: "General", color: "gray" },
            { value: "system", label: "System", color: "blue" },
            { value: "warning", label: "Warning", color: "red" },
          ]}
          value={typeFilter}
          onChange={setTypeFilter}
        />

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              <span className="font-bold text-gray-700">
                {filteredNotifications.length}
              </span>{" "}
              result
              {filteredNotifications.length !== 1 ? "s" : ""} matching your
              filters
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setAudienceFilter("");
                setSenderFilter("");
                setTypeFilter("");
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700"
            >
              <X className="w-3.5 h-3.5" />
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Notification History</h2>
            <p className="mt-0.5 text-xs text-gray-400">
              {filteredNotifications.length} notification
              {filteredNotifications.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <div className="items-center hidden gap-2 text-xs text-gray-400 sm:flex">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Live data
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/80">
              <tr>
                {[
                  "Notification",
                  "Source",
                  "Audience",
                  "Type",
                  "Status",
                  "Date",
                  "",
                ].map((h, i) => (
                  <th
                    key={h || i}
                    className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 ${
                      i === 0
                        ? "text-left px-5"
                        : i === 6
                          ? "text-right"
                          : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              <AnimatePresence mode="popLayout">
                {filteredNotifications.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-16">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-4 rounded-2xl bg-gray-50">
                          <Inbox className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="mt-3 font-bold text-gray-700">
                          No notifications found
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {hasActiveFilters
                            ? "Try adjusting your search or filters."
                            : "Send your first notification to get started."}
                        </p>
                        {hasActiveFilters && (
                          <button
                            onClick={() => {
                              setSearchQuery("");
                              setAudienceFilter("");
                              setSenderFilter("");
                              setTypeFilter("");
                            }}
                            className="mt-3 text-xs font-bold text-orange-600 hover:text-orange-700"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredNotifications.map((notification) => {
                    const id = getNotificationId(notification);

                    return (
                      <motion.tr
                        key={
                          id ||
                          `${notification.createdAt}-${notification.title}`
                        }
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="transition group hover:bg-orange-50/30"
                      >
                        {/* NOTIFICATION */}

                        <td className="px-5 py-4">
                          <div className="flex min-w-[260px] items-start gap-3">
                            <div className="mt-0.5 rounded-xl bg-orange-50 p-2.5 text-orange-500">
                              <Bell className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 truncate">
                                {notification.title || "Notification"}
                              </p>
                              <p className="mt-1 max-w-[280px] truncate text-xs text-gray-400">
                                {notification.message || "No message"}
                              </p>
                              {notification?.offer?.couponCode && (
                                <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-[9px] font-bold text-orange-600">
                                  <Tag className="w-3 h-3" />
                                  {notification.offer.couponCode}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* SOURCE */}

                        <td className="px-4 py-4">
                          <div className="flex flex-col items-start gap-1.5">
                            <SenderBadge notification={notification} />
                            <span className="max-w-[140px] truncate text-[10px] text-gray-400">
                              {getSenderName(notification)}
                            </span>
                          </div>
                        </td>

                        {/* AUDIENCE */}

                        <td className="px-4 py-4">
                          <AudienceBadge notification={notification} />
                        </td>

                        {/* TYPE */}

                        <td className="px-4 py-4">
                          <TypeBadge type={notification.type} />
                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-4">
                          <StatusBadge status={getStatus(notification)} />
                        </td>

                        {/* DATE */}

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 whitespace-nowrap text-xs text-gray-500">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            {formatDate(getNotificationDate(notification))}
                          </div>
                        </td>

                        {/* ACTION */}

                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() =>
                                setSelectedNotification(notification)
                              }
                              title="View details"
                              className="p-2 text-gray-400 transition rounded-lg hover:bg-orange-50 hover:text-orange-600"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              title="Copy notification ID"
                              onClick={() => {
                                if (id)
                                  navigator.clipboard?.writeText(String(id));
                              }}
                              className="p-2 text-gray-400 transition rounded-lg hover:bg-gray-100 hover:text-gray-600"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setSelectedNotification(notification)
                              }
                              title="Open details"
                              className="p-2 text-gray-300 transition rounded-lg group-hover:text-orange-500"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================
          SEND MODAL
      ================================================= */}

      <AnimatePresence>
        {isSendModalOpen && (
          <SendNotificationModal
            onClose={() => setIsSendModalOpen(false)}
            onSend={handleSend}
          />
        )}
      </AnimatePresence>

      {/* =================================================
          DETAIL MODAL
      ================================================= */}

      <AnimatePresence>
        {selectedNotification && (
          <NotificationDetailModal
            notification={selectedNotification}
            onClose={() => setSelectedNotification(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({ label, value, icon: Icon, color = "gray" }) {
  const colors = {
    gray: "bg-gray-50 text-gray-500",
    green: "bg-green-50 text-green-500",
    amber: "bg-amber-50 text-amber-500",
    red: "bg-red-50 text-red-500",
    purple: "bg-purple-50 text-purple-500",
    orange: "bg-orange-50 text-orange-500",
    blue: "bg-blue-50 text-blue-500",
    indigo: "bg-indigo-50 text-indigo-500",
    pink: "bg-pink-50 text-pink-500",
  };

  return (
    <div className="p-4 transition bg-white border border-gray-200 shadow-sm rounded-2xl hover:shadow-md hover:border-orange-100">
      <div className="flex items-center gap-3">
        <div className={`rounded-xl p-2.5 ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-black text-gray-900">{value}</p>
          <p className="truncate text-[11px] font-medium text-gray-400">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   SOURCE CARD
===================================================== */

function SourceCard({ icon: Icon, title, description, count, color }) {
  const colors = {
    orange: "bg-orange-50 text-orange-500",
    purple: "bg-purple-50 text-purple-500",
    blue: "bg-blue-50 text-blue-500",
  };

  return (
    <div className="flex items-center justify-between p-4 transition bg-white border border-gray-200 shadow-sm rounded-2xl hover:shadow-md">
      <div className="flex items-center min-w-0 gap-3">
        <div className={`rounded-xl p-3 ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{title}</p>
          <p className="mt-1 text-xs text-gray-400 truncate">{description}</p>
        </div>
      </div>
      <span className="ml-3 text-xl font-black text-gray-900">{count}</span>
    </div>
  );
}

/* =====================================================
   FILTER GROUP (NEW — cleaner than inline chips)
===================================================== */

function FilterGroup({ label, icon: Icon, options, value, onChange }) {
  return (
    <div className="pt-4 mt-4 border-t border-gray-100">
      <div className="flex items-center gap-2 mb-2.5">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
          {label}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <FilterChip
            key={opt.value || "all"}
            label={opt.label}
            active={value === opt.value}
            onClick={() => onChange(opt.value)}
            color={opt.color}
          />
        ))}
      </div>
    </div>
  );
}

/* =====================================================
   FILTER CHIP
===================================================== */

function FilterChip({ label, active, onClick, color = "gray" }) {
  const colors = {
    gray: {
      normal: "border-gray-200 bg-white text-gray-500 hover:border-gray-300",
      active: "border-gray-300 bg-gray-100 text-gray-700 ring-2 ring-gray-100",
    },
    orange: {
      normal:
        "border-orange-200 bg-white text-orange-500 hover:border-orange-300",
      active:
        "border-orange-300 bg-orange-50 text-orange-600 ring-2 ring-orange-100",
    },
    purple: {
      normal:
        "border-purple-200 bg-white text-purple-500 hover:border-purple-300",
      active:
        "border-purple-300 bg-purple-50 text-purple-600 ring-2 ring-purple-100",
    },
    blue: {
      normal: "border-blue-200 bg-white text-blue-500 hover:border-blue-300",
      active: "border-blue-300 bg-blue-50 text-blue-600 ring-2 ring-blue-100",
    },
    pink: {
      normal: "border-pink-200 bg-white text-pink-500 hover:border-pink-300",
      active: "border-pink-300 bg-pink-50 text-pink-600 ring-2 ring-pink-100",
    },
    red: {
      normal: "border-red-200 bg-white text-red-500 hover:border-red-300",
      active: "border-red-300 bg-red-50 text-red-600 ring-2 ring-red-100",
    },
  };

  const current = colors[color] || colors.gray;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
        active ? current.active : current.normal
      }`}
    >
      {label}
    </button>
  );
}
