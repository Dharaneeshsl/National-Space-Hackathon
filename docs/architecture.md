# Autonomous Constellation Manager: Architecture

## High-Level Overview

The ACM (Autonomous Constellation Manager) is built upon a standard client-server architecture with heavy mathematical computation on the backend:

1. **Frontend (React + Vite + WebGL)**: Provides a visually stunning, real-time 3D dashboard displaying telemetry, predicting orbits over time, and rendering conjunction hotspots. Interacts strictly via REST API.
2. **Backend (FastAPI)**: Serves JSON data and manages the heavy lifting for orbital mechanics computation.

## Backend Core Modules

- **`models/`**: Pydantic definitions serving as the strict schema boundary.
- **`data/`**: A mock JSON JSON-file-based database handling basic CRUD operations for satellite tracking.
- **`core/propagator.py`**: A pure NumPy implementation of the 4th order Runge-Kutta numerical integration. Includes J2 gravitational potential perturbations. SGP4 is used exclusively to fetch initial state vectors from Two-Line Elements (TLE).
- **`core/conjunction.py`**: Fast $O(N^2)$ tracking algorithms that measure distance deltas between multiple satellites to identify Time of Closest Approach (TCA) and probability of collision using a 2D isotropic Gaussian assumption.
- **`core/maneuver.py`**: Recommends Hohmann-transfer inspired $\Delta V$ maneuvers to raise the semi-major axis, automatically mapping velocity burns back into mass ratio to compute fuel cost.

## Data Flow

1. The Frontend polls `/api/visualization/snapshot` every few seconds to sync the immediate real-time rendering states.
2. The Backend reads `satellites.json` and evaluates the initial state for each catalog item.
3. Every night (or manually triggered for deeper analysis), the Frontend invokes `/api/conjunction/all`.
4. The Backend spawns `propagate_rk4` across all states simultaneously in NumPy, computing exact locations over the next 24-48 hours. Missing states are interpolated, risks assessed, and mapped back to collision events shown up the dashboard.
