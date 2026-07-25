from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.utils import hash_password, verify_password, create_token, get_current_user
from app.services.github_service import get_github_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str
    full_name: str = ""


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    id: int
    email: str | None
    username: str
    full_name: str | None
    avatar_url: str | None


@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(400, "Email already registered")
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(400, "Username taken")

    user = User(
        email=req.email,
        username=req.username,
        full_name=req.full_name,
        hashed_password=hash_password(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token(user.id)
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "username": user.username, "email": user.email},
    )


@router.post("/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")

    token = create_token(user.id)
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "username": user.username, "email": user.email},
    )


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    return UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        avatar_url=user.avatar_url,
    )


@router.get("/github")
def github_login():
    from app.config import get_settings
    s = get_settings()
    url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={s.GITHUB_CLIENT_ID}"
        f"&redirect_uri={s.GITHUB_REDIRECT_URI}"
        f"&scope=repo,user"
    )
    return {"url": url}


@router.get("/github/callback")
async def github_callback(code: str, db: Session = Depends(get_db)):
    import httpx
    from app.config import get_settings

    s = get_settings()

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://github.com/login/oauth/access_token",
            json={
                "client_id": s.GITHUB_CLIENT_ID,
                "client_secret": s.GITHUB_CLIENT_SECRET,
                "code": code,
            },
            headers={"Accept": "application/json"},
        )
        data = resp.json()
        access_token = data.get("access_token")

    if not access_token:
        raise HTTPException(400, "GitHub auth failed")

    gh_user = await get_github_user(access_token)

    user = db.query(User).filter(User.github_id == gh_user["id"]).first()
    if not user:
        user = db.query(User).filter(User.email == gh_user.get("email")).first()

    if user:
        user.github_id = gh_user["id"]
        user.github_token = access_token
        user.avatar_url = gh_user.get("avatar_url")
    else:
        user = User(
            email=gh_user.get("email"),
            username=gh_user["login"],
            full_name=gh_user.get("name"),
            avatar_url=gh_user.get("avatar_url"),
            github_id=gh_user["id"],
            github_token=access_token,
        )
        db.add(user)

    db.commit()
    db.refresh(user)

    token = create_token(user.id)
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "username": user.username, "email": user.email},
    )
