// import { useEffect, useMemo, useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import {
//   Menu,
//   Search,
//   Plus,
//   Bell,
//   Maximize,
//   User,
//   Settings,
//   LogOut,
//   ChevronDown,
//   LoaderCircle,
// } from "lucide-react";

// import { logoutAdmin } from "../../api/adminApi";
// import { getApiError } from "../../api/getApiError";
// import { useAdmin } from "../../context/AdminContext";

// const pageTitles = {
//   "/admin/dashboard": "Dashboard",
//   "/admin/live-orders": "Live Orders",
//   "/admin/all-orders": "All Orders",
//   "/admin/profile": "My Profile",
//   "/admin/settings": "Settings",
//   "/admin/vendors": "Vendors",
//   "/admin/riders": "Riders",
//   "/admin/customers": "Customers",
// };

// export default function TopNavbar({ toggleSidebar, sidebarOpen, isMobile }) {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [logoutLoading, setLogoutLoading] = useState(false);
//   const [notificationsOpen, setNotificationsOpen] = useState(false);
//   const [profileOpen, setProfileOpen] = useState(false);

//   // ✅ Context से admin और logout function लें
//   const { admin, adminLoading: loading, logout } = useAdmin();

//   const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:9000";

//   /* =========================================
//      PAGE TITLE
//   ========================================= */
//   const pageTitle = useMemo(() => {
//     const path = location.pathname;
//     if (pageTitles[path]) return pageTitles[path];
//     const lastSegment = path.split("/").filter(Boolean).pop() || "Dashboard";
//     return lastSegment
//       .replace(/-/g, " ")
//       .replace(/\b\w/g, (char) => char.toUpperCase());
//   }, [location.pathname]);

//   const breadcrumb =
//     pageTitle === "Dashboard"
//       ? "Dashboard / Overview"
//       : `Dashboard / ${pageTitle}`;

//   /* =========================================
//      CLOSE DROPDOWNS ON ROUTE CHANGE
//   ========================================= */
//   useEffect(() => {
//     setNotificationsOpen(false);
//     setProfileOpen(false);
//   }, [location.pathname]);

//   /* =========================================
//      ✅ LOGOUT – FIXED
//   ========================================= */
//   const handleLogout = async () => {
//     try {
//       setLogoutLoading(true);

//       // 1. Call server logout API (optional, but good practice)
//       await logoutAdmin();
//     } catch (err) {
//       console.error("Logout API error:", getApiError(err));
//       // अगर API fail हो तो भी हम client-side logout करेंगे
//     } finally {
//       // 2. ✅ Context logout – यह localStorage clear करेगा और state null करेगा
//       logout();

//       setLogoutLoading(false);
//       // 3. Redirect to login
//       navigate("/admin/login", { replace: true });
//     }
//   };

//   /* =========================================
//      FULLSCREEN
//   ========================================= */
//   const handleFullscreen = async () => {
//     try {
//       if (!document.fullscreenElement) {
//         await document.documentElement.requestFullscreen();
//       } else {
//         await document.exitFullscreen();
//       }
//     } catch (error) {
//       console.error("Fullscreen error:", error);
//     }
//   };

//   /* =========================================
//      ADMIN DISPLAY VALUES
//   ========================================= */
//   const adminName =
//     admin?.fullName ||
//     `${admin?.firstName || ""} ${admin?.lastName || ""}`.trim() ||
//     "Admin";

//   const adminRole = admin?.role
//     ? admin.role
//         .split("_")
//         .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//         .join(" ")
//     : "Administrator";

//   const profileImageUrl = admin?.profileImage
//     ? `${API_ORIGIN}${admin.profileImage}`
//     : null;

//   return (
//     <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white/90 backdrop-blur-xl md:px-6">
//       {/* LEFT */}
//       <div className="flex items-center gap-3">
//         <button
//           type="button"
//           onClick={toggleSidebar}
//           aria-label="Toggle sidebar"
//           className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
//         >
//           <Menu className="w-5 h-5" />
//         </button>
//         <div className="hidden md:block">
//           <h1 className="text-sm font-semibold text-gray-800">{breadcrumb}</h1>
//         </div>
//       </div>

//       {/* SEARCH */}
//       <div className="flex-1 hidden max-w-md mx-4 md:block">
//         <div className="relative">
//           <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
//           <input
//             type="text"
//             placeholder="Search order, vendor, customer or rider..."
//             className="w-full py-2 pl-10 pr-4 text-sm transition border border-gray-200 outline-none rounded-xl bg-gray-50 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
//           />
//         </div>
//       </div>

