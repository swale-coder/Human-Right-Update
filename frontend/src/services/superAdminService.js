import api from './api'

export const superAdminService = {
  listStates: async () => (await api.get('/super-admin/states')).data,
  createState: async (payload) => (await api.post('/super-admin/states', payload)).data,
  listDistricts: async (stateId) => (await api.get('/super-admin/districts', { params: { stateId } })).data,
  createDistrict: async (payload) => (await api.post('/super-admin/districts', payload)).data,
  listTalukas: async (districtId) => (await api.get('/super-admin/talukas', { params: { districtId } })).data,
  createTaluka: async (payload) => (await api.post('/super-admin/talukas', payload)).data,
  listCities: async (talukaId) => (await api.get('/super-admin/cities', { params: { talukaId } })).data,
  createCity: async (payload) => (await api.post('/super-admin/cities', payload)).data,
  updateUserRole: async (userId, payload) => (await api.patch(`/super-admin/users/${userId}/role`, payload)).data,
  updateUserStatus: async (userId, status) => (await api.patch(`/super-admin/users/${userId}/status`, { status })).data,
  listActivityLogs: async (params) => (await api.get('/super-admin/activity-logs', { params })).data,
  getSettings: async () => (await api.get('/super-admin/settings')).data,
  updateSetting: async (key, value) => (await api.put('/super-admin/settings', { key, value })).data,
  listUsers: async (params) => (await api.get('/users', { params })).data,
}
