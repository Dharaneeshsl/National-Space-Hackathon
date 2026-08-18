import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))

from fastapi.testclient import TestClient

from api.routes import maneuver as maneuver_route
from main import app
from models.satellite import Satellite, StateVector, Vector3


client = TestClient(app)


def test_snapshot_includes_validated_debris_catalog():
    response = client.get("/api/visualization/snapshot")
    assert response.status_code == 200
    debris = response.json()["debris_cloud"]
    assert len(debris) >= 1
    assert {"id", "position", "velocity", "risk"} <= set(debris[0])


def test_execute_applies_delta_v_and_deducts_fuel(monkeypatch):
    satellite = Satellite(
        id="TEST-SAT",
        name="Test Satellite",
        state_vector=StateVector(
            position=Vector3(x=7000.0, y=0.0, z=0.0),
            velocity=Vector3(x=0.0, y=7.5, z=0.0),
        ),
        fuel_kg=10.0,
    )
    saved = []
    monkeypatch.setattr(maneuver_route.db, "get_all_satellites", lambda: [satellite])
    monkeypatch.setattr(maneuver_route.db, "save_satellites", lambda sats: saved.extend(sats))

    response = client.post(
        "/api/maneuver/execute",
        json={
            "satellite_id": "TEST-SAT",
            "fuel_consumed_kg": 0.5,
            "delta_v": {"x": 0.001, "y": 0.0, "z": -0.002},
        },
    )

    assert response.status_code == 200
    assert response.json()["remaining_fuel"] == 9.5
    assert satellite.state_vector.velocity.x == 0.001
    assert satellite.state_vector.velocity.y == 7.5
    assert satellite.state_vector.velocity.z == -0.002
    assert saved and saved[0].id == "TEST-SAT"
