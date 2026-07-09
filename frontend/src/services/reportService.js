import api from './api'

export const reportService = {
  dashboard: async () => (await api.get('/reports/dashboard')).data,
  exportExcel: async (module) => (await api.get(`/reports/export/${module}`, { responseType: 'blob' })).data,
}
