# test /ping endpoint

from fastapi.testclient import TestClient
from main import app  # Import your FastAPI app (adjust the import based on your app structure)

# Initialize the TestClient with the FastAPI app
client = TestClient(app)

def test_ping():
    response = client.get("/ping")

    assert response.status_code == 200
    assert response.json() == {"ping": "pong"}
