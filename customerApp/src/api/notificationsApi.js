import api from './axios';

// Get logged-in customer's notifications
export const getCustomerNotifications = async () => {
  const response = await api.get('/notifications');

  return response.data;
};

// Mark one notification as read
export const markNotificationAsRead = async notificationId => {
  const response = await api.patch(`/notifications/${notificationId}/read`);

  return response.data;
};

// Mark selected/all loaded notifications as read
export const markAllNotificationsAsRead = async notificationIds => {
  const response = await api.patch('/notifications/read-all', {
    notificationIds,
  });

  return response.data;
};
