import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from core.collision_risk import compute_and_store_collision_risk

import data.db as db

from api.routes import satellites, propagator, conjunction, maneuver
from api.routes.propagator import build_snapshot_payload


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    compute_and_store_collision_risk()
    yield


app = FastAPI(
    title="Autonomous Constellation Manager",
    description="API for satellite constellation tracking, risk assessment, and autonomous maneuvering.",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow local dev (Vite) and alternate loopback hostname
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(satellites.router)
app.include_router(propagator.router)
app.include_router(conjunction.router)
app.include_router(maneuver.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}


@app.websocket("/ws/telemetry")
async def telemetry_ws(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.send_json(build_snapshot_payload())
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        pass


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
