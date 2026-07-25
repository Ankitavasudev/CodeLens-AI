from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.models.review import Review
from app.utils import get_current_user
from app.services.ai_service import review_code, explain_code, predict_bugs, chat_with_code

router = APIRouter(prefix="/api/review", tags=["review"])


class CodeReviewRequest(BaseModel):
    code: str
    language: str = "python"
    title: str = ""


class ExplainRequest(BaseModel):
    code: str
    language: str = "python"


class BugPredictRequest(BaseModel):
    code: str
    language: str = "python"


class ChatRequest(BaseModel):
    code: str
    question: str
    language: str = "python"


@router.post("/analyze")
async def analyze_code(
    req: CodeReviewRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if len(req.code.strip()) < 10:
        raise HTTPException(400, "Code too short")
    if len(req.code) > 50000:
        raise HTTPException(400, "Code too long (max 50k chars)")

    result = await review_code(req.code, req.language)

    review = Review(
        user_id=user.id,
        title=req.title or "Code Review",
        code=req.code,
        language=req.language,
        source="manual",
        review_result=result,
        explanation=result.get("explanation", ""),
        bugs_found=len(result.get("bugs", [])),
        suggestions_count=len(result.get("suggestions", [])),
        quality_score=result.get("quality_score", 0),
    )
    db.add(review)
    db.commit()

    return {"review_id": review.id, "result": result}


@router.post("/explain")
async def explain(req: ExplainRequest, user: User = Depends(get_current_user)):
    if len(req.code.strip()) < 5:
        raise HTTPException(400, "Code too short")
    result = await explain_code(req.code, req.language)
    return {"result": result}


@router.post("/predict-bugs")
async def predict(req: BugPredictRequest, user: User = Depends(get_current_user)):
    if len(req.code.strip()) < 10:
        raise HTTPException(400, "Code too short")
    result = await predict_bugs(req.code, req.language)
    return {"result": result}


@router.post("/chat")
async def chat(req: ChatRequest, user: User = Depends(get_current_user)):
    answer = await chat_with_code(req.code, req.question, req.language)
    return {"answer": answer}


@router.get("/history")
def get_history(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reviews = (
        db.query(Review)
        .filter(Review.user_id == user.id)
        .order_by(Review.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": r.id,
            "title": r.title,
            "language": r.language,
            "quality_score": r.quality_score,
            "bugs_found": r.bugs_found,
            "suggestions_count": r.suggestions_count,
            "created_at": r.created_at.isoformat(),
        }
        for r in reviews
    ]


@router.get("/stats")
def get_stats(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.user_id == user.id).all()
    if not reviews:
        return {"total_reviews": 0, "avg_score": 0, "total_bugs": 0, "languages": []}

    scores = [r.quality_score for r in reviews if r.quality_score]
    return {
        "total_reviews": len(reviews),
        "avg_score": round(sum(scores) / len(scores)) if scores else 0,
        "total_bugs": sum(r.bugs_found for r in reviews),
        "total_suggestions": sum(r.suggestions_count for r in reviews),
        "languages": list(set(r.language for r in reviews)),
    }
