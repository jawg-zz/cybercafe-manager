import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

# Ensure `app` package is importable from the backend directory
BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

os.environ["DATABASE_URL"] = "sqlite:///./test_cybercafe.db"
os.environ["SECRET_KEY"] = "test-secret-key"

from app.database import Base, engine, SessionLocal  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Role, User  # noqa: E402
from app.services.security import hash_password  # noqa: E402


@pytest.fixture(autouse=True)
def _clean_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    session = SessionLocal()
    yield session
    session.close()


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def admin_token(client):
    db = SessionLocal()
    db.add(
        User(
            username="admin",
            full_name="Admin",
            password_hash=hash_password("admin123"),
            role=Role.ADMIN,
        )
    )
    db.commit()
    db.close()
    resp = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert resp.status_code == 200
    return resp.json()["access_token"]


@pytest.fixture
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}
