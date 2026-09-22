import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import { useAdmin } from "../../src/context/AdminContext";
import { LoaderCircle } from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { admin, adminLoading } = useAdmin();

  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth >= 768,
  );
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  // ✅ Redirect to login if admin becomes null (e.g., after logout)
  useEffect(() => {
    if (!adminLoading && !admin) {
      navigate("/admin/login", { replace: true });
    }
  }, [admin, adminLoading, navigate]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoaderCircle className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!admin) {
    return null; // redirect will happen via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isMobile && sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <Sidebar
        open={sidebarOpen}
        isMobile={isMobile}
        setOpen={setSidebarOpen}
      />

      <div
        className={`
          flex min-h-screen flex-col
          transition-[margin] duration-300 ease-in-out
          ${
            !isMobile && sidebarOpen
              ? "md:ml-64"
              : !isMobile
                ? "md:ml-20"
                : "ml-0"
          }
        `}
      >
        <TopNavbar
          toggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
          isMobile={isMobile}
        />

        <main className="flex-1 p-4 overflow-x-hidden md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
