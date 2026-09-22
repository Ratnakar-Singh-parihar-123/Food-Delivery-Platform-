import axios from './axios';

// ─── GET ALL ADDRESSES ────────────────────────────────────
export const getAddresses = async () => {
  console.log('Fetching addresses');
  const { data } = await axios.get('/customers/addresses');
  return data;
};

// ─── ADD NEW ADDRESS ──────────────────────────────────────
export const addAddress = async payload => {
  console.log('Adding new address', payload);
  const { data } = await axios.post('/customers/addresses', payload);
  return data;
};

// ─── UPDATE ADDRESS ───────────────────────────────────────
export const updateAddress = async (addressId, payload) => {
  const { data } = await axios.patch(
    `/customers/addresses/${addressId}`,
    payload,
  );
  return data;
};

// ─── DELETE ADDRESS ───────────────────────────────────────
export const deleteAddress = async addressId => {
  const { data } = await axios.delete(`/customers/addresses/${addressId}`);
  return data;
};

// ─── SET DEFAULT ADDRESS ──────────────────────────────────
export const setDefaultAddress = async addressId => {
  const { data } = await axios.patch(
    `/customers/addresses/${addressId}/default`,
  );
  return data;
};
