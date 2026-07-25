from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import AsyncOpenAI
import json, os, uuid

app = FastAPI(title="CodeLens AI")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))

snippets = {}

class CodeRequest(BaseModel):
    code: str
    language: str = "python"
    mode: str = "review"

class ShareRequest(BaseModel):
    code: str
    language: str = "python"
    title: str = "Untitled"

PROMPTS = {
    "review": """Return JSON:
{"score":85,"summary":"one line","bugs":[{"line":1,"severity":"high","msg":"what","fix":"how"}],"tips":[{"type":"perf|security|style","msg":"suggestion"}]}""",
    "explain": """Return JSON:
{"summary":"what code does","lines":[{"line":1,"code":"line","explain":"what it does"}],"concepts":["concept1"],"output":"expected output"}""",
    "refactor": """Return JSON:
{"improved":"refactored code","changes":["what changed and why"],"complexity":"before vs after"}""",
    "convert": """Return JSON:
{"converted_code":"code in target language","notes":"any differences"}"""
}

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.post("/api/analyze")
async def analyze(req: CodeRequest):
    if len(req.code.strip()) < 5:
        raise HTTPException(400, "Code too short")
    prompt = PROMPTS.get(req.mode, PROMPTS["review"])
    resp = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": f"You are CodeLens AI. {prompt}\nRules: Return ONLY valid JSON, no markdown, no explanation."},
            {"role": "user", "content": f"Language: {req.language}\n\n{req.code}"}
        ],
        temperature=0.3,
        response_format={"type": "json_object"},
    )
    return json.loads(resp.choices[0].message.content)

@app.post("/api/share")
async def share(req: ShareRequest):
    sid = uuid.uuid4().hex[:8]
    snippets[sid] = {"code": req.code, "language": req.language, "title": req.title}
    return {"id": sid, "url": f"/view/{sid}"}

@app.get("/api/snippet/{sid}")
def get_snippet(sid: str):
    if sid not in snippets:
        raise HTTPException(404, "Not found")
    return snippets[sid]

@app.get("/api/templates")
def templates():
    return [
        {"name": "Hello World", "language": "python", "code": 'print("Hello, World!")'},
        {"name": "FizzBuzz", "language": "python", "code": "for i in range(1, 101):\n    if i % 15 == 0: print('FizzBuzz')\n    elif i % 3 == 0: print('Fizz')\n    elif i % 5 == 0: print('Buzz')\n    else: print(i)"},
        {"name": "API Endpoint", "language": "javascript", "code": "const express = require('express');\nconst app = express();\n\napp.get('/api/users', (req, res) => {\n  res.json([\n    { id: 1, name: 'Alice' },\n    { id: 2, name: 'Bob' }\n  ]);\n});\n\napp.listen(3000);"},
        {"name": "React Component", "language": "javascript", "code": "import { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <h1>Count: {count}</h1>\n      <button onClick={() => setCount(count + 1)}>+1</button>\n    </div>\n  );\n}"},
        {"name": "Binary Search", "language": "python", "code": "def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1"},
        {"name": "Fetch API", "language": "javascript", "code": "async function fetchData(url) {\n  try {\n    const res = await fetch(url);\n    const data = await res.json();\n    console.log(data);\n    return data;\n  } catch (err) {\n    console.error('Error:', err);\n  }\n}"},
    ]
