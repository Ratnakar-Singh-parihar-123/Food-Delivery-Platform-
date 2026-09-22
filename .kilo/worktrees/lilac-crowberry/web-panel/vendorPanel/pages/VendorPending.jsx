import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Store,
  UtensilsCrossed,
  ShoppingBag,
  Users,
  CreditCard,
  Settings,
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Package,
  MapPin,
  Bell,
  User,
} from "lucide-react";

// ─── Mock API – replace with real calls ──────────────
import {
  getVendorProfileApi,
  getVendorDashboardApi,
} from "../../src/api/vendorApi";

export default function VendorPending() {
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Fetch vendor data ───────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await getVendorProfileApi();
        const dashboard = await getVendorDashboardApi();

        setVendor(profile.data.vendor);
        setStats(dashboard.data.stats);
      } catch (error) {
        console.error("Error fetching vendor data:", error);
        // If token expired, redirect to login
        if (error?.response?.status === 401) {
          navigate("/vendor/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    // Call logout API and redirect
    // await logoutVendorApi();
    navigate("/vendor/login");
  };

  // ─── Loading state ────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fffaf6]">
        <div className="w-12 h-12 border-4 border-orange-500 rounded-full animate-spin border-t-transparent" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fffaf6]">
        <p className="text-gray-500">
          Unable to load vendor data. Please try again.
        </p>
      </div>
    );
  }

  const { approvalStatus, businessName, profileImage, isActive } = vendor;

  // ─── Status configuration ─────────────────────────────
  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      title: "Awaiting Approval",
      message:
        "Your business is under review by the admin. You'll be notified once approved.",
      showStats: false,
    },
    approved: {
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
      title: "✅ Approved",
      message: "Your business is live and ready to accept orders!",
      showStats: true,
    },
    rejected: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      title: "❌ Rejected",
      message:
        vendor.rejectionReason ||
        "Your application was not approved. Please contact support.",
      showStats: false,
    },
  };

  const status = statusConfig[approvalStatus] || statusConfig.pending;
  const StatusIcon = status.icon;

  // ─── Quick action cards ───────────────────────────────
  const actions = [
    { icon: ShoppingBag, label: "Orders", path: "/vendor/orders" },
    { icon: UtensilsCrossed, label: "Menu", path: "/vendor/menu" },
    { icon: Users, label: "Customers", path: "/vendor/customers" },
    { icon: CreditCard, label: "Bank", path: "/vendor/bank" },
    { icon: MapPin, label: "Location", path: "/vendor/location" },
    { icon: Settings, label: "Settings", path: "/vendor/settings" },
  ];

  return (
    <div className="min-h-screen bg-[#fffaf6]">
      {/* ─── Header ──────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b bg-white/85 backdrop-blur-xl border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
          <Link to="/vendor/home" className="flex items-center gap-3">
            <span className="relative flex items-center justify-center text-white shadow-lg h-11 w-11 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-500/20">
              <Store className="w-5 h-5" />
            </span>
            <span>
              <span className="block font-extrabold tracking-tight text-gray-950">
                {businessName || "My Store"}
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                Vendor Dashboard
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Notification bell */}
            <button className="relative p-2 text-gray-400 transition-colors hover:text-orange-500">
              <Bell className="w-5 h-5" />
              <span className="absolute w-2 h-2 bg-red-500 rounded-full top-1 right-1" />
            </button>

            {/* Profile */}
            <div className="flex items-center gap-2">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="object-cover border-2 border-orange-200 rounded-full w-9 h-9"
                />
              ) : (
                <div className="flex items-center justify-center text-orange-600 bg-orange-100 rounded-full w-9 h-9">
                  <User className="w-5 h-5" />
                </div>
              )}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 transition-colors hover:text-red-500"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────── */}
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Status Banner */}
        <div
          className={`p-6 rounded-2xl border ${status.bg} ${status.border} flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8`}
        >
          <div
            className={`p-3 rounded-xl ${status.bg} border ${status.border}`}
          >
            <StatusIcon className={`w-8 h-8 ${status.color}`} />
          </div>
          <div className="flex-1">
            <h2 className={`text-xl font-extrabold ${status.color}`}>
              {status.title}
            </h2>
            <p className="mt-1 text-sm text-gray-600">{status.message}</p>
          </div>
          {approvalStatus === "pending" && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-yellow-700 bg-yellow-100 rounded-full">
              <Clock className="w-4 h-4" />
              Under Review
            </span>
          )}
          {approvalStatus === "approved" && isActive && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-green-700 bg-green-100 rounded-full">
              <CheckCircle className="w-4 h-4" />
              Live
            </span>
          )}
        </div>

        {/* Stats (only if approved and active) */}
        {status.showStats && stats && (
          <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4">
            <StatCard
              label="Today's Orders"
              value={stats.todayOrders || 0}
              icon={ShoppingBag}
              color="text-orange-500"
            />
            <StatCard
              label="Revenue"
              value={`₹${stats.todayRevenue || 0}`}
              icon={TrendingUp}
              color="text-green-500"
            />
            <StatCard
              label="Pending Orders"
              value={stats.pendingOrders || 0}
              icon={Clock}
              color="text-yellow-500"
            />
            <StatCard
              label="Customers"
              value={stats.totalCustomers || 0}
              icon={Users}
              color="text-blue-500"
            />
          </div>
        )}

        {/* Quick Actions */}
        <h3 className="mb-4 text-lg font-extrabold text-gray-800">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {actions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="flex flex-col items-center justify-center p-5 transition-all duration-200 bg-white border border-gray-200 shadow-sm group rounded-2xl hover:shadow-md hover:border-orange-300"
            >
              <action.icon className="text-gray-500 transition-colors w-7 h-7 group-hover:text-orange-500" />
              <span className="mt-2 text-xs font-bold text-gray-600 group-hover:text-gray-900">
                {action.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Recent Orders (if approved) */}
        {status.showStats && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-gray-800">
                Recent Orders
              </h3>
              <Link
                to="/vendor/orders"
                className="text-sm font-bold text-orange-600 hover:text-orange-700"
              >
                View all →
              </Link>
            </div>
            <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
              <div className="p-4 text-sm font-bold tracking-wider text-gray-500 uppercase border-b border-gray-100">
                No recent orders yet
              </div>
              {/* You can map over recent orders here */}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── StatCard Component ──────────────────────────────────
function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 shadow-sm rounded-2xl">
      <div className={`p-3 rounded-xl bg-gray-50 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
