// src/utils/helpers.js

// ─── Static base URL for images ────────────────────────────
// This should match your backend static file serving URL.
// In production, you might use an environment variable.
const STATIC_BASE =
  import.meta.env?.VITE_STATIC_BASE ||
  "https://myfoodmitra-ecosystem.onrender.com";

// ─── Build a full image URL from a relative path ──────────
export const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // If it's already a full URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${STATIC_BASE}${cleanPath}`;
};

// ─── Format currency (Indian Rupees) ──────────────────────
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "₹0";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

// ─── Format date to readable string ───────────────────────
export const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ─── Format time to readable string ───────────────────────
export const formatTime = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Format date and time ──────────────────────────────────
export const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Truncate text with ellipsis ──────────────────────────
export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
};

// ─── Get initials from name ────────────────────────────────
export const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// ─── Get distance in km (formatted) ───────────────────────
export const formatDistance = (distanceKm) => {
  if (distanceKm === undefined || distanceKm === null) return "—";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1)} km`;
};

// ─── Get status color (for badges) ─────────────────────────
export const getStatusColor = (status) => {
  const colors = {
    placed: "blue",
    confirmed: "indigo",
    preparing: "purple",
    ready_for_pickup: "green",
    rider_assigned: "cyan",
    picked_up: "orange",
    on_the_way: "amber",
    delivered: "green",
    cancelled: "red",
    rejected: "gray",
    active: "green",
    inactive: "red",
    pending: "yellow",
    approved: "green",
  };
  return colors[status] || "gray";
};

// ─── Get status label (for badges) ─────────────────────────
export const getStatusLabel = (status) => {
  const labels = {
    placed: "Placed",
    confirmed: "Confirmed",
    preparing: "Preparing",
    ready_for_pickup: "Ready",
    rider_assigned: "Rider Assigned",
    picked_up: "Picked Up",
    on_the_way: "On the Way",
    delivered: "Delivered",
    cancelled: "Cancelled",
    rejected: "Rejected",
    active: "Active",
    inactive: "Inactive",
    pending: "Pending",
    approved: "Approved",
  };
  return labels[status] || status;
};

// ─── Generate a random ID (for temporary items) ───────────
export const generateTempId = () => {
  return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// ─── Debounce function ──────────────────────────────────────
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// ─── Throttle function ──────────────────────────────────────
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ─── Check if object is empty ──────────────────────────────
export const isEmptyObject = (obj) => {
  if (!obj) return true;
  return Object.keys(obj).length === 0;
};

// ─── Get image dimensions (for responsive images) ─────────
export const getImageDimensions = (
  width,
  height,
  maxWidth = 800,
  maxHeight = 600,
) => {
  const ratio = Math.min(maxWidth / width, maxHeight / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
};

// ─── Convert bytes to readable size ────────────────────────
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
