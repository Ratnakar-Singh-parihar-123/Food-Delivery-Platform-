import { createContext, useContext, useEffect, useState } from "react";
import { getAdminProfile, loginAdmin } from "../api/adminApi";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  // localStorage
  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    const token = localStorage.getItem("adminToken");

    if (storedAdmin && token) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch {
        localStorage.removeItem("admin");
        localStorage.removeItem("adminToken");
      }
    }
    // Loading
    setAdminLoading(false);
  }, []);

  // ✅ Login function –
  const login = async (credentials) => {
    try {
      setAdminLoading(true);
      setAuthError("");

      const response = await loginAdmin(credentials);
      console.log("LOGIN RESPONSE:", response);

      const adminData = response?.data?.admin;
      const token = response?.data?.token;

      if (!adminData) {
        throw new Error("Invalid response from server");
      }

      setAdmin(adminData);
      localStorage.setItem("admin", JSON.stringify(adminData));

      // ✅ Token store
      if (token) {
        localStorage.setItem("adminToken", token);
      }

      return {
        success: true,
        admin: adminData,
      };
    } catch (error) {
      console.error("Admin login error:", error);
      const message =
        error?.response?.data?.message || error?.message || "Login failed";
      setAuthError(message);
      return {
        success: false,
        error: message,
      };
    } finally {
      setAdminLoading(false);
    }
  };

  // ✅ Logout –
  const logout = () => {
    console.log("Logout clicked");
    setAdmin(null);
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
    // optional: API logout call
  };

  const value = {
    admin,
    setAdmin,
    adminLoading,
    authError,
    login,
    logout,
    // fetchAdmin,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used inside AdminProvider");
  }
  return context;
}
