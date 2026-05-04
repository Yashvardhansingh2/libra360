import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 20000,
})

// Users
export const createUser = (data) => api.post('/api/users/', data).then(r => r.data)
export const listUsers  = ()     => api.get('/api/users/').then(r => r.data)
export const getUser    = (id)   => api.get(`/api/users/${id}`).then(r => r.data)

// Goals
export const createGoal = (data)        => api.post('/api/goals/', data).then(r => r.data)
export const listGoals  = (userId)      => api.get('/api/goals/', { params: { user_id: userId } }).then(r => r.data)
export const updateGoal = (id, data)    => api.patch(`/api/goals/${id}`, data).then(r => r.data)
export const deleteGoal = (id)          => api.delete(`/api/goals/${id}`)

// Analytics
export const topUsers       = () => api.get('/api/analytics/top-users').then(r => r.data)
export const dashboardStats = () => api.get('/api/analytics/summary').then(r => r.data)

export default api
