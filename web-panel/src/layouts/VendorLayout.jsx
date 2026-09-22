import { Outlet, Navigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";

import VendorSidebar from "../../vendorPanel/components/VendorSidebar";
import VendorTopbar from "../../vendorPanel/components/VendorTopbar";

import { useVendor } from "../context/VendorContext";

export default function VendorLayout() {
  const { vendor, loading } = useVendor();

  // ─── Sidebar state (lifted here) ──────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleMobile = () => setMobileOpen((prev) => !prev);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoaderCircle className="w-8 h-8 mx-auto text-orange-500 animate-spin" />
          <p className="mt-3 text-sm font-semibold text-gray-500">
            Loading vendor account...
          </p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return <Navigate to="/vendor/login" replace />;
  }

  if (vendor.approvalStatus !== "approved") {
    return <Navigate to="/vendor/pending" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <VendorSidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        isMobile={false}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main content – dynamic margin based on sidebar state */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-[275px]" : "ml-[78px]"
        }`}
      >
        <VendorTopbar onMenuClick={toggleSidebar} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
