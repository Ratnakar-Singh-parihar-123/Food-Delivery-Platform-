import { useEffect, useMemo, useState } from "react";

import {
  Bell,
  Send,
  Users,
  Bike,
  Store,
  Globe2,
  LoaderCircle,
  Tag,
  Percent,
  IndianRupee,
  CheckCircle2,
  Clock3,
  X,
  ExternalLink,
  ChevronRight,
  Megaphone,
  Sparkles,
  MessageSquare,
  ShieldAlert,
  Info,
  CircleDollarSign,
  CalendarDays,
  Layers3,
  UserRound,
} from "lucide-react";

import {
  createAdminNotification,
  getAdminNotificationHistory,
} from "../../src/api/adminApi";

import { getApiError } from "../../src/api/getApiError";

const audiences = [
  {
    value: "all",
    label: "Everyone",
    shortLabel: "Everyone",
    description: "Customers, riders & vendors",
    icon: Globe2,
  },
  {
    value: "customers",
    label: "Customers",
    shortLabel: "Customers",
    description: "Send to customer apps",
    icon: Users,
  },
  {
    value: "riders",
    label: "Riders",
    shortLabel: "Riders",
    description: "Send to rider apps",
    icon: Bike,
  },
  {
    value: "vendors",
    label: "Vendors",
    shortLabel: "Vendors",
    description: "Send to vendor panels",
    icon: Store,
  },
];

