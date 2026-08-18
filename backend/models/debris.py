from typing import Literal

from pydantic import BaseModel

from models.satellite import Vector3


class Debris(BaseModel):
    """A tracked debris object in the same Earth-centered frame as satellites."""

    id: str
    name: str | None = None
    position: Vector3
    velocity_km_s: float = 0.0
    risk: Literal["safe", "warning", "critical"] = "safe"
