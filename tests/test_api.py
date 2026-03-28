from fastapi.testclient import TestClient
import sys
import os

# Append backend to sys to resolve imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from main import app
client = TestClient(app)

def test_health_check():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_get_satellites():
    res = client.get("/api/satellites")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_snapshot():
    res = client.get("/api/visualization/snapshot")
    assert res.status_code == 200
    data = res.json()
    assert "timestamp" in data
    assert isinstance(data["timestamp"], str)
    assert "satellites" in data
    assert isinstance(data["satellites"], list)
    assert "debris_cloud" in data
    assert data["debris_cloud"] == []
