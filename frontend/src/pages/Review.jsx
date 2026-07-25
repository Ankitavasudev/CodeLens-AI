import { useState } from 'react'
import { reviewAPI, githubAPI } from '../services/api'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import {
  Code2, Bug, MessageSquare, Shield, Send, Loader2,
  GitBranch, FileCode, AlertTriangle, CheckCircle, Lightbulb
} from 'lucide-react'

const LANGUAGES = [
  'python', 'javascript', 'typescript', 'java', 'go', 'rust',
  'ruby', 'cpp', 'c', 'csharp', 'php', 'swift', 'kotlin',
]

const TABS = [
  { id: 'review', label: 'Code Review', icon: <Code2 className="w-4 h-4" /> },
  { id: 'explain', label: 'Explain', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'bugs', label: 'Bug Predictor', icon: <Bug className="w-4 h-4" /> },
  { id: 'chat', label: 'Ask AI', icon: <Send className="w-4 h-4" /> },
]

const SEVERITY_COLORS = {
  high: 'text-red-400 bg-red-500/10 border-red-500/20',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  low: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
}

export default function Review() {
  const [tab, setTab] = useState('review')
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState([])

  const handleReview = async () => {
    if (!code.trim()) return toast.error('Paste some code first')
    setLoading(true)
    setResult(null)
    try {
      const res = await reviewAPI.analyze({ code, language, title })
      setResult(res.data.result)
      toast.success('Review complete!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Review failed')
    } finally {
      setLoading(false)
    }
  }

  const handleExplain = async () => {
    if (!code.trim()) return toast.error('Paste some code first')
    setLoading(true)
    setResult(null)
    try {
      const res = await reviewAPI.explain({ code, language })
      setResult(res.data.result)
    } catch (err) {
      toast.error('Explanation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleBugs = async () => {
    if (!code.trim()) return toast.error('Paste some code first')
    setLoading(true)
    setResult(null)
    try {
      const res = await reviewAPI.predictBugs({ code, language })
      setResult(res.data.result)
    } catch (err) {
      toast.error('Bug prediction failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChat = async () => {
    if (!code.trim() || !chatInput.trim()) return
    setLoading(true)
    const msg = chatInput
    setChatInput('')
    setChatHistory((prev) => [...prev, { role: 'user', content: msg }])
    try {
      const res = await reviewAPI.chat({ code, question: msg, language })
      setChatHistory((prev) => [...prev, { role: 'ai', content: res.data.answer }])
    } catch (err) {
      toast.error('Chat failed')
    } finally {
      setLoading(false)
    }
  }

  const runAction = () => {
    if (tab === 'review') handleReview()
    else if (tab === 'explain') handleExplain()
    else if (tab === 'bugs') handleBugs()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">
        <span className="gradient-text">AI Code Review</span>
      </h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setResult(null); setChatHistory([]) }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  tab === t.id
                    ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30'
                    : 'bg-dark-800 text-dark-300 border border-dark-600 hover:border-dark-500'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Title + Language */}
          <div className="flex gap-3">
            <input
              className="input-field flex-1"
              placeholder="Review title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <select
              className="input-field w-40"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Code Editor */}
          <div className="relative">
            <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-dark-700">
                <FileCode className="w-4 h-4 text-dark-400" />
                <span className="text-xs text-dark-400 font-mono">Code Input</span>
              </div>
              <textarea
                className="w-full h-80 bg-transparent p-4 font-mono text-sm text-dark-100 resize-none focus:outline-none"
                placeholder={`# Paste your ${language} code here...\n\ndef hello_world():\n    print("Hello, World!")`}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={runAction}
            disabled={loading || !code.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {tab === 'review' && <Code2 className="w-5 h-5" />}
                {tab === 'explain' && <MessageSquare className="w-5 h-5" />}
                {tab === 'bugs' && <Bug className="w-5 h-5" />}
                {tab === 'chat' && <Send className="w-5 h-5" />}
                {tab === 'review' && 'Analyze Code'}
                {tab === 'explain' && 'Explain Code'}
                {tab === 'bugs' && 'Predict Bugs'}
                {tab === 'chat' && 'Ask'}
              </>
            )}
          </button>

          {/* Chat Input */}
          {tab === 'chat' && (
            <div className="flex gap-2">
              <input
                className="input-field flex-1"
                placeholder="Ask about this code..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChat()}
              />
              <button
                onClick={handleChat}
                disabled={loading}
                className="btn-primary !px-4"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          {loading && (
            <div className="card flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-accent-purple" />
            </div>
          )}

          {/* Chat History */}
          {tab === 'chat' && chatHistory.length > 0 && !loading && (
            <div className="card space-y-4 max-h-[600px] overflow-y-auto">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl ${
                    msg.role === 'user'
                      ? 'bg-accent-purple/10 border border-accent-purple/20 ml-8'
                      : 'bg-dark-900 border border-dark-700 mr-8'
                  }`}
                >
                  <div className="text-xs font-semibold mb-1 text-dark-400">
                    {msg.role === 'user' ? 'You' : 'CodeLens AI'}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                </div>
              ))}
            </div>
          )}

          {/* Review Results */}
          {!loading && result && tab === 'review' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Quality Score */}
              <div className="card text-center">
                <div className="text-5xl font-bold gradient-text mb-2">
                  {result.quality_score}%
                </div>
                <div className="text-dark-300">Code Quality Score</div>
                <div className="mt-3 h-2 bg-dark-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-purple to-accent-green rounded-full transition-all"
                    style={{ width: `${result.quality_score}%` }}
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="card">
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-dark-200 text-sm">{result.summary}</p>
              </div>

              {/* Bugs */}
              {result.bugs?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Bug className="w-4 h-4 text-red-400" />
                    Bugs Found ({result.bugs.length})
                  </h3>
                  <div className="space-y-3">
                    {result.bugs.map((bug, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border ${SEVERITY_COLORS[bug.severity]}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span className="text-xs font-semibold uppercase">{bug.severity}</span>
                          {bug.line && <span className="text-xs text-dark-400">Line {bug.line}</span>}
                        </div>
                        <p className="text-sm">{bug.description}</p>
                        {bug.fix && (
                          <p className="text-xs text-dark-300 mt-1">
                            <span className="font-semibold">Fix:</span> {bug.fix}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    Suggestions ({result.suggestions.length})
                  </h3>
                  <div className="space-y-3">
                    {result.suggestions.map((s, i) => (
                      <div key={i} className="p-3 bg-dark-900 rounded-xl border border-dark-700">
                        <div className="text-xs font-semibold text-accent-cyan mb-1 uppercase">
                          {s.type?.replace('_', ' ')}
                        </div>
                        <p className="text-sm">{s.description}</p>
                        {s.code_example && (
                          <pre className="mt-2 p-2 bg-dark-800 rounded-lg text-xs font-mono text-dark-200 overflow-x-auto">
                            {s.code_example}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Explanation */}
              {result.explanation && (
                <div className="card">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-accent-blue" />
                    Explanation
                  </h3>
                  <p className="text-dark-200 text-sm whitespace-pre-wrap">{result.explanation}</p>
                </div>
              )}

              {/* Refactored Code */}
              {result.refactored_code && (
                <div className="card">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-accent-green" />
                    Refactored Code
                  </h3>
                  <pre className="p-4 bg-dark-900 rounded-xl text-sm font-mono text-dark-200 overflow-x-auto">
                    {result.refactored_code}
                  </pre>
                </div>
              )}
            </motion.div>
          )}

          {/* Explain Results */}
          {!loading && result && tab === 'explain' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="card">
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-dark-200">{result.summary}</p>
              </div>

              {result.line_by_line?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold mb-3">Line-by-Line Explanation</h3>
                  <div className="space-y-2">
                    {result.line_by_line.map((l, i) => (
                      <div key={i} className="flex gap-3 p-3 bg-dark-900 rounded-xl">
                        <span className="text-dark-500 text-xs font-mono w-6 shrink-0">{l.line}</span>
                        <div>
                          <code className="text-accent-cyan text-xs font-mono block mb-1">{l.code}</code>
                          <p className="text-sm text-dark-200">{l.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.key_concepts?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold mb-2">Key Concepts</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.key_concepts.map((c, i) => (
                      <span key={i} className="px-3 py-1 bg-accent-purple/10 text-accent-purple text-sm rounded-full border border-accent-purple/20">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Bug Predict Results */}
          {!loading && result && tab === 'bugs' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="card text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-2">
                  {result.risk_score}%
                </div>
                <div className="text-dark-300">Risk Score</div>
              </div>

              {result.potential_bugs?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold mb-3">Potential Bugs</h3>
                  <div className="space-y-3">
                    {result.potential_bugs.map((bug, i) => (
                      <div key={i} className="p-4 bg-dark-900 rounded-xl border border-dark-700">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${
                            bug.probability === 'high' ? 'bg-red-500/20 text-red-400' :
                            bug.probability === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {bug.probability}
                          </span>
                          <span className="text-xs text-dark-400">{bug.type?.replace('_', ' ')}</span>
                        </div>
                        <p className="text-sm mb-2">{bug.description}</p>
                        <p className="text-xs text-dark-400"><span className="font-semibold">When:</span> {bug.scenario}</p>
                        <p className="text-xs text-accent-green mt-1"><span className="font-semibold">Prevention:</span> {bug.prevention}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.edge_cases?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold mb-2">Edge Cases</h3>
                  <ul className="space-y-1">
                    {result.edge_cases.map((e, i) => (
                      <li key={i} className="text-sm text-dark-200 flex items-start gap-2">
                        <span className="text-yellow-400">•</span> {e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && !result && tab !== 'chat' && (
            <div className="card flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-dark-700 flex items-center justify-center mb-4">
                {tab === 'review' && <Code2 className="w-8 h-8 text-dark-400" />}
                {tab === 'explain' && <MessageSquare className="w-8 h-8 text-dark-400" />}
                {tab === 'bugs' && <Bug className="w-8 h-8 text-dark-400" />}
              </div>
              <p className="text-dark-400">Paste code and click analyze to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
