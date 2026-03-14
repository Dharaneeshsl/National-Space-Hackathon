import { useEffect } from "react"
import { connectTelemetrySocket, fetchSnapshot, generateMockSnapshot } from "@/services/api"
import { useTelemetryStore } from "@/store/useTelemetryStore"

export function useTelemetryPolling() {
  const setSnapshot = useTelemetryStore((s) => s.setSnapshot)
  const setError = useTelemetryStore((s) => s.setError)
  const setLoading = useTelemetryStore((s) => s.setLoading)

  useEffect(() => {
    let timer: number | undefined
    let socket: WebSocket | undefined
    let active = true

    const load = async () => {
      setLoading(true)
      try {
        const data = await fetchSnapshot()
        if (active) {
          setSnapshot(data)
        }
      } catch {
        if (active) {
          setSnapshot(generateMockSnapshot())
          setError("Live feed unavailable, displaying fallback telemetry.")
        }
      }
    }

    load()
    timer = window.setInterval(load, 1000)

    try {
      socket = connectTelemetrySocket((payload) => {
        if (!payload) return
        setSnapshot({
          timestamp: payload.timestamp ?? new Date().toISOString(),
          satellites: payload.satellites ?? useTelemetryStore.getState().snapshot?.satellites ?? [],
          debris_cloud: payload.debris_cloud ?? useTelemetryStore.getState().snapshot?.debris_cloud ?? [],
        })
      })
    } catch {
      // ignore websocket failures
    }

    return () => {
      active = false
      if (timer) window.clearInterval(timer)
      if (socket && socket.readyState === WebSocket.OPEN) socket.close()
    }
  }, [setSnapshot, setError, setLoading])
}
