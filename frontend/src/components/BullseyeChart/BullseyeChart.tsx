import { useMemo } from "react"
import type { Satellite } from "@/store/useTelemetryStore"

interface BullseyeChartProps {
  satellites: Satellite[]
  selectedId?: string
}

export function BullseyeChart({ satellites, selectedId }: BullseyeChartProps) {
  const selected = useMemo(
    () => satellites.find((sat) => sat.id === selectedId) ?? satellites[0],
    [satellites, selectedId]
  )

  const points = useMemo(() => {
    if (!selected) return []

    // Convert positions to relative polar coordinates
    return satellites
      .filter((sat) => sat.id !== selected.id)
      .map((sat) => {
        // Calculate relative coordinates
        const dx = sat.position.x - selected.position.x
        const dy = sat.position.y - selected.position.y
        const dz = sat.position.z - selected.position.z
        
        // Relative distance in km (convert back from Three.js units if scaled, or use as is)
        // Since both positions are scaled to Earth Radius = 1.0 unit:
        // 1.0 unit = 6378 km.
        const r_units = Math.sqrt(dx * dx + dy * dy + dz * dz)
        const distanceKm = r_units * 6378.137

        // Angle in the horizontal plane
        const angle = Math.atan2(dz, dx)

        return {
          id: sat.id,
          distanceKm,
          angle,
          risk: sat.collisionRisk ?? "safe",
        }
      })
      .filter((p) => p.distanceKm < 3000) // Show satellites within 3000 km
  }, [satellites, selected])

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 text-[10px] uppercase tracking-[0.25em] text-white/60">Conjunction Radar</div>
      
      <div className="relative flex flex-1 items-center justify-center p-2">
        <svg viewBox="0 0 200 200" className="h-[180px] w-[180px]">
          <style>
            {`
              @keyframes radar-sweep {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              .sweep-line {
                transform-origin: 100px 100px;
                animation: radar-sweep 6s linear infinite;
              }
            `}
          </style>

          {/* Grid lines */}
          <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(0, 242, 255, 0.15)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(0, 242, 255, 0.15)" strokeWidth="1" strokeDasharray="3 3" />

          {/* Concentric rings (1000km, 2000km, 3000km) */}
          <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(0, 242, 255, 0.15)" strokeWidth="1" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(0, 242, 255, 0.15)" strokeWidth="1" />
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(0, 242, 255, 0.25)" strokeWidth="1" strokeDasharray="2 2" />

          {/* Sweep scanning line */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="10"
            className="sweep-line"
            stroke="url(#sweep-grad)"
            strokeWidth="1.5"
            opacity="0.8"
          />

          <defs>
            <linearGradient id="sweep-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f2ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00f2ff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Radar target center (selected satellite) */}
          <circle cx="100" cy="100" r="3.5" fill="#ff00ff" className="animate-pulse" />
          <circle cx="100" cy="100" r="8" fill="none" stroke="#ff00ff" strokeWidth="0.5" opacity="0.5" />

          {/* Satellite points */}
          {points.map((p) => {
            const r = (p.distanceKm / 3000) * 90
            const x = 100 + r * Math.cos(p.angle)
            const y = 100 + r * Math.sin(p.angle)
            const color =
              p.risk === "critical"
                ? "#ff4d4d"
                : p.risk === "warning"
                ? "#ffb347"
                : "#00ffff"
            return (
              <g key={p.id}>
                {p.risk === "critical" && (
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill="none"
                    stroke={color}
                    strokeWidth="0.5"
                    className="animate-ping"
                    style={{ transformOrigin: `${x}px ${y}px` }}
                  />
                )}
                <circle cx={x} cy={y} r="2.5" fill={color} />
                <text
                  x={x + 4}
                  y={y - 4}
                  fill="rgba(255,255,255,0.5)"
                  fontSize="6"
                  fontFamily="monospace"
                >
                  {p.id.replace("SAT-", "")}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-between text-[9px] font-semibold text-white/50">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff00ff]" />
          <span>FOCAL: {selected?.id ?? "N/A"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff4d4d]" />
          <span>CRIT</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#ffb347]" />
          <span>WARN</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#00ffff]" />
          <span>SAFE</span>
        </div>
      </div>
    </div>
  )
}
