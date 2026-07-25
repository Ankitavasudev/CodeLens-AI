import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../App'
import toast from 'react-hot-toast'
import { Code2 } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center mx-auto mb-4">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-dark-300 mt-1">Sign in to continue reviewing code</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="text-sm text-dark-300 mb-1 block">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-dark-300 mb-1 block">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-sm text-dark-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent-purple hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
