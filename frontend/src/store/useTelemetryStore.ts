import { create } from "zustand"

export type RiskLevel = "safe" | "warning" | "critical"

export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface OrbitElements {
  epoch?: string
  semiMajorAxisKm?: number
  eccentricity?: number
  inclinationDeg?: number
  raanDeg?: number
  argPerigeeDeg?: number
  meanAnomalyDeg?: number
  meanMotionRevPerDay?: number
}

export interface OrbitPoint extends Vector3 {
  t: number
}

export interface Satellite {
  id: string
  name?: string
  position: Vector3
  orbitalElements?: OrbitElements
  velocity?: number
  altitude?: number
  orbitalSpeed?: number
  fuel?: number
  status?: "nominal" | "maneuvering" | "critical"
  slotDistanceKm?: number
  nearestDebrisDistance?: number
  collisionRisk?: RiskLevel
  history?: OrbitPoint[]
  prediction?: OrbitPoint[]
  groundTrack?: Array<[number, number]>
  groundHistory?: Array<[number, number]>
  groundPrediction?: Array<[number, number]>
}

export interface DebrisObject {
  id: string
  position: Vector3
  velocity?: number
  risk?: RiskLevel
}

export interface Snapshot {
  timestamp: string
  satellites: Satellite[]
  debris_cloud: DebrisObject[]
}

interface TelemetryState {
  snapshot: Snapshot | null
  loading: boolean
  error?: string
  selectedSatelliteId?: string
  setSnapshot: (snapshot: Snapshot) => void
  setLoading: (value: boolean) => void
  setError: (message?: string) => void
  selectSatellite: (id?: string) => void
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  snapshot: null,
  loading: true,
  error: undefined,
  selectedSatelliteId: undefined,
  setSnapshot: (snapshot) =>
    set((state) => ({
      snapshot,
      loading: false,
      error: undefined,
      selectedSatelliteId: state.selectedSatelliteId ?? snapshot.satellites[0]?.id,
    })),
  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message, loading: false }),
  selectSatellite: (id) => set({ selectedSatelliteId: id }),
}))
