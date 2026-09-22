import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Trash2,
  User,
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

export default function AdminProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // const [admin, setAdmin] = useState(null);

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

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [pageLoading, setPageLoading] = useState(true);

  const [profileLoading, setProfileLoading] = useState(false);

  const [emailLoading, setEmailLoading] = useState(false);

  const [passwordLoading, setPasswordLoading] = useState(false);

  const [imageLoading, setImageLoading] = useState(false);

  const [logoutLoading, setLogoutLoading] = useState(false);

  const [message, setMessage] = useState("");
  const { admin, setAdmin } = useAdmin();
  const [error, setError] = useState("");

  /* ==========================================
     LOAD PROFILE
  ========================================== */

  const fetchProfile = async () => {
    try {
      setPageLoading(true);
      setError("");

      const response = await getAdminProfile();

      const data = response?.data?.admin;

      if (!data) {
        throw new Error("Admin profile not found");
      }

      setAdmin(data);

      setProfileForm({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phone: data.phone || "",
      });

      setEmailForm((previous) => ({
        ...previous,
        email: data.email || "",
      }));
    } catch (err) {
      setError(getApiError(err, "Unable to load admin profile."));
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* ==========================================
     COMMON MESSAGE
  ========================================== */

  const showSuccess = (text) => {
    setError("");
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3500);
  };

  /* ==========================================
     UPDATE PROFILE
  ========================================== */

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    setProfileLoading(true);
    setError("");

    try {
      const response = await updateAdminProfile({
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        phone: profileForm.phone.trim(),
      });

      const updatedAdmin = response?.data?.admin;

      if (updatedAdmin) {
        setAdmin(updatedAdmin);
      }

      showSuccess("Profile updated successfully.");
    } catch (err) {
      setError(getApiError(err, "Unable to update profile."));
    } finally {
      setProfileLoading(false);
    }
  };

  /* ==========================================
     UPDATE EMAIL
  ========================================== */

  const handleEmailSubmit = async (event) => {
    event.preventDefault();

    if (!emailForm.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!emailForm.password) {
      setError("Current password is required to change email.");
      return;
    }

    setEmailLoading(true);
    setError("");

    try {
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

      showSuccess("Email updated successfully.");
    } catch (err) {
      setError(getApiError(err, "Unable to update email."));
    } finally {
      setEmailLoading(false);
    }
  };

  /* ==========================================
     IMAGE UPLOAD
  ========================================== */

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    console.log("SELECTED FILE:", file);
    console.log("NAME:", file.name);
    console.log("TYPE:", file.type);
    console.log("SIZE:", file.size);

    try {
      setImageLoading(true);
      setError("");

      const response = await updateAdminProfileImage(file);

      console.log("UPLOAD RESPONSE:", response);

      const imagePath = response?.data?.profileImage;

      if (imagePath) {
        setAdmin((previous) => ({
          ...previous,
          profileImage: imagePath,
        }));
      }
    } catch (error) {
      console.error("UPLOAD ERROR RESPONSE:", error.response?.data);

      setError(error.response?.data?.message || "Unable to upload image");
    } finally {
      setImageLoading(false);
    }
  };
  /* ==========================================
     DELETE IMAGE
  ========================================== */

  const handleDeleteImage = async () => {
    if (!admin?.profileImage) return;

    const confirmed = window.confirm("Remove your profile image?");

    if (!confirmed) return;

    setImageLoading(true);
    setError("");

    try {
      await deleteAdminProfileImage();

      setAdmin((previous) => ({
        ...previous,
        profileImage: "",
      }));

      showSuccess("Profile image removed successfully.");
    } catch (err) {
      setError(getApiError(err, "Unable to remove profile image."));
    } finally {
      setImageLoading(false);
    }
  };

  /* ==========================================
     CHANGE PASSWORD
  ========================================== */

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setError("All password fields are required.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }

    setPasswordLoading(true);
    setError("");

    try {
      await changeAdminPassword(passwordForm);

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      showSuccess("Password changed successfully.");
    } catch (err) {
      setError(getApiError(err, "Unable to change password."));
    } finally {
      setPasswordLoading(false);
    }
  };

  /* ==========================================
     LOGOUT
  ========================================== */

  const handleLogout = async () => {
    setLogoutLoading(true);

    try {
      await logoutAdmin();
    } catch (err) {
      console.error(err);
    } finally {
      navigate("/admin/login", {
        replace: true,
      });

      setLogoutLoading(false);
    }
  };

  /* ==========================================
     IMAGE URL
  ========================================== */

  const profileImageUrl = admin?.profileImage
    ? `${API_ORIGIN}${admin.profileImage}`
    : null;

  /* ==========================================
     LOADING SCREEN
  ========================================== */

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <LoaderCircle className="mx-auto text-orange-500 h-9 w-9 animate-spin" />

          <p className="mt-3 text-sm font-medium text-gray-500">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 mx-auto max-w-7xl py-7 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
                Admin Account
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950">
                My Profile
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Manage your personal information, security and account settings.
              </p>
            </div>

            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="inline-flex items-center justify-center gap-2 px-5 text-sm font-bold text-red-600 transition border border-red-200 h-11 rounded-xl bg-red-50 hover:bg-red-100 disabled:opacity-60"
            >
              <LogOut className="w-4 h-4" />

              {logoutLoading ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>

      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* ALERTS */}

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-3 mb-6 text-sm font-semibold text-green-700 border border-green-200 rounded-2xl bg-green-50"
          >
            <CheckCircle2 className="w-5 h-5" />

            {message}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 mb-6 text-sm font-semibold text-red-600 border border-red-200 rounded-2xl bg-red-50"
          >
            {error}
          </motion.div>
        )}

        <div className="grid gap-7 lg:grid-cols-[320px_1fr]">
          {/* =========================================
              LEFT PROFILE CARD
          ========================================= */}

          <aside>
            <div className="sticky top-6 overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm">
              <div className="h-28 bg-gradient-to-br from-orange-500 via-orange-500 to-red-500" />

              <div className="px-6 text-center -mt-14 pb-7">
                <div className="relative mx-auto h-28 w-28">
                  <div className="h-28 w-28 overflow-hidden rounded-full border-[5px] border-white bg-orange-50 shadow-xl">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt={admin?.fullName || "Admin"}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-orange-600 bg-orange-100">
                        <User className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageLoading}
                    className="absolute right-0 flex items-center justify-center text-white transition bg-orange-500 border-4 border-white rounded-full shadow-lg bottom-1 h-9 w-9 hover:bg-orange-600 disabled:opacity-50"
                  >
                    {imageLoading ? (
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                <h2 className="mt-4 text-xl font-black text-gray-950">
                  {admin?.fullName ||
                    `${admin?.firstName || ""} ${admin?.lastName || ""}`}
                </h2>

                <p className="mt-1 text-sm text-gray-500">{admin?.email}</p>

                <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600">
                  <ShieldCheck className="w-4 h-4" />

                  {formatRole(admin?.role)}
                </span>

                {admin?.profileImage && (
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    disabled={imageLoading}
                    className="flex items-center gap-2 mx-auto mt-5 text-xs font-bold text-red-500 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove photo
                  </button>
                )}

                <div className="pt-6 space-y-3 text-left border-t border-gray-100 mt-7">
                  <InfoItem
                    icon={Mail}
                    label="Email"
                    value={admin?.email || "Not added"}
                  />

                  <InfoItem
                    icon={Phone}
                    label="Phone"
                    value={admin?.phone || "Not added"}
                  />

                  <InfoItem
                    icon={ShieldCheck}
                    label="Status"
                    value={admin?.isActive ? "Active" : "Disabled"}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* =========================================
              RIGHT CONTENT
          ========================================= */}

          <div className="space-y-7">
            {/* PERSONAL INFORMATION */}

            <Card
              icon={User}
              title="Personal Information"
              description="Update your basic account details."
            >
              <form
                onSubmit={handleProfileSubmit}
                className="grid gap-5 sm:grid-cols-2"
              >
                <FormInput
                  label="First Name"
                  name="firstName"
                  value={profileForm.firstName}
                  onChange={handleProfileChange}
                  placeholder="First name"
                  required
                />

                <FormInput
                  label="Last Name"
                  name="lastName"
                  value={profileForm.lastName}
                  onChange={handleProfileChange}
                  placeholder="Last name"
                />

                <div className="sm:col-span-2">
                  <FormInput
                    label="Phone Number"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    placeholder="+91 9876543210"
                  />
                </div>

                <div className="flex justify-end sm:col-span-2">
                  <SubmitButton loading={profileLoading} label="Save Changes" />
                </div>
              </form>
            </Card>

            {/* EMAIL */}

            <Card
              icon={Mail}
              title="Email Address"
              description="Changing your email requires your current password."
            >
              <form
                onSubmit={handleEmailSubmit}
                className="grid gap-5 sm:grid-cols-2"
              >
                <FormInput
                  label="Email Address"
                  name="email"
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

                <PasswordField
                  label="Current Password"
                  value={emailForm.password}
                  show={showCurrentPassword}
                  setShow={setShowCurrentPassword}
                  onChange={(event) =>
                    setEmailForm((previous) => ({
                      ...previous,
                      password: event.target.value,
                    }))
                  }
                />

                <div className="flex justify-end sm:col-span-2">
                  <SubmitButton loading={emailLoading} label="Update Email" />
                </div>
              </form>
            </Card>

            {/* PASSWORD */}

            <Card
              icon={KeyRound}
              title="Change Password"
              description="Use a strong password that you don't use elsewhere."
            >
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <PasswordField
                  label="Current Password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  show={showCurrentPassword}
                  setShow={setShowCurrentPassword}
                  onChange={handlePasswordChange}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <PasswordField
                    label="New Password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    show={showNewPassword}
                    setShow={setShowNewPassword}
                    onChange={handlePasswordChange}
                  />

                  <PasswordField
                    label="Confirm New Password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    show={showConfirmPassword}
                    setShow={setShowConfirmPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="flex justify-end">
                  <SubmitButton
                    loading={passwordLoading}
                    label="Change Password"
                  />
                </div>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

/* =====================================================
   REUSABLE COMPONENTS
===================================================== */

function Card({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-[26px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex items-start gap-3 pb-5 mb-6 border-b border-gray-100">
        <span className="flex items-center justify-center text-orange-500 h-11 w-11 shrink-0 rounded-xl bg-orange-50">
          <Icon className="w-5 h-5" />
        </span>

        <div>
          <h3 className="font-black text-gray-950">{title}</h3>

          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>

      {children}
    </section>
  );
}

function FormInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="block mb-2 text-sm font-bold text-gray-700">
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 text-sm text-gray-800 transition bg-white border border-gray-200 outline-none h-13 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
      />
    </div>
  );
}

function PasswordField({ label, name, value, onChange, show, setShow }) {
  return (
    <div>
      <label className="block mb-2 text-sm font-bold text-gray-700">
        {label}
      </label>

      <div className="relative">
        <LockKeyhole className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />

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
          onClick={() => setShow((value) => !value)}
          className="absolute text-gray-400 transition -translate-y-1/2 right-4 top-1/2 hover:text-orange-500"
        >
          {show ? (
            <EyeOff className="h-4.5 w-4.5" />
          ) : (
            <Eye className="h-4.5 w-4.5" />
          )}
        </button>
      </div>
    </div>
  );
}

function SubmitButton({ loading, label }) {
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
      className="inline-flex h-12 min-w-[150px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition disabled:cursor-not-allowed disabled:opacity-60"
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

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3">
      <span className="flex items-center justify-center text-gray-500 h-9 w-9 shrink-0 rounded-xl bg-gray-50">
        <Icon className="w-4 h-4" />
      </span>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-semibold text-gray-700">
          {value}
        </p>
      </div>
    </div>
  );
}

function formatRole(role) {
  if (!role) return "Administrator";

  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
