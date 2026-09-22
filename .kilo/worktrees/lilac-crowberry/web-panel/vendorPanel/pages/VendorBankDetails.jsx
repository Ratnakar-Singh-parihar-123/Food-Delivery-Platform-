// pages/VendorBankDetails.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  CreditCard,
  QrCode,
  Scan,
  User,
  Mail,
  Phone,
  LoaderCircle,
  AlertCircle,
  Edit2,
  Save,
  X,
  CheckCircle,
  Upload,
  Camera,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  getVendorBankDetailsApi,
  updateVendorBankDetailsApi,
} from "../../src/api/vendorApi";
// If you have react-qr-reader installed, use it; otherwise install:
// npm install react-qr-reader
import { QrReader } from "react-qr-reader";

// ─── Toast System ──────────────────────────────────────────
const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed z-50 flex flex-col w-full max-w-sm gap-2 pointer-events-none top-4 right-4">
    <AnimatePresence>
      {toasts.map((toast) => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className={`pointer-events-auto rounded-xl p-4 shadow-lg border ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-start gap-3">
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// ─── Main Component ──────────────────────────────────────
export default function VendorBankDetails() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bankDetails, setBankDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [formData, setFormData] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
    upiQRCode: null, // image URL or base64
  });
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [qrUploading, setQrUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchBankDetails();
  }, []);

  // ─── Toast helpers ──────────────────────────────────────
  const showToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  };
  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  // ─── Fetch bank details ──────────────────────────────────
  const fetchBankDetails = async () => {
    try {
      setLoading(true);
      const res = await getVendorBankDetailsApi();
      const data = res?.data || res || {};
      setBankDetails(data);
      setFormData({
        accountHolderName: data.accountHolderName || "",
        bankName: data.bankName || "",
        accountNumber: data.accountNumber || "",
        ifscCode: data.ifscCode || "",
        upiId: data.upiId || "",
        upiQRCode: data.upiQRCode || null,
      });
    } catch (error) {
      console.error(error);
      showToast(
        error.response?.data?.message || "Failed to load bank details",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ─── Save bank details ──────────────────────────────────
  const handleSave = async () => {
    // Basic validation
    if (!formData.accountHolderName.trim()) {
      showToast("Account holder name is required", "error");
      return;
    }
    if (!formData.bankName.trim()) {
      showToast("Bank name is required", "error");
      return;
    }
    if (!formData.accountNumber.trim()) {
      showToast("Account number is required", "error");
      return;
    }
    if (!formData.ifscCode.trim()) {
      showToast("IFSC code is required", "error");
      return;
    }
    try {
      setSaving(true);
      await updateVendorBankDetailsApi(formData);
      await fetchBankDetails();
      setIsEditing(false);
      showToast("Bank details updated successfully");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update bank details",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  // ─── UPI QR Scanner ─────────────────────────────────────
  const handleScan = (data) => {
    if (data) {
      // Try to extract UPI ID from QR data
      // Typical UPI QR: "upi://pay?pa=example@upi&pn=..." or "paytm://...", etc.
      let upiId = "";
      try {
        const url = new URL(data);
        if (url.protocol === "upi:") {
          const params = new URLSearchParams(url.search);
          upiId = params.get("pa") || "";
        } else if (data.includes("pa=")) {
          // fallback manual parse
          const match = data.match(/[?&]pa=([^&]+)/);
          if (match) upiId = match[1];
        }
      } catch (e) {
        // If URL parsing fails, try regex
        const match = data.match(/[?&]pa=([^&]+)/);
        if (match) upiId = match[1];
      }
      if (upiId) {
        setFormData((prev) => ({ ...prev, upiId }));
        showToast(`UPI ID scanned: ${upiId}`);
        setQrScannerOpen(false);
      } else {
        showToast("Could not extract UPI ID from QR code", "error");
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
    showToast("Camera error: " + err.message, "error");
  };

  // ─── UPI QR Image Upload ─────────────────────────────────
  const handleQRUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be less than 5MB", "error");
      return;
    }
    setQrUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData((prev) => ({ ...prev, upiQRCode: ev.target.result }));
      setQrUploading(false);
      showToast("QR code uploaded");
    };
    reader.readAsDataURL(file);
    // Clear input
    e.target.value = "";
  };

  // ─── Cancel editing ─────────────────────────────────────
  const cancelEditing = () => {
    setIsEditing(false);
    if (bankDetails) {
      setFormData({
        accountHolderName: bankDetails.accountHolderName || "",
        bankName: bankDetails.bankName || "",
        accountNumber: bankDetails.accountNumber || "",
        ifscCode: bankDetails.ifscCode || "",
        upiId: bankDetails.upiId || "",
        upiQRCode: bankDetails.upiQRCode || null,
      });
    }
  };

  // ─── Loading Skeleton ──────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-4xl px-4 py-8 mx-auto space-y-8">
        <div className="h-40 rounded-3xl bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse" />
        <div className="p-8 space-y-8 bg-white border border-gray-200 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="w-48 h-6 bg-gray-200 rounded animate-pulse" />
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="w-40 h-6 bg-gray-200 rounded animate-pulse" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[1, 2].map((j) => (
                  <div
                    key={j}
                    className="h-12 bg-gray-200 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl px-4 py-8 mx-auto space-y-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* ─── Header ──────────────────────────────────────── */}
      <div className="relative overflow-hidden shadow-xl rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center sm:p-10">
          <div className="space-y-1">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-black text-white sm:text-4xl"
            >
              Bank Details
            </motion.h1>
            <p className="text-sm text-white/80">
              Manage your payment information
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-indigo-600 transition-all bg-white shadow-lg rounded-xl hover:bg-indigo-50 hover:shadow-xl"
              >
                <Edit2 className="w-4 h-4" /> Edit
              </motion.button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 text-sm font-bold text-gray-700 transition-colors bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white transition-all bg-indigo-500 shadow-lg rounded-xl hover:bg-indigo-600 disabled:opacity-50"
                >
                  {saving ? (
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Main Card ────────────────────────────────────── */}
      <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-3xl">
        <div className="p-6 space-y-10 sm:p-10">
          {/* ─── Bank Account Section ─────────────────────── */}
          <Section icon={CreditCard} title="Bank Account">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="Account Holder Name"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleChange}
                disabled={!isEditing}
                icon={User}
                required
              />
              <Field
                label="Bank Name"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                disabled={!isEditing}
                icon={Building2}
                required
              />
              <Field
                label="Account Number"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                disabled={!isEditing}
                icon={CreditCard}
                required
              />
              <Field
                label="IFSC Code"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                disabled={!isEditing}
                icon={Building2}
                required
                placeholder="e.g. SBIN0001234"
              />
            </div>
          </Section>

          {/* ─── UPI Section ──────────────────────────────── */}
          <Section icon={QrCode} title="UPI Details">
            <div className="space-y-4">
              <Field
                label="UPI ID"
                name="upiId"
                value={formData.upiId}
                onChange={handleChange}
                disabled={!isEditing}
                icon={Mail}
                placeholder="example@upi"
              />
              <div className="flex flex-wrap items-center gap-4">
                {isEditing && (
                  <>
                    <button
                      onClick={() => setQrScannerOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white transition-colors bg-green-600 rounded-xl hover:bg-green-700"
                    >
                      <Scan className="w-4 h-4" /> Scan QR
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={qrUploading}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 transition-colors bg-blue-50 rounded-xl hover:bg-blue-100 disabled:opacity-50"
                    >
                      {qrUploading ? (
                        <LoaderCircle className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      Upload QR Code
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleQRUpload}
                      className="hidden"
                    />
                  </>
                )}
                {formData.upiQRCode && (
                  <div className="relative inline-block">
                    <img
                      src={formData.upiQRCode}
                      alt="UPI QR"
                      className="object-contain w-24 h-24 border border-gray-200 rounded-xl"
                    />
                    {isEditing && (
                      <button
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, upiQRCode: null }))
                        }
                        className="absolute -top-2 -right-2 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* ─── QR Scanner Modal ─────────────────────────── */}
          <AnimatePresence>
            {qrScannerOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                onClick={() => setQrScannerOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="relative w-full max-w-md p-4 bg-white shadow-2xl rounded-3xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setQrScannerOpen(false)}
                    className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="mb-4 text-xl font-bold text-center text-gray-800">
                    Scan UPI QR Code
                  </h3>
                  <div className="overflow-hidden rounded-xl aspect-square">
                    <QrReader
                      delay={300}
                      onError={handleError}
                      onScan={handleScan}
                      style={{ width: "100%" }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-center text-gray-500">
                    Position the QR code inside the frame
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Section Component ────────────────────────────────────
function Section({ icon: Icon, title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold tracking-wider text-gray-500 uppercase">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

// ─── Field Component (same as in VendorProfile) ──────────
function Field({
  label,
  name,
  value,
  onChange,
  disabled,
  placeholder,
  type = "text",
  icon: Icon,
  required,
}) {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none top-6">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
      )}
      <label
        htmlFor={name}
        className="block mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className={Icon ? "pl-9" : ""}>
        <input
          id={name}
          name={name}
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
          type={type}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-gray-200 py-2.5 px-4 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${
            disabled
              ? "bg-gray-50 text-gray-500 cursor-not-allowed"
              : "bg-white"
          }`}
        />
      </div>
    </div>
  );
}
