from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)

    hashed_password = Column(String, nullable=True)
    github_id = Column(Integer, unique=True, nullable=True)
    github_token = Column(String, nullable=True)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    reviews = relationship("Review", back_populates="owner")
