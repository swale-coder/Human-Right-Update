import api from './api'

export const notificationService = {
  list: async (params) => (await api.get('/notifications', { params })).data,
  markRead: async (id) => (await api.patch(`/notifications/${id}/read`)).data,
  markAllRead: async () => (await api.patch('/notifications/read-all')).data,
}
