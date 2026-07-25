import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code2, Bug, MessageSquare, GitBranch, Zap, Shield, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: <Code2 className="w-6 h-6" />,
    title: 'AI Code Review',
    desc: 'Paste code or connect GitHub repo. Get expert-level review in seconds.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: <Bug className="w-6 h-6" />,
    title: 'Bug Prediction',
    desc: 'AI detects potential bugs before they reach production.',
    color: 'from-red-500 to-orange-500',
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Code Explanation',
    desc: 'Understand any codebase with step-by-step AI explanations.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <GitBranch className="w-6 h-6" />,
    title: 'GitHub Integration',
    desc: 'Connect repos, browse files, and review directly from GitHub.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Quality Scores',
    desc: 'Track code quality metrics across your projects over time.',
    color: 'from-yellow-500 to-amber-500',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Security Scanner',
    desc: 'Detect vulnerabilities and security issues in your code.',
    color: 'from-indigo-500 to-violet-500',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-purple/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent-purple/10 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-dark-800 border border-dark-600 rounded-full px-4 py-2 mb-8">
              <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
              <span className="text-sm text-dark-300">Powered by GPT-4o</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              AI Code Review
              <br />
              <span className="gradient-text">& Intelligence Platform</span>
            </h1>

            <p className="text-lg md:text-xl text-dark-300 max-w-2xl mx-auto mb-10">
              Get expert-level code reviews, bug detection, and code explanations
              powered by AI. Ship better code, faster.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg flex items-center gap-2">
                Start Reviewing Code
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#features" className="btn-secondary text-lg">
                See How It Works
              </a>
            </div>
          </motion.div>

          {/* Code Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 mx-auto max-w-3xl"
          >
            <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden shadow-2xl shadow-accent-purple/10">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-dark-700">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs text-dark-400 font-mono">review.py — CodeLens AI</span>
              </div>
              <div className="p-6 font-mono text-sm text-left">
                <div className="text-dark-400 mb-2">{'# Paste your code and get instant AI review'}</div>
                <div className="text-purple-400">def <span className="text-blue-400">calculate_discount</span><span className="text-dark-200">(price, rate):</span></div>
                <div className="pl-4 text-dark-200">return price * rate</div>
                <div className="mt-4 p-4 bg-accent-green/5 border border-accent-green/20 rounded-xl">
                  <div className="text-accent-green text-xs font-semibold mb-1">AI Suggestion</div>
                  <div className="text-dark-200 text-sm">Add input validation and type hints for production safety</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Everything you need to <span className="gradient-text">ship better code</span>
          </h2>
          <p className="text-dark-300 text-center mb-12 max-w-xl mx-auto">
            From instant reviews to deep bug analysis — one platform for all your code quality needs.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card group hover:scale-[1.02]"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-dark-300 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card bg-gradient-to-br from-dark-800 to-dark-900 border-accent-purple/20">
            <h2 className="text-3xl font-bold mb-4">Ready to review your code?</h2>
            <p className="text-dark-300 mb-8">Join developers shipping better code with AI-powered reviews.</p>
            <Link to="/register" className="btn-primary text-lg inline-flex items-center gap-2">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-700 py-8 px-4 text-center text-dark-400 text-sm">
        <p>Built by Ankita Salaria — CS Student & AI/ML Developer</p>
      </footer>
    </div>
  )
}
