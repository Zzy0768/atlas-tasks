import axios from 'axios'
import { useAuthStore } from '../store/auth'

const client = axios.create({ baseURL: '/api' })

client.interceptors.request.use(config => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  console.log('API Request:', config.method?.toUpperCase(), config.url, config.data)
  return config
})

client.interceptors.response.use(
  r => {
    console.log('API Response:', r.config.method?.toUpperCase(), r.config.url, r.status)
    return r
  },
  err => {
    console.error('API Error:', err.config?.method?.toUpperCase(), err.config?.url, err.response?.status, err.response?.data)
    if (err.response?.status === 401) useAuthStore.getState().logout()
    return Promise.reject(err)
  }
)

export default client
