import { useEffect, useMemo, useState } from "react"

import type { Satellite } from "@/store/useTelemetryStore"

interface ManeuverTimelineProps {
  satellites: Satellite[]
}

interface ConjunctionEvent {
  sat1_id: string
  sat2_id: string
  tca: number
  miss_distance_km: number
  probability: number
}

interface Maneuver {
  id: string
  label: string
  start: number
  end: number
  type: "burn" | "recovery" | "cooldown"
}

export function ManeuverTimeline({ satellites }: ManeuverTimelineProps) {
  const [events, setEvents] = useState<ConjunctionEvent[]>([])

  useEffect(() => {
    let cancelled = false
    fetch("/api/conjunction/all?time_window_hours=1")
      .then((response) => {
        if (!response.ok) throw new Error(`Conjunction request failed: ${response.status}`)
        return response.json() as Promise<ConjunctionEvent[]>
      })
      .then((nextEvents) => {
        if (!cancelled) setEvents(nextEvents)
      })
      .catch(() => {
        if (!cancelled) setEvents([])
      })
    return () => {
      cancelled = true
    }
  }, [satellites.length])

  const maneuvers = useMemo(() => buildManeuvers(events, satellites), [events, satellites])

  return (
    <div className="h-full">
      <div className="mb-2 text-[10px] uppercase tracking-[0.25em] text-white/60">Maneuver Timeline</div>
      <div className="relative h-28 rounded-lg border border-white/10 bg-black/30 p-3">
        <div className="absolute left-3 right-3 top-8 h-px bg-white/10" />
        {maneuvers.map((m) => (
          <div
            key={m.id}
            className={
              m.type === "cooldown"
                ? "absolute top-10 h-3 rounded-sm bg-white/20"
                : "absolute top-10 h-3 rounded-sm bg-purple-500/70 shadow-[0_0_15px_rgba(188,19,254,0.6)]"
            }
            style={{ left: `${m.start}%`, width: `${Math.max(3, m.end - m.start)}%` }}
            title={m.label}
          />
        ))}
        {maneuvers.length === 0 && (
          <div className="absolute inset-x-3 top-10 text-center text-[10px] text-white/45">
            No conjunction-driven maneuver events in the next hour
          </div>
        )}
        <div className="mt-12 flex items-center justify-between text-[10px] text-white/40">
          <span>T-90 min</span>
          <span>Now</span>
          <span>T+90 min</span>
        </div>
      </div>
    </div>
  )
}

function buildManeuvers(events: ConjunctionEvent[], satellites: Satellite[]): Maneuver[] {
  const names = new Map(satellites.map((satellite) => [satellite.id, satellite.name ?? satellite.id]))
  const now = Date.now() / 1000

  return events.slice(0, 6).map((event, index) => {
    const minutesFromNow = (event.tca - now) / 60
    const start = Math.max(2, Math.min(92, 50 + (minutesFromNow / 90) * 50))
    const risk = event.miss_distance_km <= 250 ? "Critical" : "Warning"
    return {
      id: `${event.sat1_id}-${event.sat2_id}-${event.tca}-${index}`,
      label: `${risk} approach: ${names.get(event.sat1_id) ?? event.sat1_id} / ${names.get(event.sat2_id) ?? event.sat2_id} (${event.miss_distance_km.toFixed(1)} km)`,
      start,
      end: Math.min(98, start + 6),
      type: "burn",
    }
  })
}
