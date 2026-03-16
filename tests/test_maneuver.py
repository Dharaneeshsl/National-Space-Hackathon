from core.maneuver import compute_fuel_cost, hohmann_transfer, plan_avoidance_maneuver
from models.satellite import ConjunctionEvent

def test_compute_fuel_cost():
    mass = 1000.0
    dv = 1.0 # 1 km/s
    cost = compute_fuel_cost(dv, mass, isp=300.0)
    assert cost > 0
    assert cost < mass

def test_hohmann_transfer():
    r1 = 7000.0
    r2 = 42000.0 # LEO to GEO roughly
    total_dv, dv1, dv2 = hohmann_transfer(r1, r2)
    assert total_dv > 0
    assert total_dv == dv1 + dv2

def test_plan_avoidance_maneuver():
    event = ConjunctionEvent(sat1_id="A", sat2_id="B", tca=100.0, miss_distance_km=0.5, probability=0.5)
    state = [7000.0, 0.0, 0.0, 0.0, 7.5, 0.0]
    
    res = plan_avoidance_maneuver(event, state, 1000.0)
    assert res["total_dv_km_s"] == 0.001
    assert res["fuel_consumed_kg"] > 0
