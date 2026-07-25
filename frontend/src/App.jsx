import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Code2, Bug, Sparkles, Wand2, Share2, Copy, Check, ChevronDown,
  Lightbulb, Shield, Zap, MessageSquare, ArrowRight, Loader2,
  FileCode, RefreshCw, BookOpen, GitBranch
} from 'lucide-react'

const LANGUAGES = ['python', 'javascript', 'typescript', 'java', 'go', 'rust', 'cpp', 'c', 'ruby', 'php']

const TEMPLATES = [
  { name: 'Hello World', lang: 'python', code: 'print("Hello, World!")' },
  { name: 'FizzBuzz', lang: 'python', code: "for i in range(1, 101):\n    if i % 15 == 0: print('FizzBuzz')\n    elif i % 3 == 0: print('Fizz')\n    elif i % 5 == 0: print('Buzz')\n    else: print(i)" },
  { name: 'API Endpoint', lang: 'javascript', code: "const express = require('express');\nconst app = express();\n\napp.get('/api/users', (req, res) => {\n  res.json([\n    { id: 1, name: 'Alice' },\n    { id: 2, name: 'Bob' }\n  ]);\n});\n\napp.listen(3000);" },
  { name: 'React Component', lang: 'javascript', code: "import { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <h1>Count: {count}</h1>\n      <button onClick={() => setCount(count + 1)}>+1</button>\n    </div>\n  );\n}" },
  { name: 'Binary Search', lang: 'python', code: "def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1" },
  { name: 'Fetch API', lang: 'javascript', code: "async function fetchData(url) {\n  try {\n    const res = await fetch(url);\n    const data = await res.json();\n    console.log(data);\n    return data;\n  } catch (err) {\n    console.error('Error:', err);\n  }\n}" },
  { name: 'Bubble Sort', lang: 'python', code: "def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr" },
  { name: 'Class Example', lang: 'python', code: "class BankAccount:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self.balance = balance\n    \n    def deposit(self, amount):\n        self.balance += amount\n        return self.balance\n    \n    def withdraw(self, amount):\n        if amount > self.balance:\n            raise ValueError('Insufficient funds')\n        self.balance -= amount\n        return self.balance\n\nacc = BankAccount('Alice', 1000)\nprint(acc.deposit(500))\nprint(acc.withdraw(200))" },
]

const MODES = [
  { id: 'review', label: 'Code Review', icon: <Code2 className="w-4 h-4" />, color: 'lens-purple' },
  { id: 'explain', label: 'Explain', icon: <BookOpen className="w-4 h-4" />, color: 'lens-blue' },
  { id: 'refactor', label: 'Refactor', icon: <Wand2 className="w-4 h-4" />, color: 'lens-cyan' },
  { id: 'convert', label: 'Convert', icon: <GitBranch className="w-4 h-4" />, color: 'lens-pink' },
]

const SEVERITY = {
  high: 'bg-red-500/10 border-red-500/30 text-red-400',
  medium: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  low: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
}

