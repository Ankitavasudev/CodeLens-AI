from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.models.user import User
from app.utils import get_current_user
from app.services.github_service import (
    get_user_repos,
    get_repo_files,
    get_file_content,
    get_repo_tree,
)

router = APIRouter(prefix="/api/github", tags=["github"])


class FileContentRequest(BaseModel):
    owner: str
    repo: str
    path: str


@router.get("/repos")
async def list_repos(user: User = Depends(get_current_user)):
    if not user.github_token:
        raise HTTPException(400, "GitHub not connected. Login via GitHub first.")
    repos = await get_user_repos(user.github_token)
    return [
        {
            "name": r["name"],
            "full_name": r["full_name"],
            "description": r.get("description"),
            "language": r.get("language"),
            "stars": r["stargazers_count"],
            "updated_at": r["updated_at"],
            "html_url": r["html_url"],
        }
        for r in repos
    ]


@router.get("/repos/{owner}/{repo}/files")
async def list_files(
    owner: str,
    repo: str,
    path: str = "",
    user: User = Depends(get_current_user),
):
    if not user.github_token:
        raise HTTPException(400, "GitHub not connected")
    files = await get_repo_files(user.github_token, owner, repo, path)
    return [
        {
            "name": f["name"],
            "path": f["path"],
            "type": f["type"],
            "size": f.get("size", 0),
        }
        for f in files
    ]


@router.post("/file-content")
async def get_content(
    req: FileContentRequest,
    user: User = Depends(get_current_user),
):
    if not user.github_token:
        raise HTTPException(400, "GitHub not connected")

    code = await get_file_content(user.github_token, req.owner, req.repo, req.path)

    ext_map = {
        ".py": "python", ".js": "javascript", ".ts": "typescript",
        ".jsx": "javascript", ".tsx": "typescript", ".java": "java",
        ".go": "go", ".rs": "rust", ".rb": "ruby", ".cpp": "cpp",
        ".c": "c", ".cs": "csharp", ".php": "php", ".swift": "swift",
    }
    ext = "." + req.path.rsplit(".", 1)[-1] if "." in req.path else ""
    language = ext_map.get(ext, "text")

    return {"content": code, "language": language, "path": req.path}


@router.get("/repos/{owner}/{repo}/tree")
async def repo_tree(
    owner: str,
    repo: str,
    user: User = Depends(get_current_user),
):
    if not user.github_token:
        raise HTTPException(400, "GitHub not connected")
    tree = await get_repo_tree(user.github_token, owner, repo)
    return tree.get("tree", [])
