import { useMemo } from "react"
import type { Satellite } from "@/store/useTelemetryStore"

interface TelemetryPanelProps {
  satellites: Satellite[]
  selectedId?: string
}

export function TelemetryPanel({ satellites, selectedId }: TelemetryPanelProps) {
  const selected = useMemo(() => satellites.find((sat) => sat.id === selectedId) ?? satellites[0], [satellites, selectedId])

  if (!selected) {
    return <div className="text-xs text-white/60">No telemetry available.</div>
  }

  const items = [
    { label: "Position", value: fmtVec(selected.position) },
    { label: "Velocity", value: `${selected.velocity?.toFixed(2) ?? "--"} km/s` },
    { label: "Altitude", value: `${selected.altitude?.toFixed(0) ?? "--"} km` },
    { label: "Orbital Speed", value: `${selected.orbitalSpeed?.toFixed(2) ?? "--"} km/s` },
    { label: "Fuel", value: `${Math.round((selected.fuel ?? 0.5) * 100)}%` },
    { label: "Nearest Debris", value: `${selected.nearestDebrisDistance?.toFixed(2) ?? "--"} km` },
  ]

  return (
    <div className="space-y-3 text-xs font-semibold text-cyan-100">
      <div className="text-[10px] uppercase tracking-[0.25em] text-white/60">Telemetry Panel</div>
      <div className="text-[11px] uppercase tracking-[0.2em] text-magenta-300">{selected.id}</div>
      <div className="grid grid-cols-2 gap-3 text-[11px]">
        {items.map((item) => (
          <div key={item.label} className="rounded-md border border-white/10 bg-black/40 px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">{item.label}</div>
            <div className="mt-1 font-mono text-[12px] text-cyan-200">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function fmtVec(vec: { x: number; y: number; z: number }) {
  return `${vec.x.toFixed(2)}, ${vec.y.toFixed(2)}, ${vec.z.toFixed(2)}`
}
