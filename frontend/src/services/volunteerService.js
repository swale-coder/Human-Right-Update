import api from './api'

export const volunteerService = {
  register: async (payload) => (await api.post('/volunteers/register', payload)).data,
  getMine: async () => (await api.get('/volunteers/mine')).data,
  list: async (params) => (await api.get('/volunteers', { params })).data,
  getOne: async (id) => (await api.get(`/volunteers/${id}`)).data,
  approve: async (id) => (await api.post(`/volunteers/${id}/approve`)).data,
  reject: async (id) => (await api.post(`/volunteers/${id}/reject`)).data,
  markAttendance: async (id, payload) => (await api.post(`/volunteers/${id}/attendance`, payload)).data,
  assignTask: async (id, payload) => (await api.post(`/volunteers/${id}/tasks`, payload)).data,
  updateTaskStatus: async (taskId, status) => (await api.patch(`/volunteers/tasks/${taskId}`, { status })).data,
  downloadCertificate: async (id) => (await api.get(`/volunteers/${id}/certificate`, { responseType: 'blob' })).data,
}
