import type { OrbitElements, Vector3 } from "@/store/useTelemetryStore"

const EARTH_RADIUS_KM = 6371
const MU = 398600.4418 // km^3 / s^2

export function positionFromElements(elements: OrbitElements, timestamp: string): Vector3 | null {
  const { semiMajorAxisKm, inclinationDeg, raanDeg, argPerigeeDeg, meanAnomalyDeg, meanMotionRevPerDay } = elements
  const time = new Date(timestamp).getTime() / 1000
  if (!Number.isFinite(time)) return null

  let a = semiMajorAxisKm
  if (!a && meanMotionRevPerDay) {
    const n = (meanMotionRevPerDay * 2 * Math.PI) / 86400
    a = Math.cbrt(MU / (n * n))
  }
  if (!a) return null

  const n = Math.sqrt(MU / Math.pow(a, 3))
  const t0 = elements.epoch ? new Date(elements.epoch).getTime() / 1000 : time
  const dt = time - t0
  const M0 = toRad(meanAnomalyDeg ?? 0)
  const M = M0 + n * dt
  const E = solveKepler(M, elements.eccentricity ?? 0)

  const xOrb = a * (Math.cos(E) - (elements.eccentricity ?? 0))
  const yOrb = a * Math.sqrt(1 - Math.pow(elements.eccentricity ?? 0, 2)) * Math.sin(E)

  const raan = toRad(raanDeg ?? 0)
  const inc = toRad(inclinationDeg ?? 0)
  const arg = toRad(argPerigeeDeg ?? 0)

  const cosR = Math.cos(raan)
  const sinR = Math.sin(raan)
  const cosI = Math.cos(inc)
  const sinI = Math.sin(inc)
  const cosA = Math.cos(arg)
  const sinA = Math.sin(arg)

  const x = (cosR * cosA - sinR * sinA * cosI) * xOrb + (-cosR * sinA - sinR * cosA * cosI) * yOrb
  const y = (sinR * cosA + cosR * sinA * cosI) * xOrb + (-sinR * sinA + cosR * cosA * cosI) * yOrb
  const z = sinA * sinI * xOrb + cosA * sinI * yOrb

  const scale = 1 / EARTH_RADIUS_KM
  return { x: x * scale, y: z * scale, z: y * scale }
}

function solveKepler(M: number, e: number) {
  let E = M
  for (let i = 0; i < 6; i += 1) {
    E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E))
  }
  return E
}

function toRad(value: number) {
  return (value * Math.PI) / 180
}
