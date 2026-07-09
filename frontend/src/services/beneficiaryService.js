import api from './api'

export const beneficiaryService = {
  create: async (payload) => (await api.post('/beneficiaries', payload)).data,
  list: async (params) => (await api.get('/beneficiaries', { params })).data,
  getOne: async (id) => (await api.get(`/beneficiaries/${id}`)).data,
  update: async (id, payload) => (await api.patch(`/beneficiaries/${id}`, payload)).data,
  remove: async (id) => (await api.delete(`/beneficiaries/${id}`)).data,
}
