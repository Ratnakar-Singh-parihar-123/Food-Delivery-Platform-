import {
  LayoutDashboard,
  ShoppingBag,
  Clock3,
  Utensils,
  Bell,
  Store,
  Settings,
  LogOut,
  NetworkIcon,
  Star,
  LifeBuoy,
  ChevronDown,
  CatIcon,
  ShieldCheck,
  Sparkles,
  Award,
  BadgeIndianRupee,
  ChevronRight,
  LoaderCircle,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useVendor } from "../../src/context/VendorContext";
import { FaTruckPickup } from "react-icons/fa6";
import { useState } from "react";
import brandLogo from "../../src/assets/logo/MainBrandLogo.png";

// ─── Helper: Build full image URL ──────────────────────────
const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const baseUrl = import.meta.env.VITE_STATIC_BASE || "http://localhost:9000";
  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${baseUrl}${path}`;
};

// ─── Helper: Get default avatar URL ────────────────────────
const getDefaultAvatar = (name) => {
  const encoded = encodeURIComponent(name || "Vendor");
  return `https://ui-avatars.com/api/?name=${encoded}&background=ff5a1f&color=fff&size=48&font-size=0.5&bold=true`;
};

// ─── Menu Configuration ──────────────────────────────────────
const menuGroups = [
  {
    label: "Overview",
    icon: Sparkles,
    items: [
      { path: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Orders",
    icon: ShoppingBag,
    items: [
      { path: "/vendor/new/orders", label: "Live Orders", icon: NetworkIcon },
      { path: "/vendor/all/orders", label: "All Orders", icon: ShoppingBag },
      { path: "/vendor/preparing", label: "Preparing", icon: Clock3 },
      {
        path: "/vendor/ready/and/pickup",
        label: "Ready to Pickup",
        icon: FaTruckPickup,
      },
    ],
  },
  {
    label: "Management",
    icon: Utensils,
    items: [
      {
        path: "/vendor/add/categories",
        label: "Add Categories",
        icon: CatIcon,
      },
      { path: "/vendor/menu", label: "Menu", icon: Utensils },
      { path: "/vendor/popular/foods", label: "Popular Foods", icon: Award },
      { path: "/vendor/notifications", label: "Notifications", icon: Bell },
      { path: "/vendor/earnings", label: "Earnings", icon: BadgeIndianRupee },
      { path: "/vendor/reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    label: "Account",
    icon: ShieldCheck,
    items: [
      { path: "/vendor/profile", label: "Business Profile", icon: Store },
      { path: "/vendor/support", label: "Support", icon: LifeBuoy },
      { path: "/vendor/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function VendorSidebar({
  isMobile,
  mobileOpen,
  setMobileOpen,
  isOpen, // ← now a prop
  onToggle, // ← now a prop
}) {
  const navigate = useNavigate();
  const { vendor, logout, vendorLoading } = useVendor();

  // Local state for grouped expansion
  const [expandedGroups, setExpandedGroups] = useState(
    menuGroups.map(() => true),
  );
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const toggleGroup = (index) => {
    setExpandedGroups((prev) =>
      prev.map((val, i) => (i === index ? !val : val)),
    );
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await logout();
    } catch (error) {
      console.error("Vendor logout error:", error);
    } finally {
      setLogoutLoading(false);
      navigate("/vendor/login");
    }
  };

  // ─── Image URL ────────────────────────────────────────────
  const getImageUrl = () => {
    if (vendor?.profileImage && !imageError) {
      const url = buildImageUrl(vendor.profileImage);
      if (url) return url;
    }
    return getDefaultAvatar(vendor?.businessName);
  };

  const getInitials = () => {
    if (!vendor?.businessName) return "V";
    return vendor.businessName
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  };

  const imageUrl = getImageUrl();
  const isOnline = vendor?.isActive !== false;

  // ─── Determine if sidebar is visually expanded ────────────
  const sidebarExpanded = isMobile ? true : isOpen;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 transition-opacity bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* ─── Sidebar Container ────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col h-screen bg-white/95 backdrop-blur-md border-r border-slate-200/80 shadow-[0_0_50px_rgba(0,0,0,0.03)] transition-all duration-300 ease-in-out ${
          isOpen ? "w-[275px]" : "w-[78px]"
        } ${isMobile && !mobileOpen ? "-translate-x-full" : "translate-x-0"}`}
      >
        {/* ─── Brand Header ────────────────────────────────── */}
        <div className="flex h-[72px] shrink-0 items-center justify-between px-3.5 border-b border-slate-100">
          <NavLink
            to="/vendor/dashboard"
            className={`flex items-center gap-2 transition-transform duration-200 hover:scale-[1.02] ${
              !sidebarExpanded ? "w-full justify-center" : ""
            }`}
          >
            <div className="flex items-center justify-center">
              <img
                src={brandLogo}
                alt="Brand Logo"
                className={`w-auto object-contain transition-all duration-300 ${
                  sidebarExpanded ? "h-20 max-w-[100px]" : "h-15 max-w-[42px]"
                }`}
              />
            </div>
          </NavLink>

          {/* Toggle button – only on desktop */}
          {!isMobile ? (
            <button
              onClick={onToggle}
              title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
              className={`flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ${
                !sidebarExpanded ? "hidden" : "flex"
              }`}
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center w-8 h-8 transition-colors rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Floating Expand button when collapsed */}
        {!isOpen && !isMobile && (
          <div className="flex justify-center py-2 border-b border-slate-100">
            <button
              onClick={onToggle}
              title="Expand Sidebar"
              className="flex items-center justify-center w-8 h-8 transition-colors rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ─── Navigation ──────────────────────────────────── */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
          {menuGroups.map((group, groupIndex) => {
            const isExpanded = expandedGroups[groupIndex];
            return (
              <div key={group.label} className="space-y-1">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(groupIndex)}
                  className={`flex items-center w-full px-2 py-1 text-left transition-colors duration-150 rounded-md hover:bg-slate-100/60 ${
                    sidebarExpanded ? "justify-between" : "justify-center"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <group.icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    {sidebarExpanded && (
                      <span className="truncate">{group.label}</span>
                    )}
                  </span>
                  {sidebarExpanded && (
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isExpanded ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  )}
                </button>

                {/* Items */}
                {(isExpanded || !sidebarExpanded) && (
                  <ul className="space-y-0.5">
                    {group.items.map(({ path, label, icon: Icon }) => (
                      <li key={path}>
                        <NavLink
                          to={path}
                          onClick={() => isMobile && setMobileOpen(false)}
                          className={({ isActive }) =>
                            `group/item relative flex min-h-[40px] items-center gap-3 rounded-xl transition-all duration-200 ${
                              sidebarExpanded
                                ? "px-3 py-2"
                                : "justify-center px-2 py-2"
                            } ${
                              isActive
                                ? "bg-orange-50/80 text-orange-600 font-semibold shadow-xs"
                                : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              {isActive && (
                                <span className="absolute left-0 w-1 h-5 -translate-y-1/2 rounded-r-full shadow-xs top-1/2 bg-gradient-to-b from-orange-500 to-amber-500" />
                              )}
                              <span
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                  isActive
                                    ? "text-orange-600"
                                    : "text-slate-400 group-hover/item:text-slate-700"
                                }`}
                              >
                                <Icon className="h-[18px] w-[18px] transition-transform duration-200 group-hover/item:scale-110" />
                              </span>
                              {sidebarExpanded && (
                                <span className="flex-1 min-w-0 text-xs truncate">
                                  {label}
                                </span>
                              )}
                              {isActive && sidebarExpanded && (
                                <ChevronRight className="h-3.5 w-3.5 text-orange-400 opacity-80 ml-auto" />
                              )}
                              {!sidebarExpanded && (
                                <div className="pointer-events-none absolute left-[62px] z-50 hidden whitespace-nowrap rounded-lg bg-slate-900/90 backdrop-blur-xs px-3 py-1.5 text-xs font-medium text-white shadow-lg group-hover/item:flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
                                  {label}
                                  <span className="absolute w-2 h-2 rotate-45 -translate-y-1/2 bg-slate-900/90 -left-1 top-1/2" />
                                </div>
                              )}
                            </>
                          )}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        {/* ─── Vendor Profile Footer ────────────────────────── */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 backdrop-blur-sm">
          <div className="p-2 transition-all duration-200 bg-white border shadow-xs rounded-xl border-slate-200/60">
            <div
              className={`flex items-center ${
                sidebarExpanded ? "gap-3" : "justify-center"
              }`}
            >
              <NavLink
                to="/vendor/profile"
                title={vendor?.businessName || "Vendor"}
                className="relative shrink-0 group/profile"
              >
                {vendorLoading ? (
                  <div className="flex items-center justify-center w-10 h-10 bg-slate-100 rounded-xl">
                    <LoaderCircle className="w-4 h-4 text-orange-500 animate-spin" />
                  </div>
                ) : imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={vendor?.businessName || "Vendor"}
                    onError={() => setImageError(true)}
                    className="object-cover w-10 h-10 transition-transform duration-200 shadow-xs rounded-xl ring-1 ring-slate-200/80 group-hover/profile:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 text-xs font-bold text-white transition-transform duration-200 shadow-xs rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 group-hover/profile:scale-105">
                    {getInitials()}
                  </div>
                )}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
                    isOnline ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                />
              </NavLink>

              {sidebarExpanded && (
                <>
                  <div className="flex-1 min-w-0">
                    <NavLink to="/vendor/profile">
                      <p className="text-xs font-semibold truncate transition-colors text-slate-800 hover:text-orange-600">
                        {vendor?.businessName || "Vendor Business"}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400">
                        {vendor?.email || "vendor@email.com"}
                      </p>
                    </NavLink>
                  </div>

                  <button
                    onClick={handleLogout}
                    disabled={logoutLoading}
                    title="Logout"
                    className="flex items-center justify-center w-8 h-8 transition-all rounded-lg text-slate-400 shrink-0 hover:bg-red-50 hover:text-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {logoutLoading ? (
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