export default function App() {
  const [code, setCode] = useState(TEMPLATES[0].code)
  const [language, setLanguage] = useState('python')
  const [mode, setMode] = useState('review')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [convertLang, setConvertLang] = useState('javascript')
  const [history, setHistory] = useState([])

  const loadTemplate = (t) => {
    setCode(t.code)
    setLanguage(t.lang)
    setShowTemplates(false)
    setResult(null)
  }

  const analyze = async () => {
    if (!code.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const body = { code, language, mode }
      if (mode === 'convert') body.language = `${language} to ${convertLang}`
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      setResult(data)
      setHistory(prev => [{ mode, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)])
    } catch (e) {
      setResult({ error: 'Analysis failed. Make sure API key is set.' })
    }
    setLoading(false)
  }

  const share = async () => {
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, title: 'Shared Code' }),
      })
      const data = await res.json()
      setShareUrl(`${window.location.origin}/view/${data.id}`)
    } catch (e) {}
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="border-b border-dark-700 bg-dark-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lens-purple to-lens-blue flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg hidden sm:block">CodeLens <span className="text-lens-purple">AI</span></span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-600 text-sm text-dark-300 hover:text-white hover:border-dark-500 transition-all">
              <FileCode className="w-4 h-4" /> Templates <ChevronDown className="w-3 h-3" />
            </button>
            <button onClick={share}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-600 text-sm text-dark-300 hover:text-lens-green hover:border-lens-green/30 transition-all">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      </header>

      {/* Templates Dropdown */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 right-4 z-50 bg-dark-800 border border-dark-600 rounded-xl p-3 shadow-2xl w-72">
            <div className="text-xs text-dark-400 mb-2 font-medium">Load a template</div>
            {TEMPLATES.map((t, i) => (
              <button key={i} onClick={() => loadTemplate(t)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-dark-700 transition-colors flex items-center justify-between group">
                <span className="text-sm">{t.name}</span>
                <span className="text-xs text-dark-500 group-hover:text-lens-purple">{t.lang}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share URL Toast */}
      <AnimatePresence>
        {shareUrl && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-dark-800 border border-lens-green/30 rounded-xl px-5 py-3 flex items-center gap-3 shadow-2xl">
            <span className="text-sm text-dark-200 font-mono">{shareUrl}</span>
            <button onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
              className="text-lens-green hover:text-lens-green/80">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            <button onClick={() => setShareUrl('')} className="text-dark-400 hover:text-white ml-2">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="max-w-[1800px] mx-auto p-4 grid lg:grid-cols-2 gap-4" style={{ height: 'calc(100vh - 56px)' }}>
        {/* Left: Code Editor */}
        <div className="flex flex-col gap-3 min-h-0">
          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <select value={language} onChange={e => setLanguage(e.target.value)}
              className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-lens-purple">
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>

            <div className="h-5 w-px bg-dark-600" />

            {MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  mode === m.id
                    ? `bg-${m.color}/15 text-${m.color} border border-${m.color}/30`
                    : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'
                }`}>
                {m.icon} {m.label}
              </button>
            ))}

            {mode === 'convert' && (
              <>
                <span className="text-dark-500 text-sm">→</span>
                <select value={convertLang} onChange={e => setConvertLang(e.target.value)}
                  className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-lens-pink">
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </>
            )}

            <div className="ml-auto flex items-center gap-2">
              <button onClick={copyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-dark-400 hover:text-white hover:bg-dark-800 transition-all">
                {copied ? <Check className="w-4 h-4 text-lens-green" /> : <Copy className="w-4 h-4" />}
              </button>
              <button onClick={analyze} disabled={loading || !code.trim()}
                className="flex items-center gap-2 bg-gradient-to-r from-lens-purple to-lens-blue px-5 py-1.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 min-h-0 bg-dark-900 border border-dark-700 rounded-xl overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-dark-700 bg-dark-800/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-dark-400 font-mono ml-2">editor.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : language.slice(0, 2)}</span>
            </div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full bg-transparent p-4 text-sm text-dark-200 resize-none focus:outline-none leading-relaxed"
              placeholder="Write or paste your code here..."
              style={{ tabSize: 2 }}
            />
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {history.map((h, i) => (
                <span key={i} className="shrink-0 text-xs px-2 py-1 rounded-md bg-dark-800 border border-dark-700 text-dark-400">
                  {h.mode} · {h.time}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: Results */}
        <div className="flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto bg-dark-900 border border-dark-700 rounded-xl p-5">
            {loading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lens-purple/20 to-lens-blue/20 flex items-center justify-center animate-glow">
                  <Sparkles className="w-8 h-8 text-lens-purple animate-pulse" />
                </div>
                <p className="text-dark-400 text-sm">AI is analyzing your code...</p>
              </div>
            )}

            {!loading && !result && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-dark-800 flex items-center justify-center">
                  <Code2 className="w-10 h-10 text-dark-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-dark-300">Write code, get AI insights</h3>
                  <p className="text-sm text-dark-500 mt-1">Paste code or load a template, then click Analyze</p>
                </div>
              </div>
            )}

            {!loading && result && result.error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {result.error}
              </div>
            )}

            {/* Review Results */}
            {!loading && result && result.score !== undefined && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Score */}
                <div className="text-center py-4">
                  <div className="text-6xl font-bold bg-gradient-to-r from-lens-purple via-lens-blue to-lens-cyan bg-clip-text text-transparent">
                    {result.score}%
                  </div>
                  <p className="text-dark-400 mt-1">{result.summary}</p>
                </div>

                {/* Bugs */}
                {result.bugs?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2"><Bug className="w-4 h-4 text-red-400" /> Bugs ({result.bugs.length})</h3>
                    <div className="space-y-2">
                      {result.bugs.map((b, i) => (
                        <div key={i} className={`p-3 rounded-xl border text-sm ${SEVERITY[b.severity] || SEVERITY.low}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase">{b.severity}</span>
                            {b.line && <span className="text-dark-500 text-xs">Line {b.line}</span>}
                          </div>
                          <p>{b.msg}</p>
                          {b.fix && <p className="text-xs mt-1 opacity-80">Fix: {b.fix}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {result.tips?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-yellow-400" /> Suggestions</h3>
                    <div className="space-y-2">
                      {result.tips.map((t, i) => (
                        <div key={i} className="p-3 bg-dark-800 rounded-xl border border-dark-700 text-sm">
                          <span className="text-xs font-medium text-lens-cyan uppercase">{t.type}</span>
                          <p className="mt-1">{t.msg}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Explain Results */}
            {!loading && result && result.lines && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="p-4 bg-lens-blue/5 border border-lens-blue/20 rounded-xl">
                  <h3 className="font-semibold mb-1">Summary</h3>
                  <p className="text-sm text-dark-200">{result.summary}</p>
                </div>

                <div className="space-y-1">
                  {result.lines.map((l, i) => (
                    <div key={i} className="flex gap-3 p-2 rounded-lg hover:bg-dark-800 transition-colors">
                      <span className="text-dark-600 text-xs font-mono w-6 text-right shrink-0 pt-0.5">{l.line}</span>
                      <div className="min-w-0">
                        <code className="text-lens-cyan text-xs font-mono block">{l.code}</code>
                        <p className="text-xs text-dark-300 mt-0.5">{l.explain}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {result.concepts?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Key Concepts</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.concepts.map((c, i) => (
                        <span key={i} className="px-2.5 py-1 bg-lens-purple/10 text-lens-purple text-xs rounded-full border border-lens-purple/20">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Refactor Results */}
            {!loading && result && result.improved && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="p-4 bg-lens-cyan/5 border border-lens-cyan/20 rounded-xl">
                  <h3 className="font-semibold mb-2 flex items-center gap-2"><Wand2 className="w-4 h-4 text-lens-cyan" /> Refactored Code</h3>
                  <pre className="text-sm font-mono text-dark-200 whitespace-pre-wrap bg-dark-900 p-3 rounded-lg">{result.improved}</pre>
                </div>
                {result.changes?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Changes Made</h4>
                    <ul className="space-y-1">
                      {result.changes.map((c, i) => (
                        <li key={i} className="text-sm text-dark-300 flex items-start gap-2">
                          <span className="text-lens-cyan mt-1">▸</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}

            {/* Convert Results */}
            {!loading && result && result.converted_code && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="p-4 bg-lens-pink/5 border border-lens-pink/20 rounded-xl">
                  <h3 className="font-semibold mb-2">Converted Code</h3>
                  <pre className="text-sm font-mono text-dark-200 whitespace-pre-wrap bg-dark-900 p-3 rounded-lg">{result.converted_code}</pre>
                </div>
                {result.notes && (
                  <p className="text-sm text-dark-400">{result.notes}</p>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
