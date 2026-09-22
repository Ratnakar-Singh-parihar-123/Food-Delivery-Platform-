import {
  Bell,
  Store,
  LoaderCircle,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useVendor } from "../../src/context/VendorContext";
import { updateVendorOnlineStatusApi } from "../../src/api/vendorApi";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ─── Helper: Build full image URL ──────────────────────────
const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const baseUrl = import.meta.env.VITE_API_BASE || "http://localhost:9000";
  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${baseUrl}${path}`;
};

export default function VendorTopbar() {
  const { vendor, setVendor, loading } = useVendor();
  const [imageError, setImageError] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // ─── Close dropdown on outside click ─────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 border-b shadow-sm border-gray-200/60 bg-white/80 backdrop-blur-md">
        <div>
          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-20 h-3 mt-2 bg-gray-100 rounded animate-pulse" />
        </div>
        <LoaderCircle className="w-5 h-5 text-orange-500 animate-spin" />
      </header>
    );
  }

  if (!vendor) {
    return (
      <header className="sticky top-0 z-30 flex items-center h-16 px-6 border-b shadow-sm border-gray-200/60 bg-white/80 backdrop-blur-md">
        <p className="text-sm font-semibold text-gray-500">
          Vendor account not loaded
        </p>
      </header>
    );
  }

  const toggleStore = async () => {
    try {
      const nextStatus = !vendor.isOnline;
      const response = await updateVendorOnlineStatusApi(nextStatus);
      setVendor((previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          isOnline: response?.data?.isOnline ?? nextStatus,
          acceptingOrders: response?.data?.acceptingOrders ?? nextStatus,
        };
      });
    } catch (error) {
      console.error(
        "VENDOR ONLINE STATUS ERROR:",
        error?.response?.data || error,
      );
    }
  };

  // ─── Get profile image ──────────────────────────────────
  const getProfileImage = () => {
    if (vendor.profileImage && !imageError) {
      const url = buildImageUrl(vendor.profileImage);
      if (url) return url;
    }
    const name = encodeURIComponent(vendor.businessName || "Vendor");
    return `https://ui-avatars.com/api/?name=${name}&background=f97316&color=fff&size=40`;
  };

  const profileImage = getProfileImage();

  // ─── Handle logout (placeholder) ──────────────────────
  const handleLogout = () => {
    // Implement logout logic (clear context, redirect)
    navigate("/vendor/login");
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 border-b shadow-sm h-18 sm:px-6 border-gray-200/60 bg-white/80 backdrop-blur-md">
      {/* LEFT */}
      <div className="flex items-center min-w-0 gap-3">
        <div className="hidden sm:block">
          <p className="text-xs font-medium text-gray-400">Vendor Panel</p>
          <p className="text-sm font-black text-gray-900 truncate max-w-[200px]">
            {vendor.businessName || "Vendor Business"}
          </p>
        </div>
        <div className="sm:hidden">
          <p className="text-sm font-black text-gray-900 truncate max-w-[120px]">
            {vendor.businessName || "Vendor"}
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* ONLINE STATUS TOGGLE */}
        <button
          type="button"
          onClick={toggleStore}
          disabled={vendor.approvalStatus !== "approved"}
          className={`relative flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
            vendor.isOnline
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-200"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              vendor.isOnline ? "bg-white animate-pulse" : "bg-gray-400"
            }`}
          />
          {vendor.isOnline ? "Open" : "Closed"}
        </button>

        {/* NOTIFICATION */}
        <button
          type="button"
          className="relative p-2 text-gray-500 transition rounded-xl hover:bg-gray-100 hover:text-gray-700"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
        </button>

        {/* PROFILE DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 pr-3 transition rounded-xl hover:bg-gray-100/80"
          >
            <img
              src={profileImage}
              alt={vendor.businessName || "Vendor"}
              className="object-cover border-2 border-white shadow-sm h-9 w-9 rounded-xl"
              onError={() => setImageError(true)}
            />
            <div className="hidden text-left md:block">
              <p className="max-w-[120px] truncate text-xs font-bold text-gray-800">
                {vendor.businessName}
              </p>
              <p className="text-[10px] capitalize text-gray-400">
                {vendor.approvalStatus || "pending"}
              </p>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 z-50 w-56 mt-2 overflow-hidden border shadow-xl bg-white/95 backdrop-blur-md border-gray-200/60 rounded-2xl"
              >
                <div className="p-4 border-b border-gray-100/80">
                  <div className="flex items-center gap-3">
                    <img
                      src={profileImage}
                      alt={vendor.businessName}
                      className="object-cover border-2 border-orange-200 h-11 w-11 rounded-xl"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {vendor.businessName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {vendor.email}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 inline-flex rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold text-orange-600">
                    {vendor.approvalStatus || "Pending"}
                  </div>
                </div>

                <div className="p-2">
                  <Link
                    to="/vendor/profile"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    Profile
                  </Link>
                  <Link
                    to="/vendor/settings"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    Settings
                  </Link>
                </div>

                <div className="p-2 border-t border-gray-100/80">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
