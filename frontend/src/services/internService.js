import api from './api'

export const internService = {
  register: async (payload) => (await api.post('/interns/register', payload)).data,
  getMine: async () => (await api.get('/interns/mine')).data,
  addDailyReport: async (id, payload) => (await api.post(`/interns/${id}/daily-report`, payload)).data,
  list: async (params) => (await api.get('/interns', { params })).data,
  getOne: async (id) => (await api.get(`/interns/${id}`)).data,
  approve: async (id, mentorId) => (await api.post(`/interns/${id}/approve`, { mentorId })).data,
  reject: async (id) => (await api.post(`/interns/${id}/reject`)).data,
  assignMentor: async (id, mentorId) => (await api.post(`/interns/${id}/mentor`, { mentorId })).data,
  markAttendance: async (id, payload) => (await api.post(`/interns/${id}/attendance`, payload)).data,
  evaluate: async (id, score, remarks) => (await api.post(`/interns/${id}/evaluate`, { score, remarks })).data,
  downloadCertificate: async (id) => (await api.get(`/interns/${id}/certificate`, { responseType: 'blob' })).data,
}