//       {/* RIGHT */}
//       <div className="flex items-center gap-2">
//         {/* Quick Add */}
//         <button
//           type="button"
//           className="items-center hidden gap-1 px-3 py-2 text-sm font-semibold text-white transition shadow-sm rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-md md:inline-flex"
//         >
//           <Plus className="w-4 h-4" />
//           Quick Add
//         </button>

//         {/* Notifications */}
//         <div className="relative">
//           <button
//             type="button"
//             onClick={() => {
//               setNotificationsOpen((prev) => !prev);
//               setProfileOpen(false);
//             }}
//             className="relative p-2 text-gray-500 transition rounded-lg hover:bg-gray-100 hover:text-gray-900"
//           >
//             <Bell className="w-5 h-5" />
//             <span className="absolute w-2 h-2 bg-red-500 rounded-full right-1 top-1" />
//           </button>
//           {notificationsOpen && (
//             <div className="absolute right-0 mt-2 overflow-hidden bg-white border border-gray-200 shadow-xl w-80 rounded-2xl">
//               <div className="flex items-center justify-between p-4 border-b border-gray-100">
//                 <div>
//                   <h3 className="font-bold text-gray-900">Notifications</h3>
//                   <p className="text-xs text-gray-400">
//                     Recent platform activity
//                   </p>
//                 </div>
//                 <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-500">
//                   4 New
//                 </span>
//               </div>
//               <div className="overflow-y-auto max-h-72">
//                 <NotificationItem
//                   title="New vendor registration"
//                   description="Taste of India"
//                   time="5 min ago"
//                 />
//                 <NotificationItem
//                   title="Order delayed"
//                   description="FD10251 requires attention"
//                   time="15 min ago"
//                 />
//                 <NotificationItem
//                   title="Rider KYC completed"
//                   description="Rahul submitted verification"
//                   time="1 hour ago"
//                 />
//                 <NotificationItem
//                   title="Refund request"
//                   description="Received for FD10198"
//                   time="2 hours ago"
//                 />
//               </div>
//               <div className="p-2 border-t border-gray-100">
//                 <button
//                   type="button"
//                   className="w-full py-2 text-sm font-semibold text-orange-600 transition rounded-lg bg-orange-50 hover:bg-orange-100"
//                 >
//                   View All Notifications
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Fullscreen */}
//         <button
//           type="button"
//           onClick={handleFullscreen}
//           className="hidden p-2 text-gray-500 transition rounded-lg hover:bg-gray-100 hover:text-gray-900 md:inline-flex"
//         >
//           <Maximize className="w-5 h-5" />
//         </button>

//         {/* =====================================
//             ADMIN PROFILE
//         ===================================== */}
//         <div className="relative">
//           <button
//             type="button"
//             disabled={loading}
//             onClick={() => {
//               setProfileOpen((prev) => !prev);
//               setNotificationsOpen(false);
//             }}
//             className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             {loading ? (
//               <div className="flex items-center justify-center bg-gray-100 rounded-full h-9 w-9">
//                 <LoaderCircle className="w-4 h-4 text-orange-500 animate-spin" />
//               </div>
//             ) : profileImageUrl ? (
//               <img
//                 src={profileImageUrl}
//                 alt={adminName}
//                 className="object-cover border border-gray-200 rounded-full h-9 w-9"
//                 onError={(e) => (e.currentTarget.style.display = "none")}
//               />
//             ) : (
//               <div className="flex items-center justify-center font-bold text-white rounded-full h-9 w-9 bg-gradient-to-br from-orange-500 to-red-500">
//                 {adminName.charAt(0).toUpperCase()}
//               </div>
//             )}
//             <div className="hidden text-left lg:block">
//               <p className="max-w-[130px] truncate text-xs font-bold text-gray-900">
//                 {loading ? "Loading..." : adminName}
//               </p>
//               <p className="max-w-[130px] truncate text-[10px] text-gray-400">
//                 {adminRole}
//               </p>
//             </div>
//             <ChevronDown
//               className={`h-4 w-4 text-gray-500 transition-transform ${
//                 profileOpen ? "rotate-180" : ""
//               }`}
//             />
//           </button>

//           {profileOpen && (
//             <div className="absolute right-0 w-64 mt-2 overflow-hidden bg-white border border-gray-200 shadow-xl rounded-2xl">
//               <div className="p-4 border-b border-gray-100">
//                 <div className="flex items-center gap-3">
//                   {profileImageUrl ? (
//                     <img
//                       src={profileImageUrl}
//                       alt={adminName}
//                       className="object-cover rounded-full h-11 w-11"
//                     />
//                   ) : (
//                     <div className="flex items-center justify-center font-bold text-white rounded-full h-11 w-11 bg-gradient-to-br from-orange-500 to-red-500">
//                       {adminName.charAt(0).toUpperCase()}
//                     </div>
//                   )}
//                   <div className="min-w-0">
//                     <p className="text-sm font-bold text-gray-900 truncate">
//                       {adminName}
//                     </p>
//                     <p className="text-xs text-gray-400 truncate">
//                       {admin?.email || "Administrator"}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="mt-3 inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-600">
//                   {adminRole}
//                 </div>
//               </div>

