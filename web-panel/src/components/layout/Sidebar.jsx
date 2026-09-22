import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  ShoppingBag,
  ListOrdered,
  Map,
  Store,
  UserCheck,
  Utensils,
  Coffee,
  Cake,
  StoreIcon,
  Sandwich,
  PlusCircle,
  Users,
  ClipboardCheck,
  User,
  Ban,
  DollarSign,
  FolderTree,
  Tag,
  Pizza,
  Box,
  Percent,
  Image,
  Bell,
  MapPin,
  Truck,
  Settings as SettingsIcon,
  CreditCard,
  HandCoins,
  Receipt,
  RefreshCw,
  LifeBuoy,
  Star,
  XCircle,
  BarChart3,
  TrendingUp,
  FileText,
  LogOut,
  UserRound,
  ChevronRight,
  LoaderCircle,
  X,
  ChevronDown,
  UtensilsCrossed,
  Compass,
  FolderOpenDot,
  Calendar,
} from "lucide-react";

import { useAdmin } from "../../context/AdminContext";
import { logoutAdmin } from "../../api/adminApi";
import { getApiError } from "../../api/getApiError";
import brandLogo from "../../assets/logo/MainBrandLogo.png";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:9000";

/* =====================================================
   MENU
===================================================== */

const menuItems = [
  {
    label: "Main",
    items: [
      {
        label: "Dashboard",
        path: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Live Orders",
        path: "/admin/live/orders",
        icon: ShoppingBag,
        badge: 18,
      },
      {
        label: "All Orders",
        path: "/admin/all/orders",
        icon: ListOrdered,
      },
      {
        label: "Live Delivery Map",
        path: "/admin/live/delivery/map",
        icon: Map,
      },
      {
        label: "Explore",
        path: "/admin/explore",
        icon: Compass,
      },
      {
        label: "Food Categories",
        path: "/admin/food/categories",
        icon: UtensilsCrossed,
      },
    ],
  },
  {
    label: "Tiffin Centers",
    icon: Store,
    items: [
      {
        label: "All Tiffin House",
        path: "/admin/tiffin/approvals",
        icon: Store,
      },
      {
        label: "Tiffin Earnings",
        path: "/admin/tiffin/earnings",
        icon: TrendingUp,
      },
      {
        label: "Subscriptions",
        path: "/admin/tiffin/subscriptions",
        icon: Calendar,
      },
      {
        label: "Reviews & Ratings",
        path: "/admin/tiffin/reviews",
        icon: Star,
      },
    ],
  },
  {
    label: "Vendors",
    items: [
      {
        label: "All Vendors",
        path: "/admin/vendors",
        icon: Store,
      },
      {
        label: "Approval Center",
        path: "/admin/approvals",
        icon: UserCheck,
        badge: 5,
      },
      {
        label: "Restaurants",
        path: "/admin/restaurants",
        icon: Utensils,
      },
      {
        label: "Dhabas",
        path: "/admin/dhabas",
        icon: Coffee,
      },
      {
        label: "Bakeries",
        path: "/admin/bakeries",
        icon: Cake,
      },
      {
        label: "Cafes",
        path: "/admin/cafes",
        icon: StoreIcon,
      },
    ],
  },
  {
    label: "Delivery Partners",
    items: [
      {
        label: "All Riders",
        path: "/admin/riders",
        icon: Users,
      },
      {
        label: "Pending KYC",
        path: "/admin/pending-kyc",
        icon: ClipboardCheck,
        badge: 3,
      },
      {
        label: "Online Riders",
        path: "/admin/online-riders",
        icon: UserCheck,
      },
      {
        label: "Offline Riders",
        path: "/admin/offline-riders",
        icon: User,
      },
      {
        label: "Blocked Riders",
        path: "/admin/blocked-riders",
        icon: Ban,
      },
      {
        label: "Rider Payouts",
        path: "/admin/rider-payouts",
        icon: DollarSign,
      },
    ],
  },
  {
    label: "Customers",
    items: [
      {
        label: "All Customers",
        path: "/admin/customers",
        icon: Users,
      },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        label: "Business Types",
        path: "/admin/business-types",
        icon: FolderTree,
      },
      {
        label: "Categories",
        path: "/admin/categories",
        icon: Tag,
      },
      {
        label: "Cuisines",
        path: "/admin/cuisines",
        icon: Pizza,
      },
      {
        label: "Products",
        path: "/admin/products",
        icon: Box,
      },
      {
        label: "Add Icons",
        path: "/admin/icons",
        icon: PlusCircle,
      },
    ],
  },
  {
    label: "Top Listings",
    items: [
      {
        label: "Popular Food",
        path: "/admin/popular/foods",
        icon: FolderOpenDot,
      },
    ],
  },
  {
    label: "Marketing",
    items: [
      {
        label: "Top Rated Vendors",
        path: "/admin/top/rated/vendors",
        icon: Star,
      },
      {
        label: "Coupons",
        path: "/admin/coupons",
        icon: Percent,
      },
      {
        label: "Banners",
        path: "/admin/banners",
        icon: Image,
      },
      {
        label: "Push Notifications",
        path: "/admin/push/notifications",
        icon: Bell,
      },
    ],
  },
  {
    label: "Delivery Management",
    items: [
      {
        label: "Service Areas",
        path: "/admin/service/areas",
        icon: MapPin,
      },
      {
        label: "Delivery Charges",
        path: "/admin/delivery-charges",
        icon: Truck,
      },
      {
        label: "Delivery Settings",
        path: "/admin/delivery-settings",
        icon: SettingsIcon,
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        label: "Payments",
        path: "/admin/payments",
        icon: CreditCard,
      },
      {
        label: "Vendor Settlements",
        path: "/admin/vendor/settlements",
        icon: HandCoins,
      },
      {
        label: "Rider Payouts",
        path: "/admin/rider/payouts",
        icon: Receipt,
      },
      {
        label: "Refunds",
        path: "/admin/refunds",
        icon: RefreshCw,
      },
    ],
  },
  {
    label: "Support",
    items: [
      {
        label: "Support Tickets",
        path: "/admin/support-tickets",
        icon: LifeBuoy,
        badge: 3,
      },
      {
        label: "Reviews",
        path: "/admin/reviews",
        icon: Star,
      },
      {
        label: "Cancellations",
        path: "/admin/cancellations",
        icon: XCircle,
      },
    ],
  },
  {
    label: "Analytics",
    items: [
      {
        label: "Overview",
        path: "/admin/analytics/overview",
        icon: BarChart3,
      },
      {
        label: "Sales Analytics",
        path: "/admin/sales/analytics",
        icon: TrendingUp,
      },
      {
        label: "Order Analytics",
        path: "/admin/order/analytics",
        icon: BarChart3,
      },
      {
        label: "Reports",
        path: "/admin/reports",
        icon: FileText,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Audit Logs",
        path: "/admin/audit/logs",
        icon: FileText,
      },
      {
        label: "Settings",
        path: "/admin/settings",
        icon: SettingsIcon,
      },
      {
        label: "Profile",
        path: "/admin/profile",
        icon: UserRound,
      },
    ],
  },
];

