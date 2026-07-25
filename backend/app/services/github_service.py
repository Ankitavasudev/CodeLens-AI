import httpx
from app.config import get_settings

settings = get_settings()
GITHUB_API = "https://api.github.com"


async def get_github_user(token: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{GITHUB_API}/user",
            headers={"Authorization": f"Bearer {token}"},
        )
        resp.raise_for_status()
        return resp.json()


async def get_user_repos(token: str, per_page: int = 30) -> list[dict]:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{GITHUB_API}/user/repos",
            headers={"Authorization": f"Bearer {token}"},
            params={"per_page": per_page, "sort": "updated", "direction": "desc"},
        )
        resp.raise_for_status()
        return resp.json()


async def get_repo_files(token: str, owner: str, repo: str, path: str = "") -> list[dict]:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/contents/{path}",
            headers={"Authorization": f"Bearer {token}"},
        )
        resp.raise_for_status()
        return resp.json()


async def get_file_content(token: str, owner: str, repo: str, path: str) -> str:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/contents/{path}",
            headers={"Authorization": f"Bearer {token}"},
        )
        resp.raise_for_status()
        import base64
        data = resp.json()
        return base64.b64decode(data["content"]).decode("utf-8")


async def get_repo_tree(token: str, owner: str, repo: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/git/trees/HEAD",
            headers={"Authorization": f"Bearer {token}"},
            params={"recursive": "1"},
        )
        resp.raise_for_status()
        return resp.json()
