import json
from openai import AsyncOpenAI
from app.config import get_settings

settings = get_settings()
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

REVIEW_SYSTEM_PROMPT = """You are CodeLens AI, an expert code reviewer. Analyze code and provide structured feedback.

Return your response as valid JSON with this exact structure:
{
    "summary": "One line summary of code quality",
    "quality_score": 85,
    "bugs": [
        {
            "severity": "high|medium|low",
            "line": 10,
            "description": "What the bug is",
            "fix": "How to fix it"
        }
    ],
    "suggestions": [
        {
            "type": "performance|security|readability|best_practice",
            "description": "Suggestion description",
            "code_example": "Improved code snippet"
        }
    ],
    "explanation": "Detailed explanation of the code in simple terms",
    "refactored_code": "The improved version of the code"
}

Rules:
- quality_score: 0-100 based on code quality
- Be specific about line numbers for bugs
- Provide actual code fixes, not just descriptions
- Explain code like teaching a junior developer
- If code is good, say so — don't invent problems
- Always return valid JSON, no markdown"""

EXPLAIN_SYSTEM_PROMPT = """You are CodeLens AI, a patient coding teacher. Explain code step-by-step.

Return your response as valid JSON:
{
    "summary": "One line what this code does",
    "language": "detected language",
    "line_by_line": [
        {
            "line": 1,
            "code": "the code on this line",
            "explanation": "what this line does"
        }
    ],
    "key_concepts": ["concept1", "concept2"],
    "output": "what the code outputs (if any)"
}

Make explanations simple enough for a beginner to understand."""

BUG_PREDICT_SYSTEM_PROMPT = """You are CodeLens AI, a bug prediction expert. Analyze code for potential issues.

Return valid JSON:
{
    "risk_score": 75,
    "potential_bugs": [
        {
            "probability": "high|medium|low",
            "type": "null_pointer|race_condition|memory_leak|logic_error|type_error|sql_injection|other",
            "description": "What could go wrong",
            "scenario": "When this bug would occur",
            "prevention": "How to prevent it"
        }
    ],
    "edge_cases": ["edge case 1", "edge case 2"],
    "recommendations": ["recommendation 1"]
}"""


async def review_code(code: str, language: str = "python") -> dict:
    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": REVIEW_SYSTEM_PROMPT},
            {"role": "user", "content": f"Review this {language} code:\n\n```{language}\n{code}\n```"}
        ],
        temperature=0.3,
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)


async def explain_code(code: str, language: str = "python") -> dict:
    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": EXPLAIN_SYSTEM_PROMPT},
            {"role": "user", "content": f"Explain this {language} code:\n\n```{language}\n{code}\n```"}
        ],
        temperature=0.3,
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)


async def predict_bugs(code: str, language: str = "python") -> dict:
    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": BUG_PREDICT_SYSTEM_PROMPT},
            {"role": "user", "content": f"Analyze this {language} code for potential bugs:\n\n```{language}\n{code}\n```"}
        ],
        temperature=0.3,
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)


async def chat_with_code(code: str, question: str, language: str = "python") -> str:
    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "You are CodeLens AI. Answer questions about the provided code. Be concise and helpful."},
            {"role": "user", "content": f"Code:\n```{language}\n{code}\n```\n\nQuestion: {question}"}
        ],
        temperature=0.5,
    )
    return response.choices[0].message.content
