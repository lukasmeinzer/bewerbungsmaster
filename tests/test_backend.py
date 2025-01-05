import sys
import os

# Add the root project directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.main import app
from backend.models import Base  # Adjust according to your app's structure

client = TestClient(app)

@pytest.fixture(scope="module")
def test_db():
    # Create a temporary test database
    engine = create_engine("mysql://root:password@localhost:3308/test_database")
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    yield db

    db.close()
    Base.metadata.drop_all(bind=engine)  # Clean up database after tests

def test_ping():
    response = client.get("/ping")
    assert response.status_code == 200
    assert response.json() == {"message": "pong"}
