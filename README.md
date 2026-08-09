# CodeLens AI

> AI-powered code review platform with real-time analysis, multi-language support, and automated suggestions.

[![CI](https://github.com/Ankitavasudev/CodeLens-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/Ankitavasudev/CodeLens-AI/actions)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://python.org)
[![React 18](https://img.shields.io/badge/react-18-61DAFB.svg)](https://reactjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Features

- **AI Code Analysis** - Automated code review with intelligent suggestions
- **Multi-language Support** - Python, JavaScript, TypeScript, Go, Java, and more
- **Real-time Feedback** - Instant analysis as you type
- **Security Scanning** - Detect vulnerabilities and anti-patterns
- **Performance Insights** - Identify bottlenecks and optimization opportunities
- **Code Quality Metrics** - Complexity, maintainability, and readability scores
- **GitHub Integration** - PR review automation

## Demo

```
┌─────────────────────────────────────────────────────────┐
│  CodeLens AI - Code Review Dashboard                    │
├─────────────────────────────────────────────────────────┤
│  File: src/api/auth.py                                  │
│  Language: Python                                       │
│                                                         │
│  Issues Found: 3                                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Line 15: Security - Hardcoded credentials       │   │
│  │ Line 23: Performance - N+1 query detected       │   │
│  │ Line 41: Style - Missing docstring              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Score: 72/100  ▓▓▓▓▓▓▓▓▓░░░  (Good)                  │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### Backend (Python)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend (React)

```bash
cd frontend
npm install
npm start
```

### API Usage

```bash
# Analyze code
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"code": "def hello(): print(\"world\")", "language": "python"}'

# Response
{
  "score": 85,
  "issues": [],
  "suggestions": ["Add type hints for better readability"],
  "metrics": {
    "complexity": 1,
    "maintainability": 95,
    "readability": 90
  }
}
```

## Architecture

```
CodeLens-AI/
├── backend/
│   ├── main.py              # FastAPI server
│   ├── analyzers/           # Language-specific analyzers
│   │   ├── python_analyzer.py
│   │   ├── js_analyzer.py
│   │   └── go_analyzer.py
│   ├── security/            # Security scanning rules
│   ├── metrics/             # Code quality metrics
│   └── tests/               # Backend tests
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── CodeEditor.jsx
│   │   │   ├── ResultsPanel.jsx
│   │   │   └── MetricsChart.jsx
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # API utilities
│   └── package.json
└── .github/workflows/       # CI/CD pipeline
```

## Analysis Rules

| Category | Rule | Severity |
|----------|------|----------|
| Security | Hardcoded credentials | HIGH |
| Security | SQL injection risk | HIGH |
| Security | XSS vulnerability | HIGH |
| Performance | N+1 query pattern | MEDIUM |
| Performance | Unnecessary loops | LOW |
| Style | Missing docstrings | INFO |
| Style | Complex functions | LOW |
| Quality | High cyclomatic complexity | MEDIUM |
| Quality | Deep nesting | LOW |

## Tech Stack

- **Backend**: Python, FastAPI, AST parsing, pylint, bandit
- **Frontend**: React 18, Monaco Editor, TailwindCSS
- **Database**: SQLite (dev), PostgreSQL (prod)
- **AI**: Custom rule engine + optional LLM integration
- **CI/CD**: GitHub Actions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Add tests for new analyzers
4. Ensure all tests pass (`pytest`)
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.