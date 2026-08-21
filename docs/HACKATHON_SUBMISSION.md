# Autonomous Constellation Manager

## Hackathon Submission Brief

### Executive summary

The **Autonomous Constellation Manager (ACM)** is an end-to-end mission-operations dashboard for monitoring satellites, assessing conjunction risk, and planning corrective maneuvers. It combines a FastAPI numerical backend with a React/WebGL frontend so that a reviewer can move from live catalog telemetry to a collision-risk assessment and then to a fuel-aware delta-v execution request through one coherent workflow.

The project is designed for the practical question that operators face as constellations scale: **which spacecraft require attention, how urgent is the risk, and what maneuver can be executed without violating fuel constraints?** ACM answers that question with a typed API, deterministic orbital propagation, a bounded collision-risk cache, real debris data, a live WebSocket feed, and a visual command-center interface.

## Problem statement

Large satellite fleets produce more state, conjunction, and maneuver information than an operator can safely interpret through isolated scripts or static reports. A useful prototype must therefore join four capabilities: a trusted current state, forward propagation, explainable risk classification, and an action path that changes the tracked state rather than merely displaying a simulated recommendation.

## Solution and differentiators

ACM provides a single operational loop:

1. The backend loads a typed satellite catalog and a committed debris catalog.
2. The numerical core propagates state vectors with a NumPy RK4 integrator and J2 perturbation terms.
3. The collision-risk service evaluates the catalog, classifies risk using shared thresholds, and refreshes its cache on a bounded interval.
4. The frontend receives snapshots over REST and repeated telemetry over WebSocket.
5. The conjunction service exposes close approaches and the maneuver planner produces a fuel-aware delta-v plan.
6. The execution endpoint validates fuel and state availability, applies the delta-v to the persisted velocity, and returns the updated state vector.

The main differentiator is the **closed loop between analysis and action**. The interface is not limited to a fabricated visualization or a one-off calculation: it consumes backend data, shows conjunction-driven timeline events, and exposes a stateful execution contract that is covered by regression tests.

## Core features

| Capability | Implementation | Submission value |
|---|---|---|
| Live constellation telemetry | REST snapshot endpoint plus `/ws/telemetry` | Demonstrates continuous operational state rather than static mock screens |
| Orbital propagation | Pure NumPy RK4 propagation with J2 acceleration terms | Provides a deterministic, inspectable numerical foundation |
| Conjunction assessment | Pairwise miss-distance, TCA, and simplified collision probability | Converts trajectories into operator-readable risk events |
| Collision-risk cache | Shared critical/warning thresholds with bounded refresh | Keeps dashboard polling responsive while preventing indefinite stale data |
| Debris awareness | Typed debris model and committed seed catalog | Ensures the visualization contains real structured debris payloads |
| Maneuver planning | Prograde avoidance planning and Tsiolkovsky fuel estimate | Connects a risk event to a feasible response proposal |
| Maneuver execution | Fuel validation plus persisted velocity delta-v update | Completes the operational loop and avoids a display-only action |
| Readiness endpoint | `/health` and `/ready` checks | Makes startup and deployment verification explicit |
| Submission-grade validation | Backend tests, TypeScript checks, production build, live smoke checks, and GitHub Actions | Provides reproducible evidence for reviewers |

## Technical architecture

```text
React + TypeScript + Vite + WebGL
            |
            | REST snapshots, conjunction requests, WebSocket telemetry
            v
FastAPI application
  |-- typed satellite/debris models
  |-- JSON-backed catalog persistence
  |-- RK4 + J2 propagator
  |-- conjunction and collision-risk services
  |-- maneuver planner and execution endpoint
            |
            v
Committed satellite/debris seed data and runtime satellite state
```

The backend is intentionally modular. `backend/core/` contains numerical and decision logic, `backend/api/routes/` contains HTTP contracts, `backend/models/` defines Pydantic boundaries, and `backend/data/` handles the JSON-backed catalog. The frontend separates API access, telemetry state, timeline presentation, and visualization components.

