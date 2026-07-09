import api from './api'

export const authService = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    return data
  },
  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    return data
  },
  logout: async () => {
    const refreshToken = localStorage.getItem('hrpc_refresh_token')
    const { data } = await api.post('/auth/logout', { refreshToken })
    return data
  },
  forgotPassword: async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email })
    return data
  },
  resetPassword: async (token, password) => {
    const { data } = await api.post('/auth/reset-password', { token, password })
    return data
  },
  changePassword: async (currentPassword, newPassword) => {
    const { data } = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    })
    return data
  },
  getProfile: async () => {
    const { data } = await api.get('/auth/profile')
    return data
  },
}
