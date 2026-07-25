from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    title = Column(String, nullable=True)
    code = Column(Text, nullable=False)
    language = Column(String, default="python")
    source = Column(String, default="manual")

    review_result = Column(JSON, nullable=True)
    explanation = Column(Text, nullable=True)
    bugs_found = Column(Integer, default=0)
    suggestions_count = Column(Integer, default=0)
    quality_score = Column(Integer, default=0)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="reviews")
