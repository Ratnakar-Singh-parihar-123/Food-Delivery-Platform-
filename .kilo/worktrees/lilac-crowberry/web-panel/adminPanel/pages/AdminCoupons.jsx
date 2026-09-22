import { useEffect, useState } from "react";

import {
  Tag,
  Plus,
  Search,
  Percent,
  IndianRupee,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  X,
  Save,
  LoaderCircle,
  CheckCircle2,
  XCircle,
  TicketPercent,
  CalendarDays,
  Users,
} from "lucide-react";

import {
  createAdminCoupon,
  deleteAdminCoupon,
  getAdminCoupons,
  toggleAdminCoupon,
  updateAdminCoupon,
} from "../../src/api/adminApi";

import { getApiError } from "../../src/api/getApiError";

const initialForm = {
  code: "",
  title: "",
  description: "",

  scope: "platform",
  vendor: "",

  discountType: "percentage",

  discountValue: "",

  maxDiscount: "",

  minimumOrderAmount: "",

  totalUsageLimit: "",

  perCustomerLimit: "1",

  firstOrderOnly: false,

  startsAt: "",

  expiresAt: "",

  isActive: true,
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const [editingCoupon, setEditingCoupon] = useState(null);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [form, setForm] = useState(initialForm);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /* ==========================================
     LOAD
  ========================================== */

  const loadCoupons = async () => {
    try {
      setLoading(true);

      const response = await getAdminCoupons({
        search,
        status,
      });

      setCoupons(response?.data?.coupons || []);
    } catch (error) {
      setError(getApiError(error, "Unable to load coupons"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, [status]);

  /* ==========================================
     FORM
  ========================================== */

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,

      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openCreate = () => {
    setEditingCoupon(null);

    setForm(initialForm);

    setError("");

    setModalOpen(true);
  };

  const openEdit = (coupon) => {
    setEditingCoupon(coupon);

    setForm({
      code: coupon.code,

      title: coupon.title,

      description: coupon.description || "",

      scope: coupon.scope,

      vendor: coupon.vendor?._id || coupon.vendor || "",

      discountType: coupon.discountType,

      discountValue: String(coupon.discountValue),

      maxDiscount: coupon.maxDiscount ?? "",

      minimumOrderAmount: String(coupon.minimumOrderAmount || ""),

      totalUsageLimit: coupon.totalUsageLimit ?? "",

      perCustomerLimit: String(coupon.perCustomerLimit || 1),

      firstOrderOnly: coupon.firstOrderOnly,

      startsAt: toDateInput(coupon.startsAt),

      expiresAt: toDateInput(coupon.expiresAt),

      isActive: coupon.isActive,
    });

    setModalOpen(true);
  };

  /* ==========================================
     SUBMIT
  ========================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.code.trim()) {
      setError("Coupon code is required.");
      return;
    }

    if (!form.title.trim()) {
      setError("Coupon title is required.");
      return;
    }

    if (!form.expiresAt) {
      setError("Expiry date is required.");
      return;
    }

    const payload = {
      ...form,

      code: form.code.trim().toUpperCase(),

      discountValue: Number(form.discountValue),

      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,

      minimumOrderAmount: Number(form.minimumOrderAmount || 0),

      totalUsageLimit: form.totalUsageLimit
        ? Number(form.totalUsageLimit)
        : null,

      perCustomerLimit: Number(form.perCustomerLimit || 1),

      vendor: form.scope === "vendor" ? form.vendor : null,
    };

    try {
      setSaving(true);

      setError("");

      if (editingCoupon) {
        await updateAdminCoupon(editingCoupon._id, payload);

        setSuccess("Coupon updated successfully.");
      } else {
        await createAdminCoupon(payload);

        setSuccess("Coupon created successfully.");
      }

      setModalOpen(false);

      await loadCoupons();
    } catch (error) {
      setError(getApiError(error, "Unable to save coupon."));
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================
     TOGGLE
  ========================================== */

  const handleToggle = async (coupon) => {
    try {
      const response = await toggleAdminCoupon(coupon._id);

      setCoupons((previous) =>
        previous.map((item) =>
          item._id === coupon._id
            ? {
                ...item,

                isActive: response?.data?.isActive,
              }
            : item,
        ),
      );
    } catch (error) {
      setError(getApiError(error));
    }
  };

  /* ==========================================
     DELETE
  ========================================== */

  const handleDelete = async (coupon) => {
    const confirmed = window.confirm(`Delete coupon ${coupon.code}?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteAdminCoupon(coupon._id);

      setCoupons((previous) =>
        previous.filter((item) => item._id !== coupon._id),
      );
    } catch (error) {
      setError(getApiError(error));
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <section className="rounded-[28px] border border-orange-100 bg-gradient-to-br from-white via-orange-50/50 to-red-50/30 p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
              <TicketPercent className="w-4 h-4" />
              Marketing
            </span>

            <h1 className="mt-4 text-3xl font-black text-gray-950">Coupons</h1>

            <p className="mt-2 text-sm text-gray-500">
              Create and manage platform and vendor discount coupons.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 px-5 text-sm font-bold text-white shadow-lg h-11 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-100"
          >
            <Plus className="w-4 h-4" />
            Create Coupon
          </button>
        </div>
      </section>

      {/* FILTER */}

      <section className="flex flex-col gap-3 p-4 bg-white border border-gray-200 shadow-sm rounded-2xl sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-4 top-1/2" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                loadCoupons();
              }
            }}
            placeholder="Search code or coupon..."
            className="w-full pr-4 text-sm border border-gray-200 outline-none h-11 rounded-xl pl-11 focus:border-orange-400"
          />
        </div>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="px-4 text-sm bg-white border border-gray-200 h-11 rounded-xl"
        >
          <option value="">All Status</option>

          <option value="active">Active</option>

          <option value="inactive">Inactive</option>

          <option value="expired">Expired</option>
        </select>

        <button
          onClick={loadCoupons}
          className="px-5 text-sm font-bold border border-gray-200 h-11 rounded-xl"
        >
          Search
        </button>
      </section>

      {success && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-green-700 border border-green-200 rounded-xl bg-green-50">
          <CheckCircle2 className="w-4 h-4" />

          {success}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 border border-red-200 rounded-xl bg-red-50">
          <XCircle className="w-4 h-4" />

          {error}
        </div>
      )}

      {/* COUPONS */}

      {loading ? (
        <div className="flex min-h-[350px] items-center justify-center">
          <LoaderCircle className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-gray-300 bg-white py-20 text-center">
          <Tag className="w-10 h-10 mx-auto text-gray-300" />

          <h3 className="mt-4 font-black text-gray-800">No coupons found</h3>

          <button
            onClick={openCreate}
            className="mt-5 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white"
          >
            Create Coupon
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {coupons.map((coupon) => (
            <CouponCard
              key={coupon._id}
              coupon={coupon}
              onEdit={() => openEdit(coupon)}
              onToggle={() => handleToggle(coupon)}
              onDelete={() => handleDelete(coupon)}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <CouponModal
          form={form}
          handleChange={handleChange}
          editing={Boolean(editingCoupon)}
          saving={saving}
          error={error}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

/* =====================================================
   COUPON CARD
===================================================== */

function CouponCard({ coupon, onEdit, onToggle, onDelete }) {
  const expired = new Date(coupon.expiresAt) < new Date();

  return (
    <div className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="p-5 border-b border-gray-200 border-dashed bg-gradient-to-br from-orange-50 to-red-50">
        <div className="flex justify-between">
          <span className="rounded-lg bg-white px-3 py-1.5 font-mono text-sm font-black tracking-wider text-orange-600 shadow-sm">
            {coupon.code}
          </span>

          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
              expired
                ? "bg-red-100 text-red-600"
                : coupon.isActive
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-500"
            }`}
          >
            {expired ? "EXPIRED" : coupon.isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>

        <p className="mt-5 text-3xl font-black text-gray-950">
          {coupon.discountType === "percentage"
            ? `${coupon.discountValue}% OFF`
            : `₹${coupon.discountValue} OFF`}
        </p>

        <p className="mt-1 text-sm font-bold text-gray-700">{coupon.title}</p>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-3">
          <SmallInfo
            icon={IndianRupee}
            label="Min Order"
            value={`₹${coupon.minimumOrderAmount || 0}`}
          />

          <SmallInfo
            icon={Users}
            label="Used"
            value={`${coupon.usedCount}${
              coupon.totalUsageLimit ? `/${coupon.totalUsageLimit}` : ""
            }`}
          />

          <SmallInfo
            icon={CalendarDays}
            label="Expires"
            value={new Date(coupon.expiresAt).toLocaleDateString("en-IN")}
          />

          <SmallInfo
            icon={Tag}
            label="Scope"
            value={coupon.scope === "vendor" ? "Vendor" : "Platform"}
          />
        </div>

        <div className="flex justify-end gap-1 pt-4 mt-5 border-t border-gray-100">
          <button
            onClick={onToggle}
            className="p-2 text-gray-400 rounded-lg hover:bg-orange-50 hover:text-orange-600"
          >
            {coupon.isActive ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={onEdit}
            className="p-2 text-gray-400 rounded-lg hover:bg-blue-50 hover:text-blue-600"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            onClick={onDelete}
            className="p-2 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   MODAL
===================================================== */

function CouponModal({
  form,
  handleChange,
  editing,
  saving,
  error,
  onClose,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-white border-b border-gray-100">
          <div>
            <h2 className="text-xl font-black text-gray-950">
              {editing ? "Edit Coupon" : "Create Coupon"}
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Configure coupon discount and usage rules.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 rounded-xl hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Coupon Code"
              name="code"
              value={form.code}
              onChange={handleChange}
              disabled={editing}
              placeholder="FOOD30"
            />

            <Input
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Weekend Special"
            />
          </div>

          <Input
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Select
              label="Scope"
              name="scope"
              value={form.scope}
              onChange={handleChange}
              options={[
                ["platform", "Platform Wide"],

                ["vendor", "Specific Vendor"],
              ]}
            />

            {form.scope === "vendor" && (
              <Input
                label="Vendor ID"
                name="vendor"
                value={form.vendor}
                onChange={handleChange}
                placeholder="MongoDB Vendor ID"
              />
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <Select
              label="Discount Type"
              name="discountType"
              value={form.discountType}
              onChange={handleChange}
              options={[
                ["percentage", "Percentage"],

                ["flat", "Flat Amount"],
              ]}
            />

            <Input
              label="Discount Value"
              name="discountValue"
              type="number"
              value={form.discountValue}
              onChange={handleChange}
            />

            <Input
              label="Max Discount"
              name="maxDiscount"
              type="number"
              value={form.maxDiscount}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <Input
              label="Minimum Order"
              name="minimumOrderAmount"
              type="number"
              value={form.minimumOrderAmount}
              onChange={handleChange}
            />

            <Input
              label="Total Usage Limit"
              name="totalUsageLimit"
              type="number"
              value={form.totalUsageLimit}
              onChange={handleChange}
            />

            <Input
              label="Per Customer Limit"
              name="perCustomerLimit"
              type="number"
              value={form.perCustomerLimit}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Starts At"
              name="startsAt"
              type="datetime-local"
              value={form.startsAt}
              onChange={handleChange}
            />

            <Input
              label="Expires At"
              name="expiresAt"
              type="datetime-local"
              value={form.expiresAt}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-wrap gap-6 p-4 rounded-2xl bg-gray-50">
            <Checkbox
              name="firstOrderOnly"
              checked={form.firstOrderOnly}
              onChange={handleChange}
              label="First order only"
            />

            <Checkbox
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              label="Active"
            />
          </div>

          {error && (
            <div className="px-4 py-3 text-xs font-bold text-red-600 border border-red-200 rounded-xl bg-red-50">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center w-full h-12 gap-2 text-sm font-bold text-white shadow-lg rounded-xl bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-100 disabled:opacity-60"
          >
            {saving ? (
              <>
                <LoaderCircle className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />

                {editing ? "Update Coupon" : "Create Coupon"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="block mb-2 text-xs font-bold text-gray-700">
        {label}
      </span>

      <input
        {...props}
        className="w-full h-12 px-4 text-sm border border-gray-200 outline-none rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 disabled:bg-gray-100"
      />
    </label>
  );
}

function Select({ label, options, ...props }) {
  return (
    <label className="block">
      <span className="block mb-2 text-xs font-bold text-gray-700">
        {label}
      </span>

      <select
        {...props}
        className="w-full h-12 px-4 text-sm bg-white border border-gray-200 outline-none rounded-xl focus:border-orange-400"
      >
        {options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Checkbox({ label, ...props }) {
  return (
    <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
      <input type="checkbox" {...props} />

      {label}
    </label>
  );
}

function SmallInfo({ icon: Icon, label, value }) {
  return (
    <div className="p-3 rounded-xl bg-gray-50">
      <Icon className="w-4 h-4 text-orange-500" />

      <p className="mt-2 text-[9px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-xs font-black text-gray-800 truncate">{value}</p>
    </div>
  );
}

function toDateInput(value) {
  if (!value) return "";

  const date = new Date(value);

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  return local.toISOString().slice(0, 16);
}
