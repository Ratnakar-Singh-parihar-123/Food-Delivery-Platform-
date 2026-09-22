// src/api/iconApi.js
import api from "./axios";

// ─── Get all icons ──────────────────────────────────────────
export const getIcons = async () => {
  const response = await api.get("/icons");
  return response.data;
};

// ─── Create a new icon (supports FormData) ─────────────────
export const createIcon = async (data) => {
  const response = await api.post("/icons", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// ─── Update an icon (supports FormData) ─────────────────────
export const updateIcon = async (iconId, data) => {
  const response = await api.put(`/icons/${iconId}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// ─── Delete an icon ──────────────────────────────────────────
export const deleteIcon = async (iconId) => {
  const response = await api.delete(`/icons/${iconId}`);
  return response.data;
};
