import axios from 'axios'

const API = axios.create({ baseURL: '/api' })

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (email, password) =>
    API.post('/auth/login', new URLSearchParams({ username: email, password })),
  getMe: () => API.get('/auth/me'),
  getGitHubUrl: () => API.get('/auth/github'),
}

export const reviewAPI = {
  analyze: (data) => API.post('/review/analyze', data),
  explain: (data) => API.post('/review/explain', data),
  predictBugs: (data) => API.post('/review/predict-bugs', data),
  chat: (data) => API.post('/review/chat', data),
  history: () => API.get('/review/history'),
  stats: () => API.get('/review/stats'),
}

export const githubAPI = {
  repos: () => API.get('/github/repos'),
  files: (owner, repo, path = '') =>
    API.get(`/github/repos/${owner}/${repo}/files`, { params: { path } }),
  fileContent: (owner, repo, path) =>
    API.post('/github/file-content', { owner, repo, path }),
}

export default API
