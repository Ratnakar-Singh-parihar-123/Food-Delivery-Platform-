import { useEffect, useRef, useState } from "react";

import {
  Image as ImageIcon,
  Plus,
  Upload,
  LoaderCircle,
  Trash2,
  Pencil,
  Smartphone,
  Bike,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  EyeOff,
  X,
  Save,
  Utensils, // <-- NEW: icon for Tiffin House
} from "lucide-react";

import {
  createAdminBanner,
  deleteAdminBanner,
  getAdminBanners,
  toggleAdminBanner,
  updateAdminBanner,
} from "../../src/api/adminApi";

import { getApiError } from "../../src/api/getApiError";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:9000";

const initialForm = {
  title: "",
  subtitle: "",
  target: "customer",
  type: "general",
  actionLabel: "",
  actionUrl: "",
  couponCode: "",
  sortOrder: "0",
  startAt: "",
  endAt: "",
  isActive: true,
};

export default function AdminBanners() {
  const fileRef = useRef(null);

  const [banners, setBanners] = useState([]);

  const [filter, setFilter] = useState("customer"); // can be "customer", "rider", "tiffin"

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [editingBanner, setEditingBanner] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [file, setFile] = useState(null);

  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /* ==========================================
     LOAD
  ========================================== */

  const loadBanners = async () => {
    try {
      setLoading(true);

      const response = await getAdminBanners({
        target: filter,
        search,
      });

      setBanners(response?.data?.banners || []);
    } catch (error) {
      setError(getApiError(error, "Unable to load banners"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, [filter]);

  /* ==========================================
     FORM
  ========================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFile = (event) => {
    const selected = event.target.files?.[0];

    if (!selected) return;

    setFile(selected);

    setPreview(URL.createObjectURL(selected));
  };

  const openCreate = () => {
    setEditingBanner(null);

    setForm({
      ...initialForm,
      target: filter,
    });

    setFile(null);
    setPreview("");
    setError("");
    setModalOpen(true);
  };

  const openEdit = (banner) => {
    setEditingBanner(banner);

    setForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      target: banner.target || "customer",
      type: banner.type || "general",
      actionLabel: banner.action?.label || "",
      actionUrl: banner.action?.url || "",
      couponCode: banner.couponCode || "",
      sortOrder: String(banner.sortOrder || 0),
      startAt: toInputDate(banner.startAt),
      endAt: toInputDate(banner.endAt),
      isActive: banner.isActive,
    });

    setFile(null);

    setPreview(banner.image ? `${API_ORIGIN}${banner.image}` : "");

    setModalOpen(true);
  };

  /* ==========================================
     SAVE
  ========================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Banner title is required.");
      return;
    }

    if (!editingBanner && !file) {
      setError("Please select banner image.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (file) {
        data.append("image", file);
      }

      if (editingBanner) {
        await updateAdminBanner(editingBanner._id, data);

        setSuccess("Banner updated successfully.");
      } else {
        await createAdminBanner(data);

        setSuccess("Banner created successfully.");
      }

      setModalOpen(false);

      await loadBanners();
    } catch (error) {
      setError(getApiError(error, "Unable to save banner."));
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================
     DELETE
  ========================================== */

  const handleDelete = async (banner) => {
    const confirmed = window.confirm(`Delete "${banner.title}"?`);

    if (!confirmed) return;

    try {
      await deleteAdminBanner(banner._id);

      setBanners((previous) =>
        previous.filter((item) => item._id !== banner._id),
      );
    } catch (error) {
      setError(getApiError(error, "Unable to delete banner."));
    }
  };

  /* ==========================================
     TOGGLE
  ========================================== */

  const handleToggle = async (banner) => {
    try {
      const response = await toggleAdminBanner(banner._id);

      setBanners((previous) =>
        previous.map((item) =>
          item._id === banner._id
            ? {
                ...item,
                isActive: response?.data?.isActive,
              }
            : item,
        ),
      );
    } catch (error) {
      setError(getApiError(error, "Unable to update banner."));
    }
  };

  // Helper to get display label for target
  const getTargetLabel = (target) => {
    const map = {
      customer: "Customer App",
      rider: "Rider App",
      tiffin: "Tiffin House",
    };
    return map[target] || target;
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <section className="rounded-[28px] border border-orange-100 bg-gradient-to-br from-white via-orange-50/50 to-red-50/30 p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
              <ImageIcon className="h-3.5 w-3.5" />
              Banner Management
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-950">
              App Banners
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage promotional and informational banners for customer, rider,
              and tiffin apps.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 px-5 text-sm font-bold text-white shadow-lg h-11 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-100"
          >
            <Plus className="w-4 h-4" />
            Create Banner
          </button>
        </div>
      </section>

      {/* TABS */}

      <div className="flex gap-2 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm">
        <TabButton
          active={filter === "customer"}
          icon={Smartphone}
          label="Customer App"
          onClick={() => setFilter("customer")}
        />

        <TabButton
          active={filter === "rider"}
          icon={Bike}
          label="Rider App"
          onClick={() => setFilter("rider")}
        />

        {/* NEW TAB for Tiffin House */}
        <TabButton
          active={filter === "tiffin"}
          icon={Utensils}
          label="Tiffin House"
          onClick={() => setFilter("tiffin")}
        />
      </div>

      {/* SEARCH */}

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-4 top-1/2" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                loadBanners();
              }
            }}
            placeholder="Search banners..."
            className="w-full pr-4 text-sm border border-gray-200 outline-none h-11 rounded-xl pl-11 focus:border-orange-400"
          />
        </div>

        <button
          onClick={loadBanners}
          className="px-5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl"
        >
          Search
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-green-700 border border-green-200 rounded-xl bg-green-50">
          <CheckCircle2 className="w-4 h-4" />
          {success}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-600 border border-red-200 rounded-xl bg-red-50">
          <XCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* CONTENT */}

      {loading ? (
        <div className="flex min-h-[350px] items-center justify-center">
          <LoaderCircle className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : banners.length === 0 ? (
        <EmptyState onCreate={openCreate} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {banners.map((banner) => (
            <BannerCard
              key={banner._id}
              banner={banner}
              onEdit={() => openEdit(banner)}
              onDelete={() => handleDelete(banner)}
              onToggle={() => handleToggle(banner)}
            />
          ))}
        </div>
      )}

      {/* MODAL */}

      {modalOpen && (
        <BannerModal
          form={form}
          setForm={setForm}
          handleChange={handleChange}
          handleFile={handleFile}
          preview={preview}
          fileRef={fileRef}
          editing={Boolean(editingBanner)}
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
   BANNER CARD
===================================================== */

function BannerCard({ banner, onEdit, onDelete, onToggle }) {
  // Helper to get display label for target
  const getTargetLabel = (target) => {
    const map = {
      customer: "Customer App",
      rider: "Rider App",
      tiffin: "Tiffin House",
    };
    return map[target] || target;
  };

  return (
    <div className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[16/7] overflow-hidden bg-gray-100">
        <img
          src={`${API_ORIGIN}${banner.image}`}
          alt={banner.title}
          className="object-cover w-full h-full"
        />

        <div className="absolute left-3 top-3">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
              banner.isActive
                ? "bg-green-500 text-white"
                : "bg-gray-900/70 text-white"
            }`}
          >
            {banner.isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>

        <span className="absolute right-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-bold capitalize text-white backdrop-blur">
          {getTargetLabel(banner.target)} {/* updated to show friendly label */}
        </span>
      </div>

      <div className="p-4">
        <div className="flex justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-black text-gray-900 truncate">
              {banner.title}
            </h3>

            <p className="mt-1 text-xs leading-5 text-gray-400 line-clamp-2">
              {banner.subtitle || "No subtitle"}
            </p>
          </div>

          <span className="shrink-0 rounded-lg bg-orange-50 px-2 py-1 text-[10px] font-bold capitalize text-orange-600">
            {banner.type}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
          <p className="text-[10px] font-semibold text-gray-400">
            Sort: {banner.sortOrder}
          </p>

          <div className="flex gap-1">
            <button
              onClick={onToggle}
              className="flex items-center justify-center w-8 h-8 text-gray-400 rounded-lg hover:bg-orange-50 hover:text-orange-600"
            >
              {banner.isActive ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={onEdit}
              className="flex items-center justify-center w-8 h-8 text-gray-400 rounded-lg hover:bg-blue-50 hover:text-blue-600"
            >
              <Pencil className="w-4 h-4" />
            </button>

            <button
              onClick={onDelete}
              className="flex items-center justify-center w-8 h-8 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   MODAL
===================================================== */

function BannerModal({
  form,
  setForm,
  handleChange,
  handleFile,
  preview,
  fileRef,
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
              {editing ? "Edit Banner" : "Create Banner"}
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Configure app banner details.
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
          {/* IMAGE */}

          <div>
            <p className="mb-2 text-xs font-bold text-gray-700">Banner Image</p>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative flex aspect-[16/6] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50"
            >
              {preview ? (
                <img src={preview} className="object-cover w-full h-full" />
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto text-orange-500 h-7 w-7" />

                  <p className="mt-2 text-xs font-bold text-gray-600">
                    Upload banner
                  </p>

                  <p className="mt-1 text-[10px] text-gray-400">
                    JPG, PNG or WEBP
                  </p>
                </div>
              )}
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFile}
              className="hidden"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
            />

            <Select
              label="Target App"
              name="target"
              value={form.target}
              onChange={handleChange}
              options={[
                ["customer", "Customer App"],
                ["rider", "Rider App"],
                ["tiffin", "Tiffin House"], // NEW option
              ]}
            />
          </div>

          <Input
            label="Subtitle"
            name="subtitle"
            value={form.subtitle}
            onChange={handleChange}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Select
              label="Banner Type"
              name="type"
              value={form.type}
              onChange={handleChange}
              options={[
                ["general", "General"],
                ["promotion", "Promotion"],
                ["offer", "Offer"],
                ["announcement", "Announcement"],
                ["campaign", "Campaign"],
              ]}
            />

            <Input
              label="Sort Order"
              name="sortOrder"
              type="number"
              value={form.sortOrder}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Button Label"
              name="actionLabel"
              value={form.actionLabel}
              onChange={handleChange}
              placeholder="Order Now"
            />

            <Input
              label="Action URL"
              name="actionUrl"
              value={form.actionUrl}
              onChange={handleChange}
              placeholder="/offers"
            />
          </div>

          <Input
            label="Coupon Code"
            name="couponCode"
            value={form.couponCode}
            onChange={handleChange}
            placeholder="FOOD30"
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Start Date"
              name="startAt"
              type="datetime-local"
              value={form.startAt}
              onChange={handleChange}
            />

            <Input
              label="End Date"
              name="endAt"
              type="datetime-local"
              value={form.endAt}
              onChange={handleChange}
            />
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  isActive: event.target.checked,
                }))
              }
            />

            <span className="text-sm font-bold text-gray-700">
              Banner Active
            </span>
          </label>

          {error && (
            <p className="px-4 py-3 text-xs font-bold text-red-600 rounded-xl bg-red-50">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center w-full h-12 gap-2 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-orange-500 to-red-500 disabled:opacity-60"
          >
            {saving ? (
              <>
                <LoaderCircle className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {editing ? "Update Banner" : "Create Banner"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function TabButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
        active ? "bg-orange-500 text-white" : "text-gray-500 hover:bg-gray-50"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
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
        className="w-full h-12 px-4 text-sm border border-gray-200 outline-none rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
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

function EmptyState({ onCreate }) {
  return (
    <div className="rounded-[28px] border border-dashed border-gray-300 bg-white py-20 text-center">
      <ImageIcon className="w-10 h-10 mx-auto text-gray-300" />

      <h3 className="mt-4 font-black text-gray-800">No banners yet</h3>

      <p className="mt-2 text-sm text-gray-400">
        Create your first app banner.
      </p>

      <button
        onClick={onCreate}
        className="mt-5 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white"
      >
        Create Banner
      </button>
    </div>
  );
}

function toInputDate(date) {
  if (!date) {
    return "";
  }

  const parsed = new Date(date);

  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);

  return local.toISOString().slice(0, 16);
}