/* =====================================================
   SIDEBAR
===================================================== */

export default function Sidebar({ open, isMobile, setOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { admin, adminLoading, logout } = useAdmin();

  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const closeSidebar = () => {
    if (isMobile) setOpen(false);
  };

  useEffect(() => {
    if (isMobile) setOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      setLogoutError("");
      await logoutAdmin();
    } catch (error) {
      console.error("Admin logout error:", error);
      setLogoutError(getApiError(error, "Unable to logout."));
    } finally {
      logout();
      setLogoutLoading(false);
      navigate("/admin/login", { replace: true });
    }
  };

  const adminName =
    admin?.fullName ||
    `${admin?.firstName || ""} ${admin?.lastName || ""}`.trim() ||
    "Administrator";

  const adminRole = formatRole(admin?.role);

  const profileImageUrl = admin?.profileImage
    ? `${API_ORIGIN}${admin.profileImage}`
    : null;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 transition-opacity duration-300 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col
          bg-white/95 backdrop-blur-md
          border-r border-slate-200/80
          shadow-[0_0_50px_rgba(0,0,0,0.03)]
          transition-all duration-300 cubic-bezier(0.4,0,0.2,1)

          ${open ? "w-[275px]" : "w-[78px]"}

          ${isMobile && !open ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        {/* Brand Header */}
        <div
          className={`
            flex h-[72px] shrink-0 items-center
            border-b border-slate-100
            ${open ? "justify-between px-5" : "justify-center px-2"}
          `}
        >
          <NavLink
            to="/admin/dashboard"
            className="flex items-center gap-3 transition-transform duration-200 hover:scale-[1.02]"
          >
            <div className="relative flex items-center justify-center">
              <img
                src={brandLogo}
                alt="Brand Logo"
                className={`w-auto object-contain transition-all duration-300 ${
                  open ? "h-27" : "h-11 max-w-[42px]"
                }`}
              />
            </div>
          </NavLink>

          {isMobile && open && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center w-8 h-8 transition rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
          {menuItems.map((group) => (
            <SidebarGroup
              key={group.label}
              group={group}
              open={open}
              currentPath={location.pathname}
              closeSidebar={closeSidebar}
            />
          ))}
        </nav>

        {/* Logout Error Banner */}
        {open && logoutError && (
          <div className="px-3 pb-2">
            <p className="rounded-xl border border-red-200/60 bg-red-50/90 px-3 py-2 text-[11px] font-medium text-red-600">
              {logoutError}
            </p>
          </div>
        )}

        {/* Admin Profile Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 backdrop-blur-sm">
          <div
            className={`
              rounded-xl
              border border-slate-200/60
              bg-white
              shadow-sm
              transition-all duration-200

              ${open ? "p-3" : "p-2"}
            `}
          >
            <div
              className={`
                flex items-center
                ${open ? "gap-3" : "justify-center"}
              `}
            >
              <NavLink
                to="/admin/profile"
                title={!open ? adminName : undefined}
                className="relative shrink-0 group/profile"
              >
                {adminLoading ? (
                  <div className="flex items-center justify-center w-10 h-10 bg-slate-100 rounded-xl">
                    <LoaderCircle className="w-4 h-4 text-orange-500 animate-spin" />
                  </div>
                ) : profileImageUrl ? (
                  <div className="relative">
                    <img
                      src={profileImageUrl}
                      alt={adminName}
                      className="object-cover w-10 h-10 transition-transform duration-200 shadow-sm rounded-xl ring-1 ring-slate-200/80 group-hover/profile:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 text-xs font-bold text-white transition-transform duration-200 shadow-sm rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 group-hover/profile:scale-105">
                    {getInitials(adminName)}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
              </NavLink>

              {open && (
                <>
                  <NavLink to="/admin/profile" className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate transition-colors text-slate-800 group-hover/profile:text-orange-600">
                      {adminLoading ? "Loading..." : adminName}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {adminRole}
                    </p>
                  </NavLink>

                  <button
                    type="button"
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

/* =====================================================
   SIDEBAR GROUP (COLLAPSIBLE)
===================================================== */

function SidebarGroup({ group, open, currentPath, closeSidebar }) {
  const [expanded, setExpanded] = useState(true);

  const toggleGroup = () => setExpanded((prev) => !prev);

  const hasItems = group.items && group.items.length > 0;
  const showLabel = open;
  const showToggle = open && hasItems;

  return (
    <div className="space-y-1">
      {showLabel ? (
        <button
          type="button"
          onClick={toggleGroup}
          className="flex items-center justify-between w-full px-2 py-1 text-left transition-colors duration-150 rounded-md hover:bg-slate-100/60"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {group.label}
          </span>
          {showToggle && (
            <span
              className={`
                text-slate-400 transition-transform duration-200
                ${expanded ? "rotate-0" : "-rotate-90"}
              `}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </span>
          )}
        </button>
      ) : (
        <div className="w-6 h-px mx-auto my-2 bg-slate-200/80" />
      )}

      {(expanded || !open) && (
        <div className="space-y-0.5">
          {group.items.map((item) => (
            <SidebarItem
              key={`${item.path}-${item.label}`}
              item={item}
              open={open}
              currentPath={currentPath}
              closeSidebar={closeSidebar}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* =====================================================
   SIDEBAR ITEM
===================================================== */

function SidebarItem({ item, open, currentPath, closeSidebar }) {
  const Icon = item.icon;
  const isActive = currentPath === item.path;
  const hasBadge = item.badge !== undefined && item.badge > 0;

  return (
    <NavLink
      to={item.path}
      onClick={closeSidebar}
      title={!open ? item.label : undefined}
      className={`
        group relative
        flex min-h-[40px]
        items-center
        rounded-xl
        transition-all duration-200

        ${open ? "gap-3 px-3" : "justify-center px-2"}

        ${
          isActive
            ? "bg-orange-50/80 text-orange-600 font-semibold shadow-xs"
            : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
        }
      `}
    >
      {/* Active Left Indicator Bar */}
      {isActive && (
        <span className="absolute left-0 w-1 h-5 -translate-y-1/2 rounded-r-full shadow-xs top-1/2 bg-gradient-to-b from-orange-500 to-amber-500" />
      )}

      {/* Icon Container */}
      <span
        className={`
          relative
          flex h-7 w-7
          shrink-0
          items-center
          justify-center
          rounded-lg
          transition-all duration-200

          ${
            isActive
              ? "text-orange-600"
              : "text-slate-400 group-hover:text-slate-700"
          }
        `}
      >
        <Icon className="h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110" />

        {!open && hasBadge && (
          <span
            className="
              absolute -right-1 -top-1
              flex h-4 min-w-[16px]
              items-center
              justify-center
              rounded-full
              bg-orange-500
              px-1
              text-[8px]
              font-bold
              text-white
              ring-2 ring-white
            "
          >
            {item.badge > 9 ? "9+" : item.badge}
          </span>
        )}
      </span>

      {/* Expanded State Content */}
      {open && (
        <>
          <span className="flex-1 min-w-0 text-xs truncate">{item.label}</span>

          {hasBadge && (
            <span
              className={`
                ml-auto
                inline-flex min-w-[20px]
                items-center
                justify-center
                rounded-full
                px-1.5 py-0.5
                text-[10px]
                font-bold
                transition-colors

                ${
                  isActive
                    ? "bg-orange-500 text-white"
                    : "bg-slate-100 text-slate-600 group-hover:bg-slate-200/80"
                }
              `}
            >
              {item.badge}
            </span>
          )}

          {isActive && !hasBadge && (
            <ChevronRight className="h-3.5 w-3.5 text-orange-400 opacity-80" />
          )}
        </>
      )}

      {/* Collapsed Tooltip */}
      {!open && (
        <div
          className="
            pointer-events-none
            absolute left-[62px]
            z-50
            hidden
            whitespace-nowrap
            rounded-lg
            bg-slate-900/90 backdrop-blur-xs
            px-3 py-1.5
            text-xs
            font-medium
            text-white
            shadow-lg
            group-hover:flex items-center gap-2
            animate-in fade-in zoom-in-95 duration-150
          "
        >
          {item.label}
          {hasBadge && (
            <span className="rounded-full bg-orange-500 px-1.5 py-0.2 text-[9px] font-bold">
              {item.badge}
            </span>
          )}
          <span className="absolute w-2 h-2 rotate-45 -translate-y-1/2 bg-slate-900/90 -left-1 top-1/2" />
        </div>
      )}
    </NavLink>
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
  const words = name.trim().split(" ").filter(Boolean);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase();
}
