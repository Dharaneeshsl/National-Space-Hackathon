import type { Snapshot, Satellite, DebrisObject } from "@/store/useTelemetryStore"

const API_URL = "/api/visualization/snapshot"

export async function fetchSnapshot(): Promise<Snapshot> {
  const res = await fetch(API_URL)
  if (!res.ok) {
    throw new Error(`Snapshot request failed: ${res.status}`)
  }
  return res.json()
}

export function connectTelemetrySocket(onMessage: (data: Partial<Snapshot>) => void) {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws"
  const host = window.location.host
  const socket = new WebSocket(`${protocol}://${host}/ws/telemetry`)

  socket.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data)
      onMessage(parsed)
    } catch {
      // ignore malformed payloads
    }
  }

  return socket
}

export function generateMockSnapshot(seed = Date.now()): Snapshot {
  const rand = mulberry32(seed)
  const satelliteCount = 56
  const debrisCount = 12000
  const satellites: Satellite[] = Array.from({ length: satelliteCount }).map((_, idx) => {
    const altitude = 450 + rand() * 300
    const angle = rand() * Math.PI * 2
    const inclination = (rand() * 60 - 30) * (Math.PI / 180)
    const radius = 1.2 + rand() * 0.4
    const speed = 7.2 + rand() * 0.8
    return {
      id: `SAT-${(idx + 1).toString().padStart(3, "0")}`,
      fuel: Math.max(0.12, rand()),
      status: rand() > 0.92 ? "critical" : rand() > 0.75 ? "maneuvering" : "nominal",
      slotDistanceKm: Math.round(rand() * 12),
      position: {
        x: Math.cos(angle) * radius,
        y: Math.sin(inclination) * radius * 0.4,
        z: Math.sin(angle) * radius,
      },
      velocity: {
        x: -Math.sin(angle) * speed * 0.01,
        y: (rand() - 0.5) * 0.02,
        z: Math.cos(angle) * speed * 0.01,
      },
      altitude,
      orbitalSpeed: 7.3 + rand() * 0.5,
      nearestDebrisDistance: 0.4 + rand() * 10,
      collisionRisk: rand() > 0.96 ? "critical" : rand() > 0.88 ? "warning" : "safe",
      history: generateOrbitTrail(angle, radius, -90, 0),
      prediction: generateOrbitTrail(angle, radius, 0, 90),
    }
  })

  const debris: DebrisObject[] = Array.from({ length: debrisCount }).map((_, idx) => {
    const angle = rand() * Math.PI * 2
    const radius = 1.5 + rand() * 0.8
    return {
      id: `D-${idx}`,
      position: {
        x: Math.cos(angle) * radius,
        y: (rand() - 0.5) * 0.3,
        z: Math.sin(angle) * radius,
      },
      velocity: 6.5 + rand() * 2,
      risk: rand() > 0.995 ? "critical" : "safe",
    }
  })

  return {
    timestamp: new Date().toISOString(),
    satellites,
    debris_cloud: debris,
  }
}

function generateOrbitTrail(angle: number, radius: number, startMin: number, endMin: number) {
  const points: { x: number; y: number; z: number; t: number }[] = []
  const steps = 48
  const total = endMin - startMin
  for (let i = 0; i <= steps; i += 1) {
    const t = startMin + (i / steps) * total
    const theta = angle + (t / 90) * Math.PI * 0.8
    points.push({
      x: Math.cos(theta) * radius,
      y: Math.sin(theta * 0.6) * 0.15,
      z: Math.sin(theta) * radius,
      t,
    })
  }
  return points
}

function mulberry32(seed: number) {
  let t = seed + 0x6d2b79f5
  return function () {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}
