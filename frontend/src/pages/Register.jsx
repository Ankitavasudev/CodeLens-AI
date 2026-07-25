import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../App'
import toast from 'react-hot-toast'
import { Code2 } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({ email: '', username: '', password: '', full_name: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center mx-auto mb-4">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-dark-300 mt-1">Start reviewing code with AI</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="text-sm text-dark-300 mb-1 block">Full Name</label>
            <input
              className="input-field"
              placeholder="Ankita Salaria"
              value={form.full_name}
              onChange={update('full_name')}
            />
          </div>
          <div>
            <label className="text-sm text-dark-300 mb-1 block">Username</label>
            <input
              className="input-field"
              placeholder="ankita"
              value={form.username}
              onChange={update('username')}
              required
            />
          </div>
          <div>
            <label className="text-sm text-dark-300 mb-1 block">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
              required
            />
          </div>
          <div>
            <label className="text-sm text-dark-300 mb-1 block">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={form.password}
              onChange={update('password')}
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          <p className="text-center text-sm text-dark-400">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-purple hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
