import type { Satellite } from "@/store/useTelemetryStore"

interface FuelHeatmapProps {
  satellites: Satellite[]
}

export function FuelHeatmap({ satellites }: FuelHeatmapProps) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] uppercase tracking-[0.25em] text-white/60">Fuel Heatmap</div>
      <div className="grid grid-cols-6 gap-1">
        {satellites.slice(0, 36).map((sat) => {
          const fuel = sat.fuel ?? 0.5
          const color = fuel > 0.7 ? "#00ff99" : fuel > 0.4 ? "#ffd166" : "#ff4d4d"
          return (
            <div
              key={sat.id}
              className="h-6 rounded-sm border border-white/10"
              style={{ background: color, boxShadow: `0 0 10px ${color}55` }}
              title={`${sat.id} ${Math.round(fuel * 100)}%`}
            />
          )
        })}
      </div>
      <div className="flex items-center justify-between text-[10px] text-white/40">
        <span>Low</span>
        <span>Nominal</span>
        <span>High</span>
      </div>
    </div>
  )
}
