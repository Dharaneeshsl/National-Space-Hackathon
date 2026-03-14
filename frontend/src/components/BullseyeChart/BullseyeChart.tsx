import { ResponsiveContainer, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Scatter, ScatterChart } from "recharts"
import type { Satellite } from "@/store/useTelemetryStore"

interface BullseyeChartProps {
  satellites: Satellite[]
  selectedId?: string
}

export function BullseyeChart({ satellites, selectedId }: BullseyeChartProps) {
  const selected = satellites.find((sat) => sat.id === selectedId) ?? satellites[0]
  const data = satellites.slice(0, 24).map((sat, idx) => {
    const timeToClosest = sat.nearestDebrisDistance ? Math.max(1, sat.nearestDebrisDistance) : 8 + idx * 0.4
    return {
      angle: (idx / 24) * 360,
      radius: timeToClosest,
      risk: sat.collisionRisk ?? "safe",
    }
  })

  return (
    <div className="h-full w-full">
      <div className="mb-2 text-[10px] uppercase tracking-[0.25em] text-white/60">Conjunction Bullseye</div>
      {/* Temporarily disable problematic Recharts scatter chart to avoid runtime crash */}
      <div className="flex h-[180px] items-center justify-center text-[11px] text-white/60">
        Bullseye visualization temporarily disabled for stability
      </div>
      <div className="mt-2 text-[11px] text-white/60">
        Focus: <span className="text-cyan-200">{selected?.id ?? "N/A"}</span>
      </div>
    </div>
  )
}
