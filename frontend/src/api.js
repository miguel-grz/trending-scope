import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

export const getTrending = (period = 'daily', language = 'all') =>
  client.get('/trending', { params: { period, language } }).then((r) => r.data)

export const getRepoHistory = (owner, name) =>
  client.get(`/repo/${owner}/${name}/history`).then((r) => r.data)

export const getLanguages = () => client.get('/languages').then((r) => r.data)

export const getStats = () => client.get('/stats').then((r) => r.data)

export const getLeaderboard = () => client.get('/leaderboard').then((r) => r.data)