//               <div className="p-2">
//                 <Link
//                   to="/admin/profile"
//                   className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
//                 >
//                   <User className="w-4 h-4" />
//                   My Profile
//                 </Link>
//                 <Link
//                   to="/admin/settings"
//                   className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
//                 >
//                   <Settings className="w-4 h-4" />
//                   Settings
//                 </Link>
//               </div>

//               <div className="p-2 border-t border-gray-100">
//                 <button
//                   type="button"
//                   disabled={logoutLoading}
//                   onClick={handleLogout}
//                   className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
//                 >
//                   {logoutLoading ? (
//                     <LoaderCircle className="w-4 h-4 animate-spin" />
//                   ) : (
//                     <LogOut className="w-4 h-4" />
//                   )}
//                   {logoutLoading ? "Logging out..." : "Logout"}
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// }

// /* =====================================================
//    NOTIFICATION ITEM
// ===================================================== */
// function NotificationItem({ title, description, time }) {
//   return (
//     <button
//       type="button"
//       className="block w-full px-4 py-3 text-left transition border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
//     >
//       <p className="text-sm font-semibold text-gray-800">{title}</p>
//       <p className="mt-0.5 text-xs text-gray-500">{description}</p>
//       <p className="mt-1 text-[10px] text-gray-400">{time}</p>
//     </button>
//   );
// }
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Search,
  Plus,
  Bell,
  Maximize,
  User,
  Settings,
  LogOut,
  ChevronDown,
  LoaderCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
  Store,
} from "lucide-react";

import { logoutAdmin } from "../../api/adminApi";
import { getApiError } from "../../api/getApiError";
import { useAdmin } from "../../context/AdminContext";

const pageTitles = {
  "/admin/dashboard": "Dashboard",
  "/admin/live-orders": "Live Orders",
  "/admin/all-orders": "All Orders",
  "/admin/profile": "My Profile",
  "/admin/settings": "Settings",
  "/admin/vendors": "Vendors",
  "/admin/riders": "Riders",
  "/admin/customers": "Customers",
};

// Notification icon mapping
const getNotificationIcon = (type) => {
  switch (type) {
    case "vendor":
      return <Store className="w-4 h-4 text-purple-500" />;
    case "order":
      return <Clock className="w-4 h-4 text-amber-500" />;
    case "rider":
      return <Truck className="w-4 h-4 text-blue-500" />;
    case "refund":
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-400" />;
  }
};

