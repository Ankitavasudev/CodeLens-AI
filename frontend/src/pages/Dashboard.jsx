import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { reviewAPI } from '../services/api'
import { motion } from 'framer-motion'
import { Code2, Bug, TrendingUp, Clock, ArrowRight, Plus } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    reviewAPI.stats().then((r) => setStats(r.data))
    reviewAPI.history().then((r) => setHistory(r.data))
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-dark-300 mt-1">Your code review activity</p>
        </div>
        <Link to="/review" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Review
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Reviews', value: stats?.total_reviews || 0, icon: <Code2 className="w-5 h-5" />, color: 'text-accent-purple' },
          { label: 'Avg Quality', value: `${stats?.avg_score || 0}%`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-accent-green' },
          { label: 'Bugs Found', value: stats?.total_bugs || 0, icon: <Bug className="w-5 h-5" />, color: 'text-red-400' },
          { label: 'Languages', value: stats?.languages?.length || 0, icon: <Code2 className="w-5 h-5" />, color: 'text-accent-cyan' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className={`${s.color} mb-2`}>{s.icon}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-dark-400">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* History */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-dark-400" /> Recent Reviews
        </h2>
        {history.length === 0 ? (
          <div className="text-center py-12 text-dark-400">
            <Code2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No reviews yet. Start by reviewing some code!</p>
            <Link to="/review" className="btn-primary mt-4 inline-flex items-center gap-2">
              Review Code <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-4 bg-dark-900 rounded-xl border border-dark-700 hover:border-dark-500 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center text-accent-purple font-mono text-sm">
                    {r.language?.slice(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{r.title || 'Code Review'}</div>
                    <div className="text-sm text-dark-400">
                      {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-accent-green font-semibold">{r.quality_score}%</div>
                    <div className="text-dark-400 text-xs">Quality</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-400 font-semibold">{r.bugs_found}</div>
                    <div className="text-dark-400 text-xs">Bugs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-accent-blue font-semibold">{r.suggestions_count}</div>
                    <div className="text-dark-400 text-xs">Suggestions</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
