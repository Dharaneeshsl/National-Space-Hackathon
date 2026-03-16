# Autonomous Constellation Manager (ACM) - National Space Hackathon 2026

The **Autonomous Constellation Manager (ACM)** is an end-to-end framework targeted at the modern space era. It provides unparalleled top 1% visualization of massive satellite constellations coupled with an exceptionally fast pure-NumPy RK4 backend integrator for collision prediction and avoidance.

## Features List

- **Real-Time Orbit Visualization**: WebGL based 3D dashboard featuring a visually stunning cyber-space aesthetic, 3D Earth rendering, interactive telemetry tracking, and ground path plotting.
- **Pure NumPy J2 Propagator**: A fast REST API executing RK4 integrators mathematically simulating Earth's J2 orbital perturbations natively.
- **Automated Conjunction Assessment**: Predicts the Time of Closest Approach (TCA) and isotropic 2D Gaussian probability of collisions for N-body catalogs.
- **Maneuver Planning**: Employs classical orbital dynamics mathematics (Hohmann / Prograde maneuvers) mapped alongside fuel mass consumption using the Tsiolkovsky rocket equation to plan automatic avoidance strategies.

## Requirements

- **Node.js**: v18+ (For Frontend)
- **Python**: 3.11+ (For Backend)
- **Docker & Docker Compose**

## Setup Instructions

### Option 1: Docker (Recommended)
1. Boot the environment utilizing docker-compose:
   ```bash
   docker-compose up --build
   ```
2. The UI will be available at `http://localhost:5173`.
3. The Backend API will be available at `http://localhost:8000`.

### Option 2: Manual Initialization
**Backend**:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

## API Usage Example

Check if the `ISS` is on a collision course over the next 24 hours:

```bash
curl -X 'POST' \
  'http://localhost:8000/api/conjunction/assess' \
  -H 'Content-Type: application/json' \
  -d '{
  "satellite_id": "SAT-001-ISS",
  "time_window_hours": 24.0
}'
```

## Team Info
Developed for the National Space Hackathon 2026.
