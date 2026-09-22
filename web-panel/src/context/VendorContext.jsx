import { createContext, useContext, useEffect, useState } from "react";
import { getVendorProfileApi, logoutVendorApi } from "../api/vendorApi";

const VendorContext = createContext(null);

export function VendorProvider({ children }) {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ─── On mount: load vendor from localStorage and fetch fresh ──
  useEffect(() => {
    const savedVendor = localStorage.getItem("vendor");
    const token = localStorage.getItem("vendorToken");

    // Load saved vendor immediately
    if (savedVendor) {
      try {
        const parsed = JSON.parse(savedVendor);
        setVendor(parsed);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem("vendor");
      }
    }

    // If token exists, fetch fresh profile
    if (token) {
      fetchVendor(false); // Don't show loading on background refresh
    } else {
      setLoading(false);
    }
  }, []);

  // ─── Fetch fresh vendor profile (cookie sent automatically) ──
  const fetchVendor = async (showLoading = true) => {
    const token = localStorage.getItem("vendorToken");
    if (!token) {
      setLoading(false);
      return null;
    }

    try {
      if (showLoading) setLoading(true);
      setError("");

      const response = await getVendorProfileApi();
      const vendorData = response?.data?.vendor;

      if (!vendorData) {
        // No vendor data – clear session
        setVendor(null);
        setIsAuthenticated(false);
        localStorage.removeItem("vendor");
        localStorage.removeItem("vendorToken");
        return null;
      }

      const finalVendor = {
        ...vendorData,
        approvalStatus:
          response?.data?.approvalStatus ||
          vendorData?.approvalStatus ||
          "pending",
      };

      setVendor(finalVendor);
      setIsAuthenticated(true);
      localStorage.setItem("vendor", JSON.stringify(finalVendor));
      return finalVendor;
    } catch (err) {
      console.error("VENDOR PROFILE ERROR:", err?.response?.data || err);
      // If 401 (unauthorized), clear session
      if (err?.response?.status === 401) {
        setVendor(null);
        setIsAuthenticated(false);
        localStorage.removeItem("vendor");
        localStorage.removeItem("vendorToken");
        setError("Session expired. Please login again.");
      } else if (err?.response?.status === 500) {
        // 500 error – keep existing vendor data (don't show error if we have vendor)
        const hasVendor = localStorage.getItem("vendor");
        if (!hasVendor) {
          setError("Server error. Please try again later.");
        }
        // Don't clear vendor on 500
      } else {
        // For other errors, keep existing vendor data (if any)
        const hasVendor = localStorage.getItem("vendor");
        if (!hasVendor) {
          setError(err?.response?.data?.message || "Failed to refresh profile");
        }
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ─── Login: stores vendor and token ──────────────────────────
  const login = (vendorData, token) => {
    const finalVendor = {
      ...vendorData,
      approvalStatus: vendorData.approvalStatus || "pending",
    };
    setVendor(finalVendor);
    setIsAuthenticated(true);
    setError("");
    localStorage.setItem("vendor", JSON.stringify(finalVendor));
    if (token) {
      localStorage.setItem("vendorToken", token);
    }
  };

  // ─── Logout: clears everything ──────────────────────────────
  const logout = async () => {
    try {
      await logoutVendorApi();
    } catch (err) {
      console.error("VENDOR LOGOUT ERROR:", err?.response?.data || err);
    } finally {
      setVendor(null);
      setIsAuthenticated(false);
      localStorage.removeItem("vendor");
      localStorage.removeItem("vendorToken");
    }
  };

  const value = {
    vendor,
    setVendor,
    login,
    loginVendor: login,
    loading,
    error,
    isAuthenticated,
    fetchVendor,
    logout,
  };

  return (
    <VendorContext.Provider value={value}>{children}</VendorContext.Provider>
  );
}

export const useVendor = () => {
  const context = useContext(VendorContext);
  if (!context) {
    throw new Error("useVendor must be used inside VendorProvider");
  }
  return context;
};
