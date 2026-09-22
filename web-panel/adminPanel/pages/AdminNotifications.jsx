import { useEffect, useState } from "react";

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
  MessageSquare,
  CheckCircle2,
  Clock3,
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
    description: "Customers, riders and vendors",
    icon: Globe2,
  },

  {
    value: "customers",
    label: "Customers",
    description: "Send to customer apps",
    icon: Users,
  },

  {
    value: "riders",
    label: "Riders",
    description: "Send to rider apps",
    icon: Bike,
  },

  {
    value: "vendors",
    label: "Vendors",
    description: "Send to vendor panels",
    icon: Store,
  },
];

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
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

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

  return (
    <div className="space-y-7">
      {/* HEADER */}

      <section className="rounded-[28px] border border-orange-100 bg-gradient-to-br from-white via-orange-50/40 to-red-50/30 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="flex items-center justify-center w-12 h-12 text-white shadow-lg rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-100">
            <Bell className="w-5 h-5" />
          </span>

          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-orange-500">
              Communication Center
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950">
              Push Notifications
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Send real-time notifications to customers, riders and business
              partners.
            </p>
          </div>
        </div>
      </section>

      {success && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-green-700 border border-green-200 rounded-2xl bg-green-50">
          <CheckCircle2 className="w-5 h-5" />

          {success}
        </div>
      )}

      {error && (
        <div className="px-4 py-3 text-sm font-bold text-red-600 border border-red-200 rounded-2xl bg-red-50">
          {error}
        </div>
      )}

      <div className="grid gap-7 xl:grid-cols-[1fr_430px]">
        {/* CREATE */}

        <form
          onSubmit={handleSubmit}
          className="rounded-[26px] border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6">
            <h2 className="font-black text-gray-950">Create Notification</h2>

            <p className="mt-1 text-xs text-gray-400">
              Message will be saved and delivered in real time.
            </p>
          </div>

          {/* Audience */}

          <div>
            <label className="text-xs font-bold text-gray-700">Audience</label>

            <div className="grid gap-3 mt-3 sm:grid-cols-2">
              {audiences.map(({ value, label, description, icon: Icon }) => {
                const active = form.audience === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setForm((previous) => ({
                        ...previous,

                        audience: value,
                      }))
                    }
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-orange-300 bg-orange-50 ring-2 ring-orange-500/10"
                        : "border-gray-200 hover:border-orange-200"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        active
                          ? "bg-orange-500 text-white"
                          : "bg-gray-50 text-gray-500"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </span>

                    <div>
                      <p className="text-sm font-bold text-gray-800">{label}</p>

                      <p className="mt-1 text-[10px] text-gray-400">
                        {description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type */}

          <div className="grid gap-5 mt-6 sm:grid-cols-2">
            <Field label="Notification Type">
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full h-12 px-4 text-sm bg-white border border-gray-200 outline-none rounded-xl focus:border-orange-400"
              >
                <option value="general">General</option>

                <option value="promotion">Promotion</option>

                <option value="offer">Offer</option>

                <option value="system">System</option>

                <option value="warning">Warning</option>
              </select>
            </Field>

            <Field label="Priority">
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full h-12 px-4 text-sm bg-white border border-gray-200 outline-none rounded-xl focus:border-orange-400"
              >
                <option value="low">Low</option>

                <option value="normal">Normal</option>

                <option value="high">High</option>

                <option value="urgent">Urgent</option>
              </select>
            </Field>
          </div>

          {/* Title */}

          <div className="mt-5">
            <Field label="Title">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                maxLength={120}
                placeholder="Weekend Special Offer"
                className="w-full h-12 px-4 text-sm border border-gray-200 outline-none rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              />
            </Field>
          </div>

          {/* Message */}

          <div className="mt-5">
            <Field label="Message">
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                maxLength={600}
                rows={5}
                placeholder="Get amazing offers on your favourite food today..."
                className="w-full p-4 text-sm border border-gray-200 outline-none resize-none rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              />

              <p className="mt-1 text-right text-[10px] text-gray-400">
                {form.message.length}
                /600
              </p>
            </Field>
          </div>

          {/* Offer */}

          {(form.type === "promotion" || form.type === "offer") && (
            <div className="p-5 mt-6 border border-orange-100 rounded-2xl bg-orange-50/40">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-orange-500" />

                <p className="text-sm font-black text-gray-800">
                  Offer Details
                </p>
              </div>

              <div className="grid gap-4 mt-4 md:grid-cols-3">
                <Field label="Discount Type">
                  <select
                    name="discountType"
                    value={form.discountType}
                    onChange={handleChange}
                    className="w-full px-3 text-xs bg-white border border-gray-200 outline-none h-11 rounded-xl"
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
                      className="w-full px-3 text-xs bg-white border border-gray-200 outline-none h-11 rounded-xl pr-9"
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
                    className="w-full px-3 text-xs uppercase bg-white border border-gray-200 outline-none h-11 rounded-xl"
                  />
                </Field>
              </div>
            </div>
          )}

          {/* Action */}

          <div className="grid gap-5 mt-6 sm:grid-cols-2">
            <Field label="Button Text">
              <input
                name="actionLabel"
                value={form.actionLabel}
                onChange={handleChange}
                placeholder="Order Now"
                className="w-full h-12 px-4 text-sm border border-gray-200 outline-none rounded-xl focus:border-orange-400"
              />
            </Field>

            <Field label="Action URL">
              <input
                name="actionUrl"
                value={form.actionUrl}
                onChange={handleChange}
                placeholder="/offers"
                className="w-full h-12 px-4 text-sm border border-gray-200 outline-none rounded-xl focus:border-orange-400"
              />
            </Field>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="flex items-center justify-center w-full gap-2 font-bold text-white shadow-lg mt-7 h-13 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-100 disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Notification
              </>
            )}
          </button>
        </form>

        {/* PREVIEW */}

        <aside className="space-y-6">
          <div className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
              Live Preview
            </p>

            <div className="mt-5 rounded-[24px] border border-gray-200 bg-gray-50 p-4">
              <div className="flex gap-3">
                <span className="flex items-center justify-center text-white h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                  <Bell className="w-5 h-5" />
                </span>

                <div>
                  <p className="font-black text-gray-900">
                    {form.title || "Notification Title"}
                  </p>

                  <p className="mt-1 text-sm leading-5 text-gray-500">
                    {form.message ||
                      "Your notification message will appear here."}
                  </p>

                  <p className="mt-3 flex items-center gap-1 text-[10px] text-gray-400">
                    <Clock3 className="w-3 h-3" />
                    Just now
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* HISTORY */}

          <div className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm">
            <div>
              <h3 className="font-black text-gray-950">Recent Notifications</h3>

              <p className="mt-1 text-xs text-gray-400">
                Recently sent messages
              </p>
            </div>

            <div className="mt-4 space-y-2">
              {historyLoading ? (
                <div className="flex justify-center py-10">
                  <LoaderCircle className="w-6 h-6 text-orange-500 animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <p className="py-8 text-xs text-center text-gray-400">
                  No notifications sent yet.
                </p>
              ) : (
                notifications.slice(0, 8).map((notification) => (
                  <div
                    key={notification._id}
                    className="p-3 border border-gray-100 rounded-xl"
                  >
                    <p className="text-xs font-bold text-gray-800">
                      {notification.title}
                    </p>

                    <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-gray-400">
                      {notification.message}
                    </p>

                    <p className="mt-2 text-[9px] text-gray-300">
                      {new Date(notification.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

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
