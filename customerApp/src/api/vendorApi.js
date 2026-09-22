import api from './axios';

export const getNearbyVendors = async params => {
  const response = await api.get('/vendors/nearby', { params });
  return response.data;
};

export const getVendorById = async vendorId => {
  const response = await api.get(`/vendors/${vendorId}`);
  return response.data;
};
export const addVendorItem = async (vendorId, formData) => {
  const res = await api.post(`/vendors/${vendorId}/menu/items`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const updateVendorItem = async (vendorId, itemId, formData) => {
  const res = await api.put(
    `/vendors/${vendorId}/menu/items/${itemId}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return res.data;
};
export const getVendorItems = async vendorId => {
  const response = await api.get(`/vendors/${vendorId}/menu/items`);
  return response.data;
};
// api/vendorApi.js
export const getNearbyTiffinHouses = async params => {
  // The api instance already has a baseURL (e.g., '/api'), so we just need the remaining path.
  const response = await api.get('/house/tiffin/nearby', { params });
  return response.data;
};
