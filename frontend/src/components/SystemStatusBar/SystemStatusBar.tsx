import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { useTelemetryStore } from "@/store/useTelemetryStore"

export function SystemStatusBar() {
  const snapshot = useTelemetryStore((s) => s.snapshot)
  const loading = useTelemetryStore((s) => s.loading)

  const satellites = snapshot?.satellites ?? []
  const debris = snapshot?.debris_cloud ?? []
  const activeWarnings = satellites.filter((sat) => sat.collisionRisk === "critical" || sat.collisionRisk === "warning").length

  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-black/60 px-6 py-3">
      <div className="flex items-center gap-4">
        <motion.div
          className="relative flex h-3 w-3 items-center justify-center"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="absolute h-3 w-3 rounded-full bg-green-400 blur" />
          <span className="h-2 w-2 rounded-full bg-green-400" />
        </motion.div>
        <div>
          <div className="text-xs uppercase tracking-[0.4em] text-white/60">System Status</div>
          <div className="text-sm font-semibold text-green-300">ACTIVE</div>
        </div>
        <Badge className="border-cyan-400/40 text-cyan-200">Telemetry {loading ? "Syncing" : "Live"}</Badge>
      </div>
      <div className="flex items-center gap-6 text-xs uppercase tracking-[0.25em] text-white/60">
        <div>
          <div className="text-[10px] text-white/40">Simulation Time</div>
          <div className="text-white/90">{snapshot ? new Date(snapshot.timestamp).toLocaleTimeString() : "--:--:--"}</div>
        </div>
        <div>
          <div className="text-[10px] text-white/40">Total Satellites</div>
          <div className="text-white/90">{satellites.length.toString().padStart(2, "0")}</div>
        </div>
        <div>
          <div className="text-[10px] text-white/40">Tracked Debris</div>
          <div className="text-white/90">{debris.length.toLocaleString()}</div>
        </div>
        <div className="flex items-center gap-2">
          <motion.span
            className="h-2 w-2 rounded-full bg-orange-400"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          <div>
            <div className="text-[10px] text-white/40">Collision Warnings</div>
            <div className="text-white/90">{activeWarnings}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
