import { useState, useEffect, createContext, useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { authAPI } from './services/api'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Review from './pages/Review'
import Navbar from './components/Navbar'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      authAPI.getMe()
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await authAPI.login(email, password)
    localStorage.setItem('token', res.data.access_token)
    setUser(res.data.user)
    return res.data
  }

  const register = async (data) => {
    const res = await authAPI.register(data)
    localStorage.setItem('token', res.data.access_token)
    setUser(res.data.user)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="animate-spin w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      <div className="min-h-screen bg-dark-900 text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/review" element={user ? <Review /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </AuthContext.Provider>
  )
}

export default App
