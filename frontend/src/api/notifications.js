import client from './client';

export const notificationsAPI = {
  getNotifications: () => client.get('/notifications'),
  markRead: (id) => client.put(`/notifications/${id}/read`),
  markAllRead: () => client.put('/notifications/read-all'),
};
