# Backend API Reference

Base URL: `http://localhost:8000`

## Satellites (`/api/satellites`)

- **GET `/api/satellites`**: Retrieves all tracked satellites.
- **POST `/api/satellites`**: Adds a new satellite.
    - **Request**: `Satellite` schema
- **GET `/api/satellites/{id}`**: Retrieves details for a specific satellite.

## Propagator (`/api/propagation`)

- **POST `/api/propagation/propagate`**: Compute integration forward in time.
    - **Request**:
    ```json
    {
      "satellite_id": "SAT-001-ISS",
      "time_step_sec": 60.0,
      "duration_hours": 2.0
    }
    ```
    - **Response**: List of `OrbitPoint` trajectories (t, x,y,z, vx,vy,vz)

- **GET `/api/visualization/snapshot`**: Provides the UI with instantaneous global state.

## Conjunction Assessment (`/api/conjunction`)

- **POST `/api/conjunction/assess`**: Assess single satellite risk.
    - **Request**: `{"satellite_id": "ID", "time_window_hours": 24}`
    - **Response**: List of `ConjunctionEvent`
- **GET `/api/conjunction/all`**: Assess $O(N^2)$ collision risk map for the whole catalog.

## Maneuvering (`/api/maneuver`)

- **POST `/api/maneuver/plan`**: Propose a Delta-V collision avoidance.
     - **Request**: `ConjunctionEvent` details
     - **Response**: `ManeuverPlan`
- **POST `/api/maneuver/execute`**: Perform maneuver and deduct fuel.
     - **Request**: `{"satellite_id": "ID", "fuel_consumed_kg": 0.5}`
