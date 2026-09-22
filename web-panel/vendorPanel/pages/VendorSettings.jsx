import { useState } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Key,
  LogOut,
  Bell,
  BellOff,
  Mail,
  MailMinus,
  AlertCircle,
  CheckCircle,
  LoaderCircle,
  Save,
  X,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom"; // if using react-router
import {
  logoutVendorApi,
  // changePasswordApi – add your actual import
} from "../../src/api/vendorApi";

// ─── Toast System (same as profile) ──────────────────────
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed z-50 flex flex-col w-full max-w-sm gap-2 pointer-events-none top-4 right-4">
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
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────
export default function VendorSettings() {
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);

  // ─── Password state ────────────────────────────────────
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  // ─── Notification preferences ──────────────────────────
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
  });

  // ─── Toast helpers ──────────────────────────────────────
  const showToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ─── Handle password change ────────────────────────────
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    // Clear error for that field
    setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    try {
      setLoading(true);
      // Replace with actual API call
      // await changePasswordApi({
      //   currentPassword: passwordData.currentPassword,
      //   newPassword: passwordData.newPassword,
      // });
      // Mock success
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showToast("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to change password",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Handle logout ──────────────────────────────────────
  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        await logoutVendorApi();
        // Redirect to login or home
        navigate("/vendor/login");
        showToast("Logged out successfully");
      } catch (error) {
        showToast("Failed to logout", "error");
      }
    }
  };

  // ─── Toggle notification preferences ──────────────────
  const toggleNotification = (type) => {
    setNotifications((prev) => ({ ...prev, [type]: !prev[type] }));
    showToast(
      `${type === "email" ? "Email" : "Push"} notifications ${notifications[type] ? "disabled" : "enabled"}`,
    );
  };

  return (
    <div className="max-w-5xl px-4 py-8 mx-auto space-y-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* ─── Header ──────────────────────────────────────── */}
      <div className="relative overflow-hidden shadow-md rounded-3xl bg-gradient-to-br from-orange-100 via-orange-50 to-white">
        <div className="absolute w-64 h-64 rounded-full -top-24 -right-24 bg-orange-300/30 blur-3xl" />
        <div className="absolute w-64 h-64 rounded-full -bottom-24 -left-24 bg-orange-400/20 blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center sm:p-8 backdrop-blur-sm">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-gray-900 sm:text-3xl"
            >
              Settings
            </motion.h1>
            <p className="text-sm text-gray-600">
              Manage your account preferences and security
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* ─── Settings Cards ──────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ─── Change Password Card ──────────────────────── */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
            <div className="p-6 space-y-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="p-2 text-orange-500 rounded-lg bg-orange-50">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Change Password
                </h2>
              </div>

              <form onSubmit={handleSubmitPassword} className="space-y-5">
                <div>
                  <label className="block mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Current Password
                  </label>
                  <div className="relative">
                    <Key className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
                    />
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-xs text-red-500">
                      {passwordErrors.currentPassword}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                        className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
                      />
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-xs text-red-500">
                        {passwordErrors.newPassword}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                        className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
                      />
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-500">
                        {passwordErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white transition-all bg-orange-500 shadow-md rounded-xl hover:bg-orange-600 hover:shadow-lg disabled:opacity-50"
                  >
                    {loading ? (
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* ─── Notification Preferences ────────────────── */}
        <div className="lg:col-span-1">
          <div className="h-full overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
            <div className="p-6 space-y-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="p-2 text-blue-500 rounded-lg bg-blue-50">
                  <Bell className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Notifications
                </h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-700">
                      Email Notifications
                    </span>
                  </div>
                  <button
                    onClick={() => toggleNotification("email")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.email ? "bg-orange-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.email ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-700">
                      Push Notifications
                    </span>
                  </div>
                  <button
                    onClick={() => toggleNotification("push")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.push ? "bg-orange-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.push ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Account Actions ──────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="h-full overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
            <div className="p-6 space-y-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="p-2 text-red-500 rounded-lg bg-red-50">
                  <LogOut className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Account</h2>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-bold text-red-600 transition-colors border border-red-200 rounded-xl hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
                {/* Uncomment when delete account API is available */}
                {/* <button
                  onClick={() => showToast("Delete account not implemented yet", "error")}
                  className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-bold text-gray-500 transition-colors border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  <AlertCircle className="w-4 h-4" />
                  Delete Account
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Note ─────────────────────────────────────────── */}
      <div className="text-xs text-center text-gray-400">
        <p>
          Password change and notification preferences are saved locally for
          demo purposes.
        </p>
        <p>Replace the mock API calls with your actual endpoints.</p>
      </div>
    </div>
  );
}
