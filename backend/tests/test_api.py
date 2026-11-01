"""HTTP-level tests. The OpenAI client is stubbed, so no key or network is needed."""

from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from app import main


def _completion(content: str):
    return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=content))])


class StubClient:
    def __init__(self, content: str):
        self._content = content
        self.calls = []
        self.chat = SimpleNamespace(completions=SimpleNamespace(create=self._create))

    async def _create(self, **kwargs):
        self.calls.append(kwargs)
        return _completion(self._content)


@pytest.fixture()
def client():
    with TestClient(main.app) as test_client:
        yield test_client


@pytest.fixture()
def stub(monkeypatch):
    def install(content: str) -> StubClient:
        fake = StubClient(content)
        monkeypatch.setattr(main, "get_client", lambda: fake)
        return fake

    return install


def test_health_reports_configuration(client):
    body = client.get("/api/health").json()
    assert body["status"] == "ok"
    assert body["ai_configured"] is False
    assert "review" in body["modes"]


def test_root_points_at_docs(client):
    body = client.get("/").json()
    assert body["docs"] == "/docs"


def test_templates_are_served(client):
    body = client.get("/api/templates").json()
    assert len(body) >= 3
    assert all({"name", "language", "code"} <= set(item) for item in body)


def test_analyze_rejects_short_code(client):
    res = client.post("/api/analyze", json={"code": "hi"})
    assert res.status_code == 400
    assert "too short" in res.json()["detail"].lower()


def test_analyze_without_a_key_returns_503(client):
    res = client.post("/api/analyze", json={"code": "print('hello world')"})
    assert res.status_code == 503
    assert "OPENAI_API_KEY" in res.json()["detail"]


def test_analyze_parses_the_model_json(client, stub):
    fake = stub('{"score": 91, "summary": "clean", "bugs": [], "tips": []}')
    res = client.post("/api/analyze", json={"code": "def f():\n    return 1"})
    assert res.status_code == 200
    assert res.json()["score"] == 91
    assert fake.calls[0]["response_format"] == {"type": "json_object"}


def test_analyze_accepts_fenced_output(client, stub):
    stub('```json\n{"summary": "ok"}\n```')
    res = client.post("/api/analyze", json={"code": "x = 1 + 2", "mode": "explain"})
    assert res.status_code == 200
    assert res.json()["summary"] == "ok"


def test_analyze_returns_502_on_unparseable_output(client, stub):
    stub("I cannot help with that.")
    res = client.post("/api/analyze", json={"code": "x = 1 + 2"})
    assert res.status_code == 502


def test_analyze_falls_back_to_review_for_unknown_mode(client, stub):
    fake = stub('{"score": 50}')
    client.post("/api/analyze", json={"code": "x = 1 + 2", "mode": "hack-the-planet"})
    assert "bugs" in fake.calls[0]["messages"][0]["content"].lower()


def test_share_and_fetch_snippet(client):
    created = client.post(
        "/api/share",
        json={"code": "print(1)", "language": "python", "title": "demo"},
    )
    assert created.status_code == 200
    sid = created.json()["id"]
    fetched = client.get(f"/api/snippet/{sid}")
    assert fetched.status_code == 200
    assert fetched.json()["code"] == "print(1)"
    assert len(sid) == 10


def test_unknown_snippet_is_404(client):
    assert client.get("/api/snippet/doesnotexist").status_code == 404


def test_register_login_and_me(client):
    creds = {"email": "Dev@Example.com", "username": "devuser", "password": "hunter2hunter2"}
    created = client.post("/api/auth/register", json=creds)
    assert created.status_code == 200, created.text
    token = created.json()["access_token"]

    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "dev@example.com"

    login = client.post(
        "/api/auth/login",
        data={"username": "dev@example.com", "password": "hunter2hunter2"},
    )
    assert login.status_code == 200
    assert login.json()["access_token"]


def test_register_rejects_duplicates_and_weak_passwords(client):
    payload = {"email": "dup@example.com", "username": "dupuser", "password": "longenough1"}
    assert client.post("/api/auth/register", json=payload).status_code == 200
    assert client.post("/api/auth/register", json=payload).status_code == 400
    weak = {"email": "w@example.com", "username": "weakuser", "password": "short"}
    assert client.post("/api/auth/register", json=weak).status_code == 400


def test_login_rejects_bad_password(client):
    client.post(
        "/api/auth/register",
        json={"email": "bad@example.com", "username": "baduser", "password": "longenough1"},
    )
    res = client.post("/api/auth/login", data={"username": "bad@example.com", "password": "nope"})
    assert res.status_code == 401


def test_review_endpoints_require_auth(client):
    assert client.get("/api/review/history").status_code == 401
    assert client.get("/api/review/stats").status_code == 401
