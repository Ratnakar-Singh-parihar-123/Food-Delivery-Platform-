// utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_TOKEN: '@tiffin_user_token',
  USER_DATA: '@tiffin_user_data',
  APPROVED: '@tiffin_approved',
};

export const storeToken = async token => {
  await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
};

export const storeUserData = async userData => {
  await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
};

export const getUserData = async () => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
  return data ? JSON.parse(data) : null;
};

export const setApproved = async status => {
  await AsyncStorage.setItem(STORAGE_KEYS.APPROVED, JSON.stringify(status));
};

export const getApproved = async () => {
  const status = await AsyncStorage.getItem(STORAGE_KEYS.APPROVED);
  return status ? JSON.parse(status) : false;
};

// ✅ Fixed: Use removeItem for each key instead of multiRemove
export const clearAll = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    await AsyncStorage.removeItem(STORAGE_KEYS.APPROVED);
  } catch (error) {
    console.warn('Error clearing storage:', error);
  }
};
