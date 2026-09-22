import api from "./axios";

export const registerRiderApi = async (formData) => {
  const response = await api.post("/rider/register", formData);

  return response.data;
};

export const verifyRiderEmailApi = async (data) => {
  const response = await api.post("/rider/verify/email", data);

  return response.data;
};

export const resendRiderOtpApi = async (email) => {
  const response = await api.post("/rider/resend/otp", {
    email,
  });

  return response.data;
};

export const loginRiderApi = async (data) => {
  const response = await api.post("/rider/login", data);

  return response.data;
};

export const getRiderProfileApi = async () => {
  const response = await api.get("/rider/profile");

  return response.data;
};

export const updateRiderOnlineStatusApi = async (isOnline) => {
  const response = await api.patch("/rider/online/status", {
    isOnline,
  });

  return response.data;
};

export const updateRiderLocationApi = async (latitude, longitude) => {
  const response = await api.patch("/rider/location", {
    latitude,
    longitude,
  });

  return response.data;
};