## End-to-end demonstration script

A reviewer can demonstrate the product in approximately five minutes.

### Start the system

With Docker available:

```bash
docker compose up --build
```

The dashboard is served on `http://localhost:5173` and the backend is available on `http://localhost:8000`. For a manual run, start the backend with `uvicorn main:app --reload --port 8000` from `backend/`, then start the frontend with `npm run dev` from `frontend/`.

### Verify readiness

```bash
curl http://localhost:8000/health
curl http://localhost:8000/ready
curl http://localhost:8000/api/visualization/snapshot
```

The readiness response confirms that the catalog, risk cache, snapshot builder, and debris catalog are operational. The current committed seed data contains six satellites and four debris objects.

### Demonstrate the operational loop

Open the dashboard and select a spacecraft. Review its current position, fuel, and collision-risk classification. Use the conjunction view to inspect close approaches and observe the maneuver timeline, which is populated from the conjunction API rather than hard-coded bars. Use the maneuver planning endpoint with a conjunction event, then submit the returned fuel cost and delta-v to `/api/maneuver/execute`. The response includes the remaining fuel and updated state vector, allowing the next snapshot to reflect the executed change.

## API surface

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Lightweight process health check |
| `GET` | `/ready` | Catalog, snapshot, and debris readiness checks |
| `GET` | `/api/satellites` | List tracked satellites |
| `GET` | `/api/satellites/{satellite_id}` | Retrieve one satellite |
| `POST` | `/api/satellites` | Add a validated satellite to the catalog |
| `GET` | `/api/visualization/snapshot` | Return current satellite and debris rendering data |
| `POST` | `/api/propagation/propagate` | Propagate one satellite trajectory |
| `GET` | `/api/conjunction/assess` | Assess conjunctions for one satellite |
| `GET` | `/api/conjunction/all` | Assess the full catalog |
| `POST` | `/api/maneuver/plan` | Generate a fuel-aware avoidance plan |
| `POST` | `/api/maneuver/execute` | Apply delta-v and deduct fuel atomically in the JSON-backed state |
| `WebSocket` | `/ws/telemetry` | Stream repeated snapshots to the dashboard |

## Validation evidence

The repository includes backend regression tests for health, satellite access, snapshots, propagation, conjunction calculations, maneuver planning, maneuver execution, readiness, debris payloads, and repeated WebSocket telemetry. The frontend has a TypeScript check and a production Vite build. The CI workflows execute backend tests and frontend type-check/build jobs on GitHub pushes and pull requests.

The final submission check should be run from the repository root:

```bash
. .venv/bin/activate
python -m py_compile $(git ls-files 'backend/**/*.py')
PYTHONPATH=backend pytest -q
cd frontend
npm ci
npm run typecheck
npm run build
```

## Production handoff

The Docker Compose deployment is the intended production-like handoff for the hackathon. The backend container exposes port 8000, while the frontend container builds static assets and serves them through Nginx on port 5173. Nginx proxies `/api/` and `/ws/` to the backend service so the browser uses one origin. Runtime satellite state is ignored by Git and remains local to the deployment volume; committed seed data remains reproducible.

## Responsible scope and next steps

ACM is a hackathon-grade operational prototype, not a flight-certified command system. Its collision probability model is a simplified isotropic approximation, the catalog is a deterministic seed catalog rather than a live authoritative feed, and the JSON-backed persistence layer should be replaced with a transactional database for multi-operator production. Before real spacecraft use, the system would require validated ephemerides, covariance-aware conjunction data, authentication and authorization, command approval workflows, audit logging, mission-specific dynamics validation, and independent safety review.

These boundaries are explicit so reviewers can distinguish what is implemented and tested now from what belongs in a flight-qualified roadmap.

## Repository handoff

The source repository is [Dharaneeshsl/National-Space-Hackathon](https://github.com/Dharaneeshsl/National-Space-Hackathon). The final release commit should be identified by its Git SHA in the handoff report, and the Git author should remain the project owner’s configured GitHub identity.
