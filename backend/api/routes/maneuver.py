from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import numpy as np
import time

from models.satellite import ManeuverPlan, ConjunctionEvent, Vector3
from core.propagator import tle_to_state_vector
import core.maneuver as maneuver_logic
import data.db as db

router = APIRouter(prefix="/api/maneuver", tags=["Maneuver"])

@router.post("/plan", response_model=ManeuverPlan)
def plan_maneuver(event: ConjunctionEvent):
    """Plans an avoidance maneuver given a conjunction event."""
    sats = db.get_all_satellites()
    
    # Maneuver the first satellite by default
    target_sat = next((s for s in sats if s.id == event.sat1_id), None)
    if not target_sat:
        raise HTTPException(status_code=404, detail=f"Satellite {event.sat1_id} not found")
        
    sv = target_sat.state_vector
    if not sv and target_sat.tle:
        try:
            sv = tle_to_state_vector(target_sat.tle)
        except Exception:
            raise HTTPException(status_code=500, detail="Cannot parse TLE for target satellite")
            
    if not sv:
        raise HTTPException(status_code=400, detail="Satellite state vector is missing")
        
    state = [
        sv.position.x, sv.position.y, sv.position.z,
        sv.velocity.x, sv.velocity.y, sv.velocity.z
    ]
    
    plan_details = maneuver_logic.plan_avoidance_maneuver(event, state, target_sat.mass_kg)
    
    # Create the Pydantic response
    plan = ManeuverPlan(
        satellite_id=target_sat.id,
        delta_v=plan_details["delta_v"],
        burn_time_sec=plan_details["burn_time_sec"],
        fuel_consumed_kg=plan_details["fuel_consumed_kg"],
        new_trajectory=[] # Trajectory omitted here for brevity
    )
    
    return plan

class ExecuteRequest(BaseModel):
    satellite_id: str
    fuel_consumed_kg: float = Field(ge=0)
    delta_v: Vector3 = Field(default_factory=lambda: Vector3(x=0.0, y=0.0, z=0.0))


@router.post("/execute")
def execute_maneuver(req: ExecuteRequest):
    """Apply an impulsive burn to the persisted velocity and deduct its fuel cost."""
    sats = db.get_all_satellites()
    target_sat = next((s for s in sats if s.id == req.satellite_id), None)

    if not target_sat:
        raise HTTPException(status_code=404, detail="Satellite not found")
    if req.fuel_consumed_kg > target_sat.fuel_kg:
        raise HTTPException(status_code=400, detail="Insufficient fuel for maneuver")

    state_vector = target_sat.state_vector
    if state_vector is None and target_sat.tle is not None:
        try:
            state_vector = tle_to_state_vector(target_sat.tle)
        except Exception as exc:
            raise HTTPException(status_code=400, detail="Cannot derive satellite state from TLE") from exc
    if state_vector is None:
        raise HTTPException(status_code=400, detail="Satellite state vector is missing")

    state_vector.velocity.x += req.delta_v.x
    state_vector.velocity.y += req.delta_v.y
    state_vector.velocity.z += req.delta_v.z
    target_sat.state_vector = state_vector
    target_sat.fuel_kg -= req.fuel_consumed_kg
    db.save_satellites(sats)

    return {
        "status": "success",
        "remaining_fuel": target_sat.fuel_kg,
        "state_vector": target_sat.state_vector.model_dump(),
    }
