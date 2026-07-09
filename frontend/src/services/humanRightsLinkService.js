import api from './api'

export const humanRightsLinkService = {
  listPublic: async () => (await api.get('/human-rights-links/public')).data,
  list: async (params) => (await api.get('/human-rights-links', { params })).data,
  create: async (payload) => (await api.post('/human-rights-links', payload)).data,
  update: async (id, payload) => (await api.patch(`/human-rights-links/${id}`, payload)).data,
  remove: async (id) => (await api.delete(`/human-rights-links/${id}`)).data,
}