const typeConfig = {
  general: {
    label: "General",
    icon: Info,
    className: "bg-blue-50 text-blue-600 border-blue-100",
  },
  promotion: {
    label: "Promotion",
    icon: Megaphone,
    className: "bg-orange-50 text-orange-600 border-orange-100",
  },
  offer: {
    label: "Offer",
    icon: Tag,
    className: "bg-purple-50 text-purple-600 border-purple-100",
  },
  system: {
    label: "System",
    icon: ShieldAlert,
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  warning: {
    label: "Warning",
    icon: ShieldAlert,
    className: "bg-red-50 text-red-600 border-red-100",
  },
};

const priorityConfig = {
  low: {
    label: "Low",
    className: "bg-gray-50 text-gray-500 border-gray-200",
  },
  normal: {
    label: "Normal",
    className: "bg-blue-50 text-blue-600 border-blue-100",
  },
  high: {
    label: "High",
    className: "bg-orange-50 text-orange-600 border-orange-100",
  },
  urgent: {
    label: "Urgent",
    className: "bg-red-50 text-red-600 border-red-100",
  },
};

export default function AdminNotifications() {
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "general",
    audience: "customers",
    priority: "normal",
    discountType: "none",
    discountValue: "",
    couponCode: "",
    actionLabel: "",
    actionUrl: "",
  });

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Selected notification for modal
  const [selectedNotification, setSelectedNotification] = useState(null);

  /* =========================================
     LOAD HISTORY
  ========================================= */

  const loadNotifications = async () => {
    try {
      setHistoryLoading(true);

      const response = await getAdminNotificationHistory();

      setNotifications(response?.data?.notifications || []);
    } catch (error) {
      console.error(error);

      setError(getApiError(error, "Unable to load notification history."));
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  /* =========================================
     CLOSE MODAL WITH ESC
  ========================================= */

  useEffect(() => {
    if (!selectedNotification) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedNotification(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedNotification]);

  /* =========================================
     FORM
  ========================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  /* =========================================
     SEND
  ========================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Notification title is required.");
      return;
    }

    if (!form.message.trim()) {
      setError("Notification message is required.");
      return;
    }

    try {
      setLoading(true);

      setError("");
      setSuccess("");

      const payload = {
        title: form.title.trim(),

        message: form.message.trim(),

        type: form.type,

        audience: form.audience,

        priority: form.priority,

        action: {
          label: form.actionLabel.trim(),
          url: form.actionUrl.trim(),
        },

        offer: {
          discountType: form.discountType,
          discountValue: Number(form.discountValue || 0),
          couponCode: form.couponCode.trim(),
        },
      };

      const response = await createAdminNotification(payload);

      const created = response?.data?.notification;

      if (created) {
        setNotifications((previous) => [created, ...previous]);

        // Automatically show sent notification
        setSelectedNotification(created);
      }

      setSuccess("Notification sent successfully.");

      setForm((previous) => ({
        ...previous,
        title: "",
        message: "",
        discountType: "none",
        discountValue: "",
        couponCode: "",
        actionLabel: "",
        actionUrl: "",
      }));
    } catch (error) {
      setError(getApiError(error, "Unable to send notification."));
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     STATISTICS
  ========================================= */

  const stats = useMemo(() => {
    return {
      total: notifications.length,

      customers: notifications.filter((item) => item.audience === "customers")
        .length,

      riders: notifications.filter((item) => item.audience === "riders").length,

      vendors: notifications.filter((item) => item.audience === "vendors")
        .length,
    };
  }, [notifications]);

  /* =========================================
     AUDIENCE HELPER
  ========================================= */

  const getAudienceConfig = (audience) => {
    return audiences.find((item) => item.value === audience) || audiences[0];
  };

  /* =========================================
     FORMAT DATE
  ========================================= */

  const formatDate = (date) => {
    if (!date) return "Unknown date";

    try {
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown date";
    }
  };

  return (
    <div className="min-h-full pb-10 space-y-7">
      {/* =========================================
          HEADER
      ========================================= */}

      <section className="relative overflow-hidden rounded-[30px] border border-orange-100 bg-gradient-to-br from-white via-orange-50/60 to-red-50/40 p-6 shadow-sm sm:p-7">
        {/* Decorative circles */}

        <div className="absolute w-40 h-40 rounded-full -right-16 -top-16 bg-orange-200/20 blur-2xl" />

        <div className="absolute w-32 h-32 rounded-full -bottom-20 right-20 bg-red-200/20 blur-2xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center text-white shadow-lg w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-200">
              <Bell className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />

                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-orange-500">
                  Communication Center
                </p>
              </div>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
                Push Notifications
              </h1>

              <p className="max-w-2xl mt-2 text-sm leading-6 text-gray-500">
                Create, manage and send real-time notifications to customers,
                riders and business partners.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 shadow-sm rounded-2xl">
            <div className="flex items-center justify-center text-orange-600 w-9 h-9 bg-orange-50 rounded-xl">
              <Send className="w-4 h-4" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Delivery
              </p>

              <p className="text-sm font-black text-gray-800">Real-time</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          STATS
      ========================================= */}

      {/* <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          icon={Bell}
          label="Total Sent"
          value={stats.total}
          description="All notifications"
        />

        <StatCard
          icon={Users}
          label="Customers"
          value={stats.customers}
          description="Customer audience"
        />

        <StatCard
          icon={Bike}
          label="Riders"
          value={stats.riders}
          description="Rider audience"
        />

        <StatCard
          icon={Store}
          label="Vendors"
          value={stats.vendors}
          description="Vendor audience"
        />
      </div> */}

      {/* =========================================
          ALERTS
      ========================================= */}

      {success && (
        <div className="flex items-start gap-3 px-4 py-3.5 text-sm font-bold text-green-700 border border-green-200 rounded-2xl bg-green-50">
          <CheckCircle2 className="w-5 h-5 shrink-0" />

          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="ml-auto text-green-500 transition hover:text-green-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 px-4 py-3.5 text-sm font-bold text-red-600 border border-red-200 rounded-2xl bg-red-50">
          <ShieldAlert className="w-5 h-5 shrink-0" />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto text-red-400 transition hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================
          MAIN GRID
      ========================================= */}

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_430px]">
        {/* =========================================
            CREATE FORM
        ========================================= */}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-[28px]"
        >
          {/* Form header */}

          <div className="px-6 py-5 border-b border-gray-100 sm:px-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-gray-950">
                  Create Notification
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Configure your message before sending it.
                </p>
              </div>

              <div className="flex items-center justify-center w-10 h-10 text-orange-500 bg-orange-50 rounded-xl">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-7">
            {/* =========================================
                AUDIENCE
            ========================================= */}

            <div>
              <SectionHeading
                number="01"
                title="Choose Audience"
                description="Select who should receive this notification."
              />

              <div className="grid gap-3 mt-5 sm:grid-cols-2">
                {audiences.map(({ value, label, description, icon: Icon }) => {
                  const active = form.audience === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setForm((previous) => ({
                          ...previous,
                          audience: value,
                        }));

                        setError("");
                      }}
                      className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 ${
                        active
                          ? "border-orange-300 bg-gradient-to-br from-orange-50 to-red-50/40 shadow-sm ring-2 ring-orange-500/10"
                          : "border-gray-200 bg-white hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-sm"
                      }`}
                    >
                      {active && (
                        <span className="absolute top-0 right-0 w-16 h-16 rounded-full bg-orange-200/20 blur-xl" />
                      )}

                      <span
                        className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                          active
                            ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md shadow-orange-200"
                            : "bg-gray-50 text-gray-500 group-hover:bg-orange-50 group-hover:text-orange-500"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </span>

                      <div className="relative min-w-0">
                        <p className="text-sm font-black text-gray-800">
                          {label}
                        </p>

                        <p className="mt-1 text-[10px] leading-4 text-gray-400">
                          {description}
                        </p>
                      </div>

                      {active && (
                        <CheckCircle2 className="relative w-5 h-5 ml-auto text-orange-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* =========================================
                TYPE & PRIORITY
            ========================================= */}

            <div className="border-t border-gray-100 pt-7 mt-7">
              <SectionHeading
                number="02"
                title="Notification Settings"
                description="Choose the type and urgency of your message."
              />

              <div className="grid gap-5 mt-5 sm:grid-cols-2">
                <Field label="Notification Type">
                  <div className="relative">
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full h-12 px-4 pr-10 text-sm font-medium bg-white border border-gray-200 outline-none appearance-none rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                    >
                      <option value="general">General</option>
                      <option value="promotion">Promotion</option>
                      <option value="offer">Offer</option>
                      <option value="system">System</option>
                      <option value="warning">Warning</option>
                    </select>

                    <ChevronRight className="absolute w-4 h-4 text-gray-400 rotate-90 -translate-y-1/2 pointer-events-none right-4 top-1/2" />
                  </div>
                </Field>

                <Field label="Priority">
                  <div className="relative">
                    <select
                      name="priority"
                      value={form.priority}
                      onChange={handleChange}
                      className="w-full h-12 px-4 pr-10 text-sm font-medium bg-white border border-gray-200 outline-none appearance-none rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>

                    <ChevronRight className="absolute w-4 h-4 text-gray-400 rotate-90 -translate-y-1/2 pointer-events-none right-4 top-1/2" />
                  </div>
                </Field>
              </div>
            </div>

            {/* =========================================
                CONTENT
            ========================================= */}

            <div className="border-t border-gray-100 pt-7 mt-7">
              <SectionHeading
                number="03"
                title="Notification Content"
                description="Write a clear title and message for your audience."
              />

              <div className="mt-5">
                <Field label="Title">
                  <div className="relative">
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      maxLength={120}
                      placeholder="Weekend Special Offer"
                      className="w-full h-12 px-4 pr-16 text-sm font-medium border border-gray-200 outline-none rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                    />

                    <span className="absolute text-[10px] text-gray-300 -translate-y-1/2 right-4 top-1/2">
                      {form.title.length}/120
                    </span>
                  </div>
                </Field>
              </div>

              <div className="mt-5">
                <Field label="Message">
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    maxLength={600}
                    rows={5}
                    placeholder="Get amazing offers on your favourite food today..."
                    className="w-full p-4 text-sm leading-6 border border-gray-200 outline-none resize-none rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                  />

                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-gray-400">
                      Keep your message short and clear.
                    </span>

                    <span className="text-[10px] font-medium text-gray-400">
                      {form.message.length}/600
                    </span>
                  </div>
                </Field>
              </div>
            </div>

            {/* =========================================
                OFFER
            ========================================= */}

            {(form.type === "promotion" || form.type === "offer") && (
              <div className="p-5 border border-orange-100 mt-7 rounded-2xl bg-gradient-to-br from-orange-50/70 to-red-50/30">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center text-orange-600 bg-white shadow-sm w-9 h-9 rounded-xl">
                    <Tag className="w-4 h-4" />
                  </span>

                  <div>
                    <p className="text-sm font-black text-gray-800">
                      Offer Details
                    </p>

                    <p className="text-[10px] text-gray-400">
                      Add discount and coupon information.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 mt-5 md:grid-cols-3">
                  <Field label="Discount Type">
                    <select
                      name="discountType"
                      value={form.discountType}
                      onChange={handleChange}
                      className="w-full px-3 text-xs font-medium bg-white border border-gray-200 outline-none h-11 rounded-xl focus:border-orange-400"
                    >
                      <option value="none">None</option>
                      <option value="percentage">Percentage</option>
                      <option value="flat">Flat</option>
                    </select>
                  </Field>

                  <Field label="Discount">
                    <div className="relative">
                      <input
                        name="discountValue"
                        type="number"
                        min="0"
                        value={form.discountValue}
                        onChange={handleChange}
                        placeholder="30"
                        className="w-full px-3 pr-10 text-xs font-medium bg-white border border-gray-200 outline-none h-11 rounded-xl focus:border-orange-400"
                      />

                      {form.discountType === "percentage" ? (
                        <Percent className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                      ) : (
                        <IndianRupee className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                      )}
                    </div>
                  </Field>

                  <Field label="Coupon Code">
                    <input
                      name="couponCode"
                      value={form.couponCode}
                      onChange={handleChange}
                      placeholder="FOOD30"
                      className="w-full px-3 text-xs font-bold uppercase bg-white border border-gray-200 outline-none h-11 rounded-xl focus:border-orange-400"
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* =========================================
                ACTION
            ========================================= */}

            <div className="border-t border-gray-100 pt-7 mt-7">
              <SectionHeading
                number="04"
                title="Call To Action"
                description="Optionally add a button and destination."
              />

              <div className="grid gap-5 mt-5 sm:grid-cols-2">
                <Field label="Button Text">
                  <input
                    name="actionLabel"
                    value={form.actionLabel}
                    onChange={handleChange}
                    placeholder="Order Now"
                    className="w-full h-12 px-4 text-sm font-medium border border-gray-200 outline-none rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                  />
                </Field>

                <Field label="Action URL">
                  <input
                    name="actionUrl"
                    value={form.actionUrl}
                    onChange={handleChange}
                    placeholder="/offers"
                    className="w-full h-12 px-4 text-sm font-medium border border-gray-200 outline-none rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                  />
                </Field>
              </div>
            </div>

            {/* =========================================
                SEND BUTTON
            ========================================= */}

            <button
              disabled={loading}
              type="submit"
              className="flex items-center justify-center w-full gap-2 mt-8 font-black text-white transition-all duration-200 shadow-lg h-14 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-500 to-red-500 shadow-orange-100 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <LoaderCircle className="w-5 h-5 animate-spin" />
                  Sending Notification...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Notification
                </>
              )}
            </button>
          </div>
        </form>

        {/* =========================================
            RIGHT SIDEBAR
        ========================================= */}

        <aside className="space-y-6">
          {/* =========================================
              LIVE PREVIEW
          ========================================= */}

          <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-[28px]">
            <div className="px-5 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-orange-500">
                    Live Preview
                  </p>

                  <h3 className="mt-1 text-lg font-black text-gray-950">
                    Notification
                  </h3>
                </div>

                <span className="flex items-center gap-1.5 px-2.5 py-1.5 text-[9px] font-bold text-green-600 bg-green-50 border border-green-100 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  LIVE
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="relative overflow-hidden rounded-[24px] border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm">
                <div className="absolute w-20 h-20 bg-orange-100 rounded-full -right-8 -top-8 blur-2xl" />

                <div className="relative flex gap-3">
                  <span className="flex items-center justify-center text-white shadow-md h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                    <Bell className="w-5 h-5" />
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-black text-gray-900 break-words">
                        {form.title || "Notification Title"}
                      </p>

                      <span
                        className={`px-2 py-0.5 text-[8px] font-bold uppercase border rounded-full ${
                          priorityConfig[form.priority]?.className
                        }`}
                      >
                        {form.priority}
                      </span>
                    </div>

                    <p className="mt-1 text-sm leading-5 text-gray-500 break-words">
                      {form.message ||
                        "Your notification message will appear here."}
                    </p>

                    {form.actionLabel && (
                      <button
                        type="button"
                        className="px-3 py-2 mt-3 text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 rounded-lg"
                      >
                        {form.actionLabel}
                      </button>
                    )}

                    <p className="mt-3 flex items-center gap-1 text-[10px] text-gray-400">
                      <Clock3 className="w-3 h-3" />
                      Just now
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <PreviewInfo
                  icon={Users}
                  label="Audience"
                  value={getAudienceConfig(form.audience).shortLabel}
                />

                <PreviewInfo
                  icon={Layers3}
                  label="Type"
                  value={typeConfig[form.type]?.label || "General"}
                />
              </div>
            </div>
          </div>

          {/* =========================================
              HISTORY
          ========================================= */}

          <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-[28px]">
            <div className="px-5 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-gray-950">
                    Recent Notifications
                  </h3>

                  <p className="mt-1 text-xs text-gray-400">
                    Click any notification to view full details.
                  </p>
                </div>

                <span className="flex items-center justify-center text-orange-500 w-9 h-9 bg-orange-50 rounded-xl">
                  <Clock3 className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className="p-4">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-50 rounded-2xl">
                    <LoaderCircle className="w-6 h-6 text-orange-500 animate-spin" />
                  </div>

                  <p className="mt-3 text-xs font-medium text-gray-400">
                    Loading notifications...
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="flex items-center justify-center mx-auto text-gray-400 w-14 h-14 bg-gray-50 rounded-2xl">
                    <Bell className="w-6 h-6" />
                  </div>

                  <p className="mt-4 text-sm font-bold text-gray-700">
                    No notifications yet
                  </p>

                  <p className="max-w-[220px] mx-auto mt-1 text-[11px] leading-5 text-gray-400">
                    Your sent notifications will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {notifications.slice(0, 8).map((notification) => {
                    const audienceConfig = getAudienceConfig(
                      notification.audience,
                    );

                    const AudienceIcon = audienceConfig.icon;

                    const notificationType =
                      typeConfig[notification.type] || typeConfig.general;

                    const TypeIcon = notificationType.icon;

                    return (
                      <button
                        key={notification._id}
                        type="button"
                        onClick={() => setSelectedNotification(notification)}
                        className="group w-full p-3.5 text-left transition-all duration-200 border border-gray-100 rounded-2xl hover:border-orange-200 hover:bg-orange-50/30 hover:-translate-y-0.5 hover:shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-10 h-10 text-orange-500 bg-orange-50 rounded-xl shrink-0">
                            <Bell className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-black text-gray-800 truncate">
                                {notification.title || "Untitled Notification"}
                              </p>

                              <ChevronRight className="w-4 h-4 text-gray-300 transition-transform shrink-0 group-hover:translate-x-0.5 group-hover:text-orange-400" />
                            </div>

                            <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-gray-400">
                              {notification.message || "No message available."}
                            </p>

                            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 text-[8px] font-bold border rounded-full ${notificationType.className}`}
                              >
                                <TypeIcon className="w-2.5 h-2.5" />

                                {notificationType.label}
                              </span>

                              <span className="inline-flex items-center gap-1 px-2 py-1 text-[8px] font-bold text-gray-500 bg-gray-50 border border-gray-100 rounded-full">
                                <AudienceIcon className="w-2.5 h-2.5" />

                                {audienceConfig.shortLabel}
                              </span>
                            </div>

                            <p className="flex items-center gap-1 mt-2 text-[9px] text-gray-300">
                              <Clock3 className="w-3 h-3" />

                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {notifications.length > 8 && (
              <div className="px-5 py-3 text-center border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400">
                  Showing latest 8 notifications
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* =========================================
          NOTIFICATION DETAIL MODAL
      ========================================= */}

      {selectedNotification && (
        <NotificationDetailsModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
          getAudienceConfig={getAudienceConfig}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({ icon: Icon, label, value, description }) {
  return (
    <div className="group relative overflow-hidden p-5 bg-white border border-gray-200 shadow-sm rounded-[22px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute w-20 h-20 transition-opacity bg-orange-100 rounded-full opacity-0 -right-8 -top-8 blur-2xl group-hover:opacity-100" />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-gray-950">
            {value}
          </p>

          <p className="mt-1 text-[10px] text-gray-400">{description}</p>
        </div>

        <div className="flex items-center justify-center text-orange-500 transition-colors w-11 h-11 bg-orange-50 rounded-xl group-hover:bg-orange-500 group-hover:text-white">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   SECTION HEADING
===================================================== */

function SectionHeading({ number, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex items-center justify-center w-8 h-8 text-[10px] font-black text-orange-600 bg-orange-50 border border-orange-100 rounded-lg shrink-0">
        {number}
      </span>

      <div>
        <h3 className="text-sm font-black text-gray-900">{title}</h3>

        <p className="mt-0.5 text-[10px] text-gray-400">{description}</p>
      </div>
    </div>
  );
}

/* =====================================================
   FIELD
===================================================== */

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block mb-2 text-xs font-bold text-gray-700">
        {label}
      </span>

      {children}
    </label>
  );
}

/* =====================================================
   PREVIEW INFO
===================================================== */

function PreviewInfo({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 p-3 border border-gray-100 bg-gray-50/70 rounded-xl">
      <div className="flex items-center justify-center w-8 h-8 text-gray-500 bg-white rounded-lg shadow-sm">
        <Icon className="w-3.5 h-3.5" />
      </div>

      <div className="min-w-0">
        <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">
          {label}
        </p>

        <p className="mt-0.5 text-[10px] font-black text-gray-700 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =====================================================
   NOTIFICATION DETAILS MODAL
===================================================== */

function NotificationDetailsModal({
  notification,
  onClose,
  getAudienceConfig,
  formatDate,
}) {
  const audienceConfig = getAudienceConfig(notification.audience);

  const AudienceIcon = audienceConfig.icon;

  const notificationType = typeConfig[notification.type] || typeConfig.general;

  const TypeIcon = notificationType.icon;

  const priority =
    priorityConfig[notification.priority] || priorityConfig.normal;

  const offer = notification.offer || {};

  const action = notification.action || {};

  const hasOffer = offer.discountType && offer.discountType !== "none";

  const hasAction = action.label || action.url;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Notification details"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Backdrop */}

      <div className="absolute inset-0 bg-gray-950/50 backdrop-blur-sm animate-[fadeIn_180ms_ease-out]" />

      {/* Modal */}

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white shadow-2xl rounded-[30px] animate-[modalIn_220ms_ease-out]">
        {/* Header */}

        <div className="relative px-6 py-6 overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-red-500 sm:px-7">
          <div className="absolute w-40 h-40 bg-white rounded-full -right-16 -top-20 opacity-10 blur-2xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center text-white bg-white/15 backdrop-blur-sm w-14 h-14 rounded-2xl">
                <Bell className="w-6 h-6" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-orange-100">
                  Notification Details
                </p>

                <h2 className="mt-2 text-xl font-black text-white break-words sm:text-2xl">
                  {notification.title || "Untitled Notification"}
                </h2>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[9px] font-bold text-white rounded-full bg-white/15">
                    <TypeIcon className="w-3 h-3" />

                    {notificationType.label}
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[9px] font-bold text-white rounded-full bg-white/15">
                    <AudienceIcon className="w-3 h-3" />

                    {audienceConfig.label}
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[9px] font-bold text-white rounded-full bg-white/15">
                    {priority.label} priority
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center text-white transition w-9 h-9 shrink-0 rounded-xl bg-white/10 hover:bg-white/20"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}

        <div className="max-h-[calc(90vh-190px)] overflow-y-auto p-6 sm:p-7">
          {/* Message */}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-orange-500" />

              <h3 className="text-xs font-black tracking-wide text-gray-900 uppercase">
                Message
              </h3>
            </div>

            <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/70">
              <p className="text-sm leading-6 text-gray-600 whitespace-pre-wrap">
                {notification.message || "No message available."}
              </p>
            </div>
          </div>

          {/* Meta */}

          <div className="grid gap-3 mt-6 sm:grid-cols-3">
            <DetailBox
              icon={AudienceIcon}
              label="Audience"
              value={audienceConfig.label}
            />

            <DetailBox
              icon={TypeIcon}
              label="Type"
              value={notificationType.label}
            />

            <DetailBox
              icon={ShieldAlert}
              label="Priority"
              value={priority.label}
            />
          </div>

          {/* Offer */}

          {hasOffer && (
            <div className="p-5 mt-6 border border-orange-100 rounded-2xl bg-orange-50/50">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center text-orange-600 bg-white shadow-sm w-9 h-9 rounded-xl">
                  <Tag className="w-4 h-4" />
                </div>

                <div>
                  <h3 className="text-sm font-black text-gray-900">
                    Offer Details
                  </h3>

                  <p className="text-[10px] text-gray-400">
                    Promotional information attached to this notification.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 mt-4 sm:grid-cols-3">
                <DetailBox
                  icon={
                    offer.discountType === "percentage" ? Percent : IndianRupee
                  }
                  label="Discount"
                  value={
                    offer.discountValue
                      ? offer.discountType === "percentage"
                        ? `${offer.discountValue}%`
                        : `₹${offer.discountValue}`
                      : "Not specified"
                  }
                />

                <DetailBox
                  icon={Tag}
                  label="Discount Type"
                  value={
                    offer.discountType === "percentage"
                      ? "Percentage"
                      : offer.discountType === "flat"
                        ? "Flat"
                        : "None"
                  }
                />

                <DetailBox
                  icon={CircleDollarSign}
                  label="Coupon Code"
                  value={offer.couponCode || "No coupon"}
                />
              </div>
            </div>
          )}

          {/* Action */}

          {hasAction && (
            <div className="p-5 mt-6 border border-blue-100 rounded-2xl bg-blue-50/50">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center text-blue-600 bg-white shadow-sm w-9 h-9 rounded-xl">
                  <ExternalLink className="w-4 h-4" />
                </div>

                <div>
                  <h3 className="text-sm font-black text-gray-900">
                    Call To Action
                  </h3>

                  <p className="text-[10px] text-gray-400">
                    Action shown to the notification recipient.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 mt-4 sm:grid-cols-2">
                <DetailBox
                  icon={MessageSquare}
                  label="Button Text"
                  value={action.label || "Not specified"}
                />

                <DetailBox
                  icon={ExternalLink}
                  label="Action URL"
                  value={action.url || "Not specified"}
                />
              </div>
            </div>
          )}

          {/* Date */}

          <div className="flex items-center gap-3 p-4 mt-6 border border-gray-100 rounded-2xl">
            <div className="flex items-center justify-center w-10 h-10 text-gray-500 bg-gray-50 rounded-xl">
              <CalendarDays className="w-4 h-4" />
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                Sent On
              </p>

              <p className="mt-1 text-xs font-black text-gray-700">
                {formatDate(notification.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}

        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 sm:px-7">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />

            <span className="text-[10px] font-bold text-gray-400">
              Notification created successfully
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-black text-white transition rounded-xl bg-gray-900 hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   DETAIL BOX
===================================================== */

function DetailBox({ icon: Icon, label, value }) {
  return (
    <div className="p-3.5 bg-white border border-gray-100 rounded-xl">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-gray-400" />

        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
          {label}
        </p>
      </div>

      <p className="mt-2 text-xs font-black text-gray-800 break-words">
        {value}
      </p>
    </div>
  );
}
