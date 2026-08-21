import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))

from fastapi.testclient import TestClient

from api.routes import maneuver as maneuver_route
from main import app
from models.satellite import Satellite, StateVector, Vector3


client = TestClient(app)


def test_readiness_endpoint_reports_operational_catalog():
    response = client.get("/ready")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ready"
    assert all(payload["checks"].values())
    assert payload["counts"]["satellites"] >= 1
    assert payload["counts"]["debris"] >= 1


def test_snapshot_includes_validated_debris_catalog():
    response = client.get("/api/visualization/snapshot")
    assert response.status_code == 200
    debris = response.json()["debris_cloud"]
    assert len(debris) >= 1
    assert {"id", "position", "velocity", "risk"} <= set(debris[0])


def test_plan_to_execute_workflow(monkeypatch):
    satellite = Satellite(
        id="TEST-SAT",
        name="Test Satellite",
        state_vector=StateVector(
            position=Vector3(x=7000.0, y=0.0, z=0.0),
            velocity=Vector3(x=0.0, y=7.5, z=0.0),
        ),
        mass_kg=1000.0,
        fuel_kg=10.0,
    )
    saved = []
    monkeypatch.setattr(maneuver_route.db, "get_all_satellites", lambda: [satellite])
    monkeypatch.setattr(maneuver_route.db, "save_satellites", lambda sats: saved.extend(sats))

    event = {
        "sat1_id": "TEST-SAT",
        "sat2_id": "DEB-001",
        "tca": 1_700_000_000.0,
        "miss_distance_km": 100.0,
        "probability": 0.0001,
    }
    plan_response = client.post("/api/maneuver/plan", json=event)
    assert plan_response.status_code == 200
    plan = plan_response.json()

    execute_response = client.post(
        "/api/maneuver/execute",
        json={
            "satellite_id": plan["satellite_id"],
            "fuel_consumed_kg": plan["fuel_consumed_kg"],
            "delta_v": plan["delta_v"],
        },
    )
    assert execute_response.status_code == 200
    assert execute_response.json()["state_vector"]["velocity"] != {"x": 0.0, "y": 7.5, "z": 0.0}
    assert saved and saved[0].fuel_kg < 10.0


def test_telemetry_websocket_emits_repeated_snapshots():
    with client.websocket_connect("/ws/telemetry") as websocket:
        first = websocket.receive_json()
        second = websocket.receive_json()

    assert first["satellites"]
    assert first["debris_cloud"]
    assert second["timestamp"]


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
