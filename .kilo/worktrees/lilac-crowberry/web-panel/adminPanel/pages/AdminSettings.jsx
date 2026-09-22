import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
  Bell,
  Camera,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Mail,
  Monitor,
  Moon,
  Phone,
  Save,
  Settings,
  ShieldCheck,
  Smartphone,
  Sun,
  Trash2,
  User,
  XCircle,
} from "lucide-react";

import {
  changeAdminPassword,
  deleteAdminProfileImage,
  getAdminProfile,
  logoutAdmin,
  updateAdminEmail,
  updateAdminProfile,
  updateAdminProfileImage,
} from "../../src/api/adminApi";

import { getApiError } from "../../src/api/getApiError";
import { useAdmin } from "../../src/context/AdminContext";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:9000";

const tabs = [
  {
    id: "account",
    label: "Account",
    description: "Profile and personal details",
    icon: User,
  },
  {
    id: "security",
    label: "Security",
    description: "Password and account security",
    icon: ShieldCheck,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Control admin alerts",
    icon: Bell,
  },
  {
    id: "preferences",
    label: "Preferences",
    description: "Dashboard behaviour",
    icon: Settings,
  },
];

export default function AdminSettings() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { admin, setAdmin, adminLoading, fetchAdmin } = useAdmin();

  const [activeTab, setActiveTab] = useState("account");

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  const [emailForm, setEmailForm] = useState({
    email: "",
    password: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    emailPassword: false,
    current: false,
    new: false,
    confirm: false,
  });

  const [notifications, setNotifications] = useState({
    newOrders: true,
    vendorApplications: true,
    riderKyc: true,
    cancellations: true,
    refunds: true,
    supportTickets: true,
    emailAlerts: true,
    soundAlerts: true,
  });

  const [preferences, setPreferences] = useState({
    compactSidebar: false,
    autoRefreshDashboard: true,
    showRevenueCards: true,
    theme: "light",
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /* =====================================================
     INITIAL DATA
  ====================================================== */

  useEffect(() => {
    if (!admin) return;

    setProfileForm({
      firstName: admin.firstName || "",
      lastName: admin.lastName || "",
      phone: admin.phone || "",
    });

    setEmailForm((previous) => ({
      ...previous,
      email: admin.email || "",
    }));
  }, [admin]);

  /* =====================================================
     LOCAL PREFERENCES
  ====================================================== */

  useEffect(() => {
    try {
      const storedNotifications = localStorage.getItem(
        "admin_notification_settings",
      );

      const storedPreferences = localStorage.getItem(
        "admin_dashboard_preferences",
      );

      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }

      if (storedPreferences) {
        setPreferences(JSON.parse(storedPreferences));
      }
    } catch (error) {
      console.error("Settings loading error:", error);
    }
  }, []);

  /* =====================================================
     ALERT HELPERS
  ====================================================== */

  const showSuccess = (message) => {
    setError("");
    setSuccess(message);

    window.setTimeout(() => {
      setSuccess("");
    }, 3500);
  };

  const showError = (message) => {
    setSuccess("");
    setError(message);
  };

  /* =====================================================
     PROFILE UPDATE
  ====================================================== */

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    if (profileForm.firstName.trim().length < 2) {
      showError("First name must contain at least 2 characters.");
      return;
    }

    try {
      setProfileLoading(true);
      setError("");

      const response = await updateAdminProfile({
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        phone: profileForm.phone.trim(),
      });

      if (response?.data?.admin) {
        setAdmin(response.data.admin);
      } else {
        await fetchAdmin();
      }

      showSuccess("Account information updated successfully.");
    } catch (error) {
      showError(getApiError(error, "Unable to update account information."));
    } finally {
      setProfileLoading(false);
    }
  };

  /* =====================================================
     PROFILE IMAGE
  ====================================================== */

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      showError("Only JPG, PNG and WEBP images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError("Profile image must be smaller than 5 MB.");
      return;
    }

    try {
      setImageLoading(true);
      setError("");

      const response = await updateAdminProfileImage(file);

      const profileImage = response?.data?.profileImage;

      if (profileImage) {
        setAdmin((previous) => ({
          ...previous,
          profileImage,
          updatedAt: new Date().toISOString(),
        }));
      } else {
        await fetchAdmin();
      }

      showSuccess("Profile image updated successfully.");
    } catch (error) {
      showError(getApiError(error, "Unable to update profile image."));
    } finally {
      setImageLoading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteImage = async () => {
    if (!admin?.profileImage) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove your profile image?",
    );

    if (!confirmed) return;

    try {
      setImageLoading(true);
      setError("");

      await deleteAdminProfileImage();

      setAdmin((previous) => ({
        ...previous,
        profileImage: "",
        updatedAt: new Date().toISOString(),
      }));

      showSuccess("Profile image removed successfully.");
    } catch (error) {
      showError(getApiError(error, "Unable to remove profile image."));
    } finally {
      setImageLoading(false);
    }
  };

  /* =====================================================
     EMAIL
  ====================================================== */

  const handleEmailSubmit = async (event) => {
    event.preventDefault();

    if (!emailForm.email.trim()) {
      showError("Email address is required.");
      return;
    }

    if (!emailForm.password) {
      showError("Enter your current password to change email.");
      return;
    }

    try {
      setEmailLoading(true);
      setError("");

      const response = await updateAdminEmail({
        email: emailForm.email.trim(),
        password: emailForm.password,
      });

      if (response?.data?.admin) {
        setAdmin(response.data.admin);
      }

      setEmailForm((previous) => ({
        ...previous,
        password: "",
      }));

      showSuccess("Email address updated successfully.");
    } catch (error) {
      showError(getApiError(error, "Unable to update email address."));
    } finally {
      setEmailLoading(false);
    }
  };

  /* =====================================================
     PASSWORD
  ====================================================== */

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      showError("All password fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      showError("New password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("New password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      showError("New password must be different from current password.");
      return;
    }

    try {
      setPasswordLoading(true);
      setError("");

      await changeAdminPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      showSuccess("Password changed successfully.");
    } catch (error) {
      showError(getApiError(error, "Unable to change password."));
    } finally {
      setPasswordLoading(false);
    }
  };

  /* =====================================================
     NOTIFICATION SETTINGS
  ====================================================== */

  const handleNotificationToggle = (key) => {
    setNotifications((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const saveNotificationSettings = () => {
    localStorage.setItem(
      "admin_notification_settings",
      JSON.stringify(notifications),
    );

    showSuccess("Notification preferences saved.");
  };

  /* =====================================================
     DASHBOARD PREFERENCES
  ====================================================== */

  const handlePreferenceToggle = (key) => {
    setPreferences((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const handleThemeChange = (theme) => {
    setPreferences((previous) => ({
      ...previous,
      theme,
    }));
  };

  const savePreferences = () => {
    localStorage.setItem(
      "admin_dashboard_preferences",
      JSON.stringify(preferences),
    );

    showSuccess("Dashboard preferences saved.");
  };

  /* =====================================================
     LOGOUT
  ====================================================== */

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);

      await logoutAdmin();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAdmin(null);

      navigate("/admin/login", {
        replace: true,
      });

      setLogoutLoading(false);
    }
  };

  /* =====================================================
     DERIVED DATA
  ====================================================== */

  const adminName =
    admin?.fullName ||
    `${admin?.firstName || ""} ${admin?.lastName || ""}`.trim() ||
    "Administrator";

  const profileImageUrl = admin?.profileImage
    ? `${API_ORIGIN}${admin.profileImage}?v=${admin.updatedAt || ""}`
    : null;

  const roleName = formatRole(admin?.role);

  /* =====================================================
     LOADING
  ====================================================== */

  if (adminLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <LoaderCircle className="mx-auto text-orange-500 h-9 w-9 animate-spin" />

          <p className="mt-3 text-sm font-medium text-gray-500">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10 space-y-7">
      {/* =================================================
          PAGE HEADER
      ================================================== */}

      <section className="overflow-hidden rounded-[28px] border border-orange-100 bg-gradient-to-br from-white via-orange-50/40 to-red-50/30 p-6 shadow-sm sm:p-7">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-orange-600">
              <Settings className="h-3.5 w-3.5" />
              Admin Settings
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
              Account & Preferences
            </h1>

            <p className="max-w-2xl mt-2 text-sm leading-6 text-gray-500">
              Manage your administrator account, security settings and dashboard
              preferences.
            </p>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 shadow-sm rounded-2xl">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={adminName}
                className="object-cover h-11 w-11 rounded-xl"
              />
            ) : (
              <div className="flex items-center justify-center font-black text-white h-11 w-11 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                {getInitials(adminName)}
              </div>
            )}

            <div>
              <p className="text-sm font-black text-gray-900">{adminName}</p>

              <p className="text-xs text-gray-400">{roleName}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ALERTS */}

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-green-700 border border-green-200 rounded-2xl bg-green-50"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            {success}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 border border-red-200 rounded-2xl bg-red-50"
          >
            <XCircle className="w-5 h-5 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* =================================================
          LAYOUT
      ================================================== */}

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        {/* =============================
            SETTINGS NAVIGATION
        ============================== */}

        <aside>
          <div className="overflow-hidden rounded-[24px] border border-gray-200 bg-white p-3 shadow-sm xl:sticky xl:top-24">
            <p className="px-3 pb-2 pt-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-gray-400">
              Settings
            </p>

            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setError("");
                      setSuccess("");
                    }}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                      active
                        ? "bg-gradient-to-r from-orange-50 to-red-50 text-orange-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        active
                          ? "bg-white text-orange-500 shadow-sm"
                          : "bg-gray-50 text-gray-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold">{tab.label}</p>

                      <p className="mt-0.5 truncate text-[10px] text-gray-400">
                        {tab.description}
                      </p>
                    </div>

                    <ChevronRight
                      className={`h-4 w-4 ${
                        active ? "text-orange-400" : "text-gray-300"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="my-3 border-t border-gray-100" />

            <button
              type="button"
              disabled={logoutLoading}
              onClick={handleLogout}
              className="flex items-center w-full gap-3 px-3 py-3 text-left text-red-500 transition rounded-xl hover:bg-red-50 disabled:opacity-50"
            >
              <span className="flex items-center justify-center h-9 w-9 rounded-xl bg-red-50">
                {logoutLoading ? (
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
              </span>

              <div>
                <p className="text-sm font-bold">
                  {logoutLoading ? "Logging out..." : "Logout"}
                </p>

                <p className="mt-0.5 text-[10px] text-red-400">
                  End current admin session
                </p>
              </div>
            </button>
          </div>
        </aside>

        {/* =============================
            TAB CONTENT
        ============================== */}

        <div>
          <AnimatePresence mode="wait">
            {activeTab === "account" && (
              <motion.div
                key="account"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-6"
              >
                {/* PROFILE PHOTO */}

                <SettingsCard
                  icon={Camera}
                  title="Profile Photo"
                  description="This photo appears across the admin panel."
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="relative w-24 h-24 shrink-0">
                      {profileImageUrl ? (
                        <img
                          src={profileImageUrl}
                          alt={adminName}
                          className="h-24 w-24 rounded-[24px] border border-gray-200 object-cover shadow-sm"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-[24px] bg-gradient-to-br from-orange-500 to-red-500 text-2xl font-black text-white shadow-lg shadow-orange-100">
                          {getInitials(adminName)}
                        </div>
                      )}

                      {imageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-[24px] bg-black/40">
                          <LoaderCircle className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        Upload new profile image
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-400">
                        JPG, PNG or WEBP. Maximum size 5 MB.
                      </p>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <button
                          type="button"
                          disabled={imageLoading}
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center h-10 gap-2 px-4 text-xs font-bold text-white transition bg-orange-500 rounded-xl hover:bg-orange-600 disabled:opacity-50"
                        >
                          <Camera className="w-4 h-4" />
                          Change Photo
                        </button>

                        {admin?.profileImage && (
                          <button
                            type="button"
                            disabled={imageLoading}
                            onClick={handleDeleteImage}
                            className="inline-flex items-center h-10 gap-2 px-4 text-xs font-bold text-red-600 transition border border-red-200 rounded-xl bg-red-50 hover:bg-red-100 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        )}

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </SettingsCard>

                {/* BASIC DETAILS */}

                <SettingsCard
                  icon={User}
                  title="Personal Information"
                  description="Update your administrator profile details."
                >
                  <form
                    onSubmit={handleProfileSubmit}
                    className="grid gap-5 sm:grid-cols-2"
                  >
                    <TextInput
                      label="First Name"
                      name="firstName"
                      value={profileForm.firstName}
                      onChange={handleProfileChange}
                      placeholder="First name"
                      required
                    />

                    <TextInput
                      label="Last Name"
                      name="lastName"
                      value={profileForm.lastName}
                      onChange={handleProfileChange}
                      placeholder="Last name"
                    />

                    <div className="sm:col-span-2">
                      <TextInput
                        icon={Phone}
                        label="Phone Number"
                        name="phone"
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                        placeholder="+91 9876543210"
                      />
                    </div>

                    <div className="flex justify-end sm:col-span-2">
                      <SaveButton
                        loading={profileLoading}
                        label="Save Profile"
                      />
                    </div>
                  </form>
                </SettingsCard>

                {/* EMAIL */}

                <SettingsCard
                  icon={Mail}
                  title="Email Address"
                  description="Current password is required before changing your login email."
                >
                  <form
                    onSubmit={handleEmailSubmit}
                    className="grid gap-5 md:grid-cols-2"
                  >
                    <TextInput
                      icon={Mail}
                      label="Admin Email"
                      type="email"
                      value={emailForm.email}
                      onChange={(event) =>
                        setEmailForm((previous) => ({
                          ...previous,
                          email: event.target.value,
                        }))
                      }
                      placeholder="admin@example.com"
                    />

                    <PasswordInput
                      label="Current Password"
                      value={emailForm.password}
                      show={showPasswords.emailPassword}
                      onToggle={() =>
                        setShowPasswords((previous) => ({
                          ...previous,
                          emailPassword: !previous.emailPassword,
                        }))
                      }
                      onChange={(event) =>
                        setEmailForm((previous) => ({
                          ...previous,
                          password: event.target.value,
                        }))
                      }
                    />

                    <div className="flex justify-end md:col-span-2">
                      <SaveButton loading={emailLoading} label="Update Email" />
                    </div>
                  </form>
                </SettingsCard>

                {/* ACCOUNT INFO */}

                <SettingsCard
                  icon={ShieldCheck}
                  title="Account Information"
                  description="System managed administrator information."
                >
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <ReadOnlyInfo label="Role" value={roleName} />

                    <ReadOnlyInfo
                      label="Account Status"
                      value={admin?.isActive ? "Active" : "Disabled"}
                      success={admin?.isActive}
                    />

                    <ReadOnlyInfo
                      label="Email Verification"
                      value={
                        admin?.isEmailVerified ? "Verified" : "Not Verified"
                      }
                      success={admin?.isEmailVerified}
                    />

                    <ReadOnlyInfo
                      label="Last Login"
                      value={formatDate(admin?.lastLoginAt)}
                    />
                  </div>
                </SettingsCard>
              </motion.div>
            )}

            {/* =================================================
                SECURITY
            ================================================== */}

            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-6"
              >
                <SettingsCard
                  icon={KeyRound}
                  title="Change Password"
                  description="Choose a strong password you don't use elsewhere."
                >
                  <form onSubmit={handlePasswordSubmit} className="space-y-5">
                    <PasswordInput
                      label="Current Password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      show={showPasswords.current}
                      onToggle={() =>
                        setShowPasswords((previous) => ({
                          ...previous,
                          current: !previous.current,
                        }))
                      }
                      onChange={handlePasswordChange}
                    />

                    <div className="grid gap-5 md:grid-cols-2">
                      <PasswordInput
                        label="New Password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        show={showPasswords.new}
                        onToggle={() =>
                          setShowPasswords((previous) => ({
                            ...previous,
                            new: !previous.new,
                          }))
                        }
                        onChange={handlePasswordChange}
                      />

                      <PasswordInput
                        label="Confirm Password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        show={showPasswords.confirm}
                        onToggle={() =>
                          setShowPasswords((previous) => ({
                            ...previous,
                            confirm: !previous.confirm,
                          }))
                        }
                        onChange={handlePasswordChange}
                      />
                    </div>

                    <PasswordStrength password={passwordForm.newPassword} />

                    <div className="flex justify-end">
                      <SaveButton
                        loading={passwordLoading}
                        label="Change Password"
                      />
                    </div>
                  </form>
                </SettingsCard>

                <SettingsCard
                  icon={LockKeyhole}
                  title="Security Information"
                  description="Information about your administrator account security."
                >
                  <div className="grid gap-4 md:grid-cols-3">
                    <SecurityItem
                      icon={ShieldCheck}
                      label="Account"
                      value={admin?.isActive ? "Protected" : "Disabled"}
                    />

                    <SecurityItem
                      icon={Mail}
                      label="Email"
                      value={
                        admin?.isEmailVerified
                          ? "Verified"
                          : "Verification pending"
                      }
                    />

                    <SecurityItem
                      icon={Smartphone}
                      label="Session"
                      value="HTTP-only authentication"
                    />
                  </div>
                </SettingsCard>
              </motion.div>
            )}

            {/* =================================================
                NOTIFICATIONS
            ================================================== */}

            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-6"
              >
                <SettingsCard
                  icon={Bell}
                  title="Platform Notifications"
                  description="Choose which operational events should notify you."
                >
                  <div className="divide-y divide-gray-100">
                    <ToggleRow
                      label="New Orders"
                      description="Receive notification when a new order is created."
                      checked={notifications.newOrders}
                      onChange={() => handleNotificationToggle("newOrders")}
                    />

                    <ToggleRow
                      label="Vendor Applications"
                      description="Notify when a business applies to join."
                      checked={notifications.vendorApplications}
                      onChange={() =>
                        handleNotificationToggle("vendorApplications")
                      }
                    />

                    <ToggleRow
                      label="Rider KYC"
                      description="Notify when rider verification needs review."
                      checked={notifications.riderKyc}
                      onChange={() => handleNotificationToggle("riderKyc")}
                    />

                    <ToggleRow
                      label="Order Cancellations"
                      description="Receive alerts for cancelled orders."
                      checked={notifications.cancellations}
                      onChange={() => handleNotificationToggle("cancellations")}
                    />

                    <ToggleRow
                      label="Refund Requests"
                      description="Notify when a refund requires attention."
                      checked={notifications.refunds}
                      onChange={() => handleNotificationToggle("refunds")}
                    />

                    <ToggleRow
                      label="Support Tickets"
                      description="Notify for new support tickets."
                      checked={notifications.supportTickets}
                      onChange={() =>
                        handleNotificationToggle("supportTickets")
                      }
                    />
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      type="button"
                      onClick={saveNotificationSettings}
                      className="inline-flex items-center gap-2 px-5 text-sm font-bold text-white h-11 rounded-xl bg-gradient-to-r from-orange-500 to-red-500"
                    >
                      <Save className="w-4 h-4" />
                      Save Notifications
                    </button>
                  </div>
                </SettingsCard>

                <SettingsCard
                  icon={Mail}
                  title="Notification Channels"
                  description="Select how you receive important alerts."
                >
                  <ToggleRow
                    label="Email Alerts"
                    description="Send critical alerts to your registered email."
                    checked={notifications.emailAlerts}
                    onChange={() => handleNotificationToggle("emailAlerts")}
                  />

                  <ToggleRow
                    label="Dashboard Sounds"
                    description="Play a sound for new high-priority events."
                    checked={notifications.soundAlerts}
                    onChange={() => handleNotificationToggle("soundAlerts")}
                  />
                </SettingsCard>
              </motion.div>
            )}

            {/* =================================================
                PREFERENCES
            ================================================== */}

            {activeTab === "preferences" && (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-6"
              >
                <SettingsCard
                  icon={Monitor}
                  title="Appearance"
                  description="Choose how the admin dashboard should look."
                >
                  <div className="grid gap-4 sm:grid-cols-3">
                    <ThemeCard
                      icon={Sun}
                      label="Light"
                      value="light"
                      active={preferences.theme === "light"}
                      onClick={() => handleThemeChange("light")}
                    />

                    <ThemeCard
                      icon={Moon}
                      label="Dark"
                      value="dark"
                      active={preferences.theme === "dark"}
                      onClick={() => handleThemeChange("dark")}
                    />

                    <ThemeCard
                      icon={Monitor}
                      label="System"
                      value="system"
                      active={preferences.theme === "system"}
                      onClick={() => handleThemeChange("system")}
                    />
                  </div>
                </SettingsCard>

                <SettingsCard
                  icon={LayoutDashboard}
                  title="Dashboard Behaviour"
                  description="Configure your admin dashboard experience."
                >
                  <ToggleRow
                    label="Compact Sidebar"
                    description="Use collapsed sidebar when opening dashboard."
                    checked={preferences.compactSidebar}
                    onChange={() => handlePreferenceToggle("compactSidebar")}
                  />

                  <ToggleRow
                    label="Auto Refresh Dashboard"
                    description="Automatically refresh live dashboard statistics."
                    checked={preferences.autoRefreshDashboard}
                    onChange={() =>
                      handlePreferenceToggle("autoRefreshDashboard")
                    }
                  />

                  <ToggleRow
                    label="Show Revenue Cards"
                    description="Display financial KPIs on the dashboard."
                    checked={preferences.showRevenueCards}
                    onChange={() => handlePreferenceToggle("showRevenueCards")}
                  />

                  <div className="flex justify-end mt-6">
                    <button
                      type="button"
                      onClick={savePreferences}
                      className="inline-flex items-center gap-2 px-5 text-sm font-bold text-white h-11 rounded-xl bg-gradient-to-r from-orange-500 to-red-500"
                    >
                      <Save className="w-4 h-4" />
                      Save Preferences
                    </button>
                  </div>
                </SettingsCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   CARD
===================================================== */

function SettingsCard({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3 pb-5 mb-6 border-b border-gray-100">
        <span className="flex items-center justify-center text-orange-500 h-11 w-11 shrink-0 rounded-xl bg-orange-50">
          <Icon className="w-5 h-5" />
        </span>

        <div>
          <h2 className="font-black text-gray-950">{title}</h2>

          <p className="mt-1 text-xs leading-5 text-gray-400">{description}</p>
        </div>
      </div>

      {children}
    </section>
  );
}

/* =====================================================
   TEXT INPUT
===================================================== */

function TextInput({
  icon: Icon,
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}) {
  return (
    <div>
      <label className="block mb-2 text-xs font-bold text-gray-700">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-4 top-1/2" />
        )}

        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`h-13 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 ${
            Icon ? "pl-11" : ""
          }`}
        />
      </div>
    </div>
  );
}

/* =====================================================
   PASSWORD
===================================================== */

function PasswordInput({ label, name, value, onChange, show, onToggle }) {
  return (
    <div>
      <label className="block mb-2 text-xs font-bold text-gray-700">
        {label}
      </label>

      <div className="relative">
        <LockKeyhole className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-4 top-1/2" />

        <input
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          className="w-full text-sm transition bg-white border border-gray-200 outline-none h-13 rounded-xl pl-11 pr-11 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute text-gray-400 transition -translate-y-1/2 right-4 top-1/2 hover:text-orange-500"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

/* =====================================================
   BUTTON
===================================================== */

function SaveButton({ loading, label }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={
        loading
          ? {}
          : {
              y: -1,
            }
      }
      whileTap={
        loading
          ? {}
          : {
              scale: 0.98,
            }
      }
      className="inline-flex h-11 min-w-[155px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 text-sm font-bold text-white shadow-lg shadow-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <LoaderCircle className="w-4 h-4 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Save className="w-4 h-4" />
          {label}
        </>
      )}
    </motion.button>
  );
}

/* =====================================================
   TOGGLE
===================================================== */

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-5 py-4 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-bold text-gray-800">{label}</p>

        <p className="mt-1 text-xs leading-5 text-gray-400">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-orange-500" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

/* =====================================================
   THEME CARD
===================================================== */

function ThemeCard({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        active
          ? "border-orange-300 bg-orange-50 ring-2 ring-orange-500/10"
          : "border-gray-200 bg-white hover:border-orange-200"
      }`}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          active ? "bg-orange-500 text-white" : "bg-gray-50 text-gray-500"
        }`}
      >
        <Icon className="w-5 h-5" />
      </span>

      <p className="mt-3 text-sm font-bold text-gray-800">{label}</p>

      <p className="mt-1 text-[10px] text-gray-400">
        {label} dashboard appearance
      </p>
    </button>
  );
}

/* =====================================================
   READONLY INFO
===================================================== */

function ReadOnlyInfo({ label, value, success }) {
  return (
    <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p
        className={`mt-2 text-sm font-black ${
          success ? "text-green-600" : "text-gray-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* =====================================================
   SECURITY ITEM
===================================================== */

function SecurityItem({ icon: Icon, label, value }) {
  return (
    <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50">
      <span className="flex items-center justify-center text-orange-500 bg-white shadow-sm h-9 w-9 rounded-xl">
        <Icon className="w-4 h-4" />
      </span>

      <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-gray-800">{value}</p>
    </div>
  );
}

/* =====================================================
   PASSWORD STRENGTH
===================================================== */

function PasswordStrength({ password }) {
  if (!password) return null;

  let strength = 0;

  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];

  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className={`h-1.5 rounded-full ${
              item <= strength
                ? strength >= 4
                  ? "bg-green-500"
                  : strength >= 3
                    ? "bg-orange-500"
                    : "bg-red-400"
                : "bg-gray-100"
            }`}
          />
        ))}
      </div>

      <p className="mt-2 text-xs font-semibold text-gray-400">
        Password strength:{" "}
        <span className="text-gray-700">{labels[strength]}</span>
      </p>
    </div>
  );
}

/* =====================================================
   HELPERS
===================================================== */

function formatRole(role) {
  if (!role) return "Administrator";

  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getInitials(name) {
  if (!name) return "A";

  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatDate(date) {
  if (!date) return "Not available";

  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  } catch {
    return "Not available";
  }
}
