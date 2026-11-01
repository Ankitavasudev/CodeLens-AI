import os
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

# Keep tests hermetic: no real key, throwaway SQLite file.
os.environ.pop("OPENAI_API_KEY", None)
os.environ["DATABASE_URL"] = "sqlite:///./test_codelens.db"
os.environ["JWT_SECRET"] = "test-secret"
