import axios from 'axios'

// Base URL comes from a Vite env var (VITE_API_BASE), default to local backend on 8090.
const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:8090/api'

const api = axios.create({ baseURL })

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
export const bookSurvey = (payload) => api.post('/survey', payload).then((r) => r.data)
export const getLeads = (token) =>
  api.get('/leads', { headers: { 'X-Admin-Token': token } }).then((r) => r.data)

export default api
