import os
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

# Keep tests hermetic: no real key, a throwaway SQLite file, a fixed test secret.
os.environ.pop("OPENAI_API_KEY", None)

# A fixed file name would keep rows from the previous run, so the second
# `pytest` in a row failed with "Email already registered". Start clean every
# session and keep the file next to the backend, not in whatever the CWD is.
TEST_DB = BACKEND / "test_codelens.db"
TEST_DB.unlink(missing_ok=True)
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB.as_posix()}"

# 32+ bytes keeps PyJWT's InsecureKeyLengthWarning quiet.
os.environ["JWT_SECRET"] = "test-secret-that-is-long-enough-32"
