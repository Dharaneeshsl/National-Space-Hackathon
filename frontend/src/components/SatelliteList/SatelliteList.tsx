import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Tooltip } from "@/components/ui/tooltip"
import type { Satellite } from "@/store/useTelemetryStore"

interface SatelliteListProps {
  satellites: Satellite[]
  selectedId?: string
  onSelect: (id?: string) => void
}

export function SatelliteList({ satellites, selectedId, onSelect }: SatelliteListProps) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    return satellites.filter((sat) => sat.id.toLowerCase().includes(query.toLowerCase()))
  }, [satellites, query])

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.25em] text-white/60">Satellite Fleet</div>
        <div className="text-[10px] text-white/40">{filtered.length} active</div>
      </div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search satellite ID"
        className="mb-3 rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/70 outline-none transition focus:border-cyan-400/60"
      />
      <div className="flex-1 space-y-2 overflow-y-auto pr-2">
        {filtered.map((sat) => {
          const statusColor =
            sat.status === "critical" ? "bg-red-500/80" : sat.status === "maneuvering" ? "bg-orange-400/80" : "bg-green-400/80"
          return (
            <Tooltip key={sat.id} content={`Status: ${sat.status ?? "nominal"} | Risk: ${sat.collisionRisk ?? "safe"}`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(sat.id)}
                className={cn(
                  "w-full rounded-xl border bg-surface/40 p-3 text-left transition-all duration-300 backdrop-blur-md",
                  selectedId === sat.id 
                    ? "border-primary shadow-glow-cyan bg-primary/20"
                    : "border-white/10 hover:border-primary/50 hover:bg-white/10 hover:shadow-glow-cyan"
                )}
              >
                <div className="flex items-center justify-between text-xs text-white/90">
                  <span className={cn("font-bold tracking-[0.2em] transition-colors", selectedId === sat.id ? "text-primary" : "")}>{sat.id}</span>
                  <span className={cn("h-2 w-2 rounded-full shadow-lg", statusColor)} />
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[10px] text-white/60">
                    <span>Fuel</span>
                    <span className={selectedId === sat.id ? "text-primary font-bold" : ""}>{Math.round((sat.fuel ?? 0.5) * 100)}%</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((sat.fuel ?? 0.5) * 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-success via-warning to-danger shadow-glow-cyan"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-white/50">
                    <span>Slot Δ</span>
                    <span>{sat.slotDistanceKm ?? 0} km</span>
                  </div>
                </div>
              </motion.button>
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
}
