import axios from 'axios'

// Base URL comes from a Vite env var (VITE_API_BASE); the local backend fallback is dev-only
// so a production build never silently calls http://localhost on the visitor's machine.
const baseURL = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? 'http://localhost:8090/api' : '/api')

const api = axios.create({ baseURL, timeout: 60000 })

export const getHealth = () => api.get('/health').then((r) => r.data)
export const getDiscoms = () => api.get('/discoms').then((r) => r.data)
export const estimate = (payload) => api.post('/calculator/estimate', payload).then((r) => r.data)
export const analyzeBill = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api
    .post('/bill/analyze', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data)
}

export default api