export default function TopNavbar({ toggleSidebar, sidebarOpen, isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [logoutLoading, setLogoutLoading] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { admin, adminLoading: loading, logout } = useAdmin();

  const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:9000";

  /* =========================================
     PAGE TITLE
  ========================================= */
  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (pageTitles[path]) return pageTitles[path];
    const lastSegment = path.split("/").filter(Boolean).pop() || "Dashboard";
    return lastSegment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }, [location.pathname]);

  const breadcrumb =
    pageTitle === "Dashboard"
      ? "Dashboard / Overview"
      : `Dashboard / ${pageTitle}`;

  /* =========================================
     CLOSE DROPDOWNS ON ROUTE CHANGE
  ========================================= */
  useEffect(() => {
    setNotificationsOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  /* =========================================
     LOGOUT
  ========================================= */
  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await logoutAdmin();
    } catch (err) {
      console.error("Logout API error:", getApiError(err));
    } finally {
      logout();
      setLogoutLoading(false);
      navigate("/admin/login", { replace: true });
    }
  };

  /* =========================================
     FULLSCREEN
  ========================================= */
  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  /* =========================================
     ADMIN DISPLAY VALUES
  ========================================= */
  const adminName =
    admin?.fullName ||
    `${admin?.firstName || ""} ${admin?.lastName || ""}`.trim() ||
    "Admin";

  const adminRole = admin?.role
    ? admin.role
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Administrator";

  const profileImageUrl = admin?.profileImage
    ? `${API_ORIGIN}${admin.profileImage}`
    : null;

  // Mock notifications data (you can replace with real data)
  const notifications = [
    {
      id: 1,
      type: "vendor",
      title: "New vendor registration",
      description: "Taste of India",
      time: "5 min ago",
      unread: true,
    },
    {
      id: 2,
      type: "order",
      title: "Order delayed",
      description: "FD10251 requires attention",
      time: "15 min ago",
      unread: true,
    },
    {
      id: 3,
      type: "rider",
      title: "Rider KYC completed",
      description: "Rahul submitted verification",
      time: "1 hour ago",
      unread: false,
    },
    {
      id: 4,
      type: "refund",
      title: "Refund request",
      description: "Received for FD10198",
      time: "2 hours ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 border-b shadow-sm h-18 bg-white/80 backdrop-blur-md border-gray-200/60 md:px-6">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="p-2 text-gray-500 transition rounded-xl hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:block">
          <p className="text-xs font-medium text-gray-400">{breadcrumb}</p>
          <h1 className="text-sm font-bold text-gray-900">{pageTitle}</h1>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex-1 hidden max-w-lg mx-6 md:block">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
          <input
            type="text"
            placeholder="Search orders, vendors, customers..."
            className="w-full py-2.5 pl-10 pr-4 text-sm transition-all bg-gray-50 border border-gray-200 outline-none rounded-xl group-hover:bg-white focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-400 bg-white/80 px-1.5 py-0.5 rounded border border-gray-200 hidden sm:block">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">
        {/* Quick Add */}
        <button
          type="button"
          className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white transition-all rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Quick Add
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen((prev) => !prev);
              setProfileOpen(false);
            }}
            className="relative p-2 text-gray-500 transition rounded-xl hover:bg-gray-100 hover:text-gray-900"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 overflow-hidden border shadow-xl w-80 sm:w-96 bg-white/95 backdrop-blur-md border-gray-200/60 rounded-2xl"
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-100/80">
                  <div>
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                    <p className="text-xs text-gray-400">Recent activity</p>
                  </div>
                  <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-600">
                    {unreadCount} New
                  </span>
                </div>
                <div className="overflow-y-auto divide-y max-h-72 divide-gray-100/80">
                  {notifications.map((item) => (
                    <NotificationItem key={item.id} {...item} />
                  ))}
                </div>
                <div className="p-2 border-t border-gray-100/80 bg-gray-50/50">
                  <button
                    type="button"
                    className="w-full py-2.5 text-sm font-semibold text-orange-600 transition rounded-xl hover:bg-orange-50"
                  >
                    View All Notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fullscreen */}
        <button
          type="button"
          onClick={handleFullscreen}
          className="hidden p-2 text-gray-500 transition rounded-xl hover:bg-gray-100 hover:text-gray-900 md:inline-flex"
        >
          <Maximize className="w-5 h-5" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setProfileOpen((prev) => !prev);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl p-1.5 pr-3 transition hover:bg-gray-100/80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <div className="flex items-center justify-center bg-gray-100 rounded-full w-9 h-9">
                <LoaderCircle className="w-4 h-4 text-orange-500 animate-spin" />
              </div>
            ) : profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={adminName}
                className="object-cover border-2 border-white rounded-full shadow-sm w-9 h-9"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <div className="flex items-center justify-center font-bold text-white rounded-full shadow-sm w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-500">
                {adminName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden text-left lg:block">
              <p className="max-w-[120px] truncate text-xs font-bold text-gray-900">
                {loading ? "Loading..." : adminName}
              </p>
              <p className="max-w-[120px] truncate text-[10px] text-gray-400">
                {adminRole}
              </p>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 w-64 mt-2 overflow-hidden border shadow-xl bg-white/95 backdrop-blur-md border-gray-200/60 rounded-2xl"
              >
                <div className="p-4 border-b border-gray-100/80">
                  <div className="flex items-center gap-3">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt={adminName}
                        className="object-cover w-12 h-12 border-2 border-orange-200 rounded-full shadow-sm"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-white rounded-full shadow-sm bg-gradient-to-br from-orange-500 to-amber-500">
                        {adminName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {adminName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {admin?.email || "Administrator"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-600">
                    {adminRole}
                  </div>
                </div>

                <div className="p-2">
                  <Link
                    to="/admin/profile"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    My Profile
                  </Link>
                  <Link
                    to="/admin/settings"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    Settings
                  </Link>
                </div>

                <div className="p-2 border-t border-gray-100/80">
                  <button
                    type="button"
                    disabled={logoutLoading}
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {logoutLoading ? (
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    {logoutLoading ? "Logging out..." : "Logout"}
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

/* =====================================================
   NOTIFICATION ITEM
===================================================== */
function NotificationItem({ type, title, description, time, unread }) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 transition hover:bg-gray-50/80 ${
        unread ? "bg-orange-50/30" : ""
      }`}
    >
      <div className="flex-shrink-0 mt-1">
        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
          {getNotificationIcon(type)}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {title}
          </p>
          {unread && (
            <span className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full" />
          )}
        </div>
        <p className="mt-0.5 text-xs text-gray-500 truncate">{description}</p>
        <p className="mt-1 text-[10px] text-gray-400">{time}</p>
      </div>
    </div>
  );
}
