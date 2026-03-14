import { useMemo } from "react"
import type { Satellite } from "@/store/useTelemetryStore"

interface ManeuverTimelineProps {
  satellites: Satellite[]
}

interface Maneuver {
  id: string
  label: string
  start: number
  end: number
  type: "burn" | "recovery" | "cooldown"
}

export function ManeuverTimeline({ satellites }: ManeuverTimelineProps) {
  const maneuvers = useMemo(() => buildManeuvers(satellites), [satellites])

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
        <div className="mt-12 flex items-center justify-between text-[10px] text-white/40">
          <span>T-90 min</span>
          <span>Now</span>
          <span>T+90 min</span>
        </div>
      </div>
    </div>
  )
}

function buildManeuvers(satellites: Satellite[]): Maneuver[] {
  const items: Maneuver[] = []
  const count = Math.min(6, satellites.length)
  for (let i = 0; i < count; i += 1) {
    const base = 10 + i * 12
    items.push({ id: `burn-${i}`, label: `Evasion Burn ${i + 1}`, start: base, end: base + 6, type: "burn" })
    items.push({ id: `cool-${i}`, label: `Cooldown ${i + 1}`, start: base + 6, end: base + 12, type: "cooldown" })
    items.push({ id: `rec-${i}`, label: `Recovery ${i + 1}`, start: base + 12, end: base + 18, type: "recovery" })
  }
  return items
}
