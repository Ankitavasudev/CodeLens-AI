import { Link } from 'react-router-dom'
import { useAuth } from '../App'
import { Code2, LogOut, User } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">CodeLens AI</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-dark-300 hover:text-white transition-colors text-sm font-medium">
                Dashboard
              </Link>
              <Link to="/review" className="btn-primary text-sm !px-4 !py-2">
                New Review
              </Link>
              <div className="flex items-center gap-2 text-dark-300">
                <User className="w-4 h-4" />
                <span className="text-sm">{user.username}</span>
              </div>
              <button
                onClick={logout}
                className="text-dark-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-dark-300 hover:text-white transition-colors text-sm">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm !px-4 !py-2">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
