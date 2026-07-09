import api from './api'

export const complaintService = {
  register: async (payload) => {
    const { data } = await api.post('/complaints', payload)
    return data
  },
  getMine: async () => {
    const { data } = await api.get('/complaints/mine')
    return data
  },
  list: async (params) => {
    const { data } = await api.get('/complaints', { params })
    return data
  },
  getOne: async (id) => {
    const { data } = await api.get(`/complaints/${id}`)
    return data
  },
  update: async (id, payload) => {
    const { data } = await api.patch(`/complaints/${id}`, payload)
    return data
  },
  resolve: async (id, resolutionSummary) => {
    const { data } = await api.post(`/complaints/${id}/resolve`, { resolutionSummary })
    return data
  },
  uploadEvidence: async (id, file) => {
    const form = new FormData()
    form.append('evidence', file)
    const { data } = await api.post(`/complaints/${id}/evidence`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
  getNotes: async (id) => {
    const { data } = await api.get(`/complaints/${id}/notes`)
    return data
  },
  addNote: async (id, note) => {
    const { data } = await api.post(`/complaints/${id}/notes`, { note })
    return data
  },
  summary: async () => {
    const { data } = await api.get('/complaints/reports/summary')
    return data
  },
  listOfficers: async () => {
    const { data } = await api.get('/users', { params: { limit: 100 } })
    return data
  },
}
