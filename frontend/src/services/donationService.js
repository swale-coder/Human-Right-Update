import api from './api'

export const donationService = {
  createOrder: async (payload) => {
    const { data } = await api.post('/donations/online/create-order', payload)
    return data
  },
  verifyPayment: async (payload) => {
    const { data } = await api.post('/donations/online/verify', payload)
    return data
  },
  recordOffline: async (payload) => {
    const { data } = await api.post('/donations/offline', payload)
    return data
  },
  getMine: async () => {
    const { data } = await api.get('/donations/mine')
    return data
  },
  list: async (params) => {
    const { data } = await api.get('/donations', { params })
    return data
  },
  getOne: async (id) => {
    const { data } = await api.get(`/donations/${id}`)
    return data
  },
  summary: async (params) => {
    const { data } = await api.get('/donations/reports/summary', { params })
    return data
  },
  downloadReceipt: async (id) => {
    const response = await api.get(`/donations/${id}/receipt`, { responseType: 'blob' })
    return response.data
  },
  download80G: async (id) => {
    const response = await api.get(`/donations/${id}/80g-receipt`, { responseType: 'blob' })
    return response.data
  },
}

/** Dynamically loads the Razorpay checkout script (no-op if already loaded). */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}
