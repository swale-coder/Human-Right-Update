import api from './api'

export const memberService = {
  apply: async (payload) => {
    const { data } = await api.post('/members/apply', payload)
    return data
  },
  getMine: async () => {
    const { data } = await api.get('/members/me')
    return data
  },
  update: async (id, payload) => {
    const { data } = await api.patch(`/members/${id}`, payload)
    return data
  },
  uploadPhoto: async (id, file) => {
    const form = new FormData()
    form.append('photo', file)
    const { data } = await api.post(`/members/${id}/photo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
  uploadDocument: async (id, file) => {
    const form = new FormData()
    form.append('document', file)
    const { data } = await api.post(`/members/${id}/document`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
  requestRenewal: async (id) => {
    const { data } = await api.post(`/members/${id}/request-renewal`)
    return data
  },
  downloadCertificate: async (id) => {
    const response = await api.get(`/members/${id}/certificate`, { responseType: 'blob' })
    return response.data
  },
  downloadIdCard: async (id) => {
    const response = await api.get(`/members/${id}/id-card`, { responseType: 'blob' })
    return response.data
  },

  // Admin
  list: async (params) => {
    const { data } = await api.get('/members', { params })
    return data
  },
  getOne: async (id) => {
    const { data } = await api.get(`/members/${id}`)
    return data
  },
  approve: async (id) => {
    const { data } = await api.post(`/members/${id}/approve`)
    return data
  },
  reject: async (id, rejectionReason) => {
    const { data } = await api.post(`/members/${id}/reject`, { rejectionReason })
    return data
  },
  approveRenewal: async (id) => {
    const { data } = await api.post(`/members/${id}/approve-renewal`)
    return data
  },
  remove: async (id) => {
    const { data } = await api.delete(`/members/${id}`)
    return data
  },
  history: async (id) => {
    const { data } = await api.get(`/members/${id}/history`)
    return data
  },

  // Public verification (no auth)
  verify: async (membershipNumber) => {
    const { data } = await api.get(`/members/verify/${membershipNumber}`)
    return data
  },
}
