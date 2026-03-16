from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

import data.db as db

from api.routes import satellites, propagator, conjunction, maneuver

app = FastAPI(
    title="Autonomous Constellation Manager",
    description="API for satellite constellation tracking, risk assessment, and autonomous maneuvering.",
    version="1.0.0"
)

# Fix ECONNREFUSED by allowing CORS from the frontend Vite port 5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize mock database
@app.on_event("startup")
def startup_event():
    db.init_db()

# Mount routers
app.include_router(satellites.router)
app.include_router(propagator.router)
app.include_router(conjunction.router)
app.include_router(maneuver.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
