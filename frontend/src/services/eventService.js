import api from './api'

export const eventService = {
  listPublic: async () => (await api.get('/events/public')).data,
  registerForEvent: async (id, payload) => (await api.post(`/events/${id}/register`, payload)).data,
  submitFeedback: async (registrationId, payload) => (await api.post(`/events/registrations/${registrationId}/feedback`, payload)).data,
  create: async (payload) => (await api.post('/events', payload)).data,
  list: async (params) => (await api.get('/events', { params })).data,
  getOne: async (id) => (await api.get(`/events/${id}`)).data,
  update: async (id, payload) => (await api.patch(`/events/${id}`, payload)).data,
  remove: async (id) => (await api.delete(`/events/${id}`)).data,
  markAttendance: async (registrationId) => (await api.post(`/events/registrations/${registrationId}/attendance`)).data,
}
