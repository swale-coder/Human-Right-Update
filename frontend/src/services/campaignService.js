import api from './api'

export const campaignService = {
  listPublic: async () => (await api.get('/campaigns/public')).data,
  getPublicOne: async (id) => (await api.get(`/campaigns/public/${id}`)).data,
  create: async (payload) => (await api.post('/campaigns', payload)).data,
  list: async (params) => (await api.get('/campaigns', { params })).data,
  getOne: async (id) => (await api.get(`/campaigns/${id}`)).data,
  update: async (id, payload) => (await api.patch(`/campaigns/${id}`, payload)).data,
  addUpdate: async (id, payload) => (await api.post(`/campaigns/${id}/updates`, payload)).data,
  remove: async (id) => (await api.delete(`/campaigns/${id}`)).data,
}
