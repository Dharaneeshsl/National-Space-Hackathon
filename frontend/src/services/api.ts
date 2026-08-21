import type { Snapshot } from "@/store/useTelemetryStore"

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
      // Ignore malformed payloads without destabilizing the live feed.
    }
  }

  return socket
}
