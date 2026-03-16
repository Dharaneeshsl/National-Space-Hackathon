import { useMemo, useState } from "react"
import { SystemStatusBar } from "@/components/SystemStatusBar/SystemStatusBar"
import { OrbitVisualizer } from "@/components/OrbitVisualizer/OrbitVisualizer"
import { GroundTrackMap } from "@/components/GroundTrackMap/GroundTrackMap"
import { BullseyeChart } from "@/components/BullseyeChart/BullseyeChart"
import { SatelliteList } from "@/components/SatelliteList/SatelliteList"
import { TelemetryPanel } from "@/components/TelemetryPanel/TelemetryPanel"
import { FuelHeatmap } from "@/components/FuelHeatmap/FuelHeatmap"
import { ManeuverTimeline } from "@/components/ManeuverTimeline/ManeuverTimeline"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button } from "@/components/ui/button"
import { useTelemetryPolling } from "@/hooks/useTelemetryPolling"
import { useTelemetryStore, type Satellite } from "@/store/useTelemetryStore"
import { positionFromElements } from "@/services/orbit"
import { motion } from "framer-motion"

export function Dashboard() {
  useTelemetryPolling()

  const snapshot = useTelemetryStore((s) => s.snapshot)
  const selectedId = useTelemetryStore((s) => s.selectedSatelliteId)
  const selectSatellite = useTelemetryStore((s) => s.selectSatellite)
  const error = useTelemetryStore((s) => s.error)
  const loading = useTelemetryStore((s) => s.loading)

  const [fullscreen, setFullscreen] = useState(false)

  const { satellites, debris } = useMemo(() => {
    const satellites = enrichGroundTracks(snapshot?.satellites ?? [], snapshot?.timestamp)
    return { satellites, debris: snapshot?.debris_cloud ?? [] }
  }, [snapshot])

  const critical = satellites.some((sat) => sat.collisionRisk === "critical")

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#050505] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,242,255,0.08),_transparent_50%),radial-gradient(circle_at_30%_20%,_rgba(188,19,254,0.12),_transparent_45%)]" />

      {critical && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute inset-0 z-40 border-2 border-danger/60 shadow-glow-red"
        >
          <div className="absolute right-6 top-16 rounded-md border border-danger/60 bg-danger/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-red-200 shadow-glow-red backdrop-blur-md">
            Critical Conjunction Warning
          </div>
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute right-10 top-10 h-24 w-24 rounded-full border-2 border-danger/80" 
          />
        </motion.div>
      )}

      {loading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-xl border border-primary/30 bg-panel px-8 py-5 text-sm uppercase tracking-[0.3em] text-primary shadow-glow-cyan"
          >
            Syncing Telemetry Feed...
          </motion.div>
        </div>
      )}

      <div className="relative z-10 flex h-full flex-col">
        <SystemStatusBar />

        {error && (
          <div className="mx-6 mt-3 rounded-md border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-xs text-orange-200">
            {error}
          </div>
        )}

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid flex-1 grid-cols-1 gap-5 px-6 py-4 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr_340px]"
        >
          <GlassPanel className="flex flex-col" glow="magenta">
            <SatelliteList satellites={satellites} selectedId={selectedId} onSelect={selectSatellite} />
            <div className="mt-6 flex-1">
              <FuelHeatmap satellites={satellites} />
            </div>
          </GlassPanel>

          <div className="relative flex h-full flex-col gap-5">
            <GlassPanel className="relative flex-1 overflow-hidden" glow="cyan">
              <div className="absolute right-4 top-4 z-20">
                <Button onClick={() => setFullscreen((prev) => !prev)}>
                  {fullscreen ? "Exit Fullscreen" : "Fullscreen"}
                </Button>
              </div>
              <OrbitVisualizer satellites={satellites} debris={debris} selectedId={selectedId} onSelect={selectSatellite} />
            </GlassPanel>
            <GlassPanel className="h-[240px]" glow="magenta">
              <GroundTrackMap satellites={satellites} timestamp={snapshot?.timestamp} />
            </GlassPanel>
          </div>

          <div className="flex h-full flex-col gap-5 xl:col-span-1 lg:col-span-2">
            <GlassPanel glow="orange">
              <BullseyeChart satellites={satellites} selectedId={selectedId} />
            </GlassPanel>
            <GlassPanel className="flex-1" glow="cyan">
              <TelemetryPanel satellites={satellites} selectedId={selectedId} />
            </GlassPanel>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="px-6 pb-6"
        >
          <GlassPanel glow="magenta">
            <ManeuverTimeline satellites={satellites} />
          </GlassPanel>
        </motion.div>
      </div>

      {fullscreen && (
        <div className="absolute inset-0 z-50 bg-black/95">
          <div className="absolute right-6 top-6 z-50">
            <Button onClick={() => setFullscreen(false)}>Exit Fullscreen</Button>
          </div>
          <OrbitVisualizer satellites={satellites} debris={debris} selectedId={selectedId} onSelect={selectSatellite} />
        </div>
      )}
    </div>
  )
}

function enrichGroundTracks(satellites: Satellite[], timestamp?: string) {
  return satellites.map((sat, idx) => {
    const fallbackPosition = {
      x: Math.cos(idx) * 1.4,
      y: Math.sin(idx * 0.4) * 0.2,
      z: Math.sin(idx) * 1.4,
    }
    const computed = sat.position ?? (sat.orbitalElements && timestamp ? positionFromElements(sat.orbitalElements, timestamp) : null)
    const position = computed ?? fallbackPosition
    const lat = ((position.y ?? 0) * 90) % 180
    const lon = ((position.x ?? 0) * 180 + idx * 5) % 360
    const history = buildPath(lon, lat, -90)
    const prediction = buildPath(lon, lat, 90)
    return {
      ...sat,
      position,
      groundTrack: (sat.groundTrack ?? [lon, lat]) as [number, number][],
      groundHistory: sat.groundHistory ?? history,
      groundPrediction: sat.groundPrediction ?? prediction,
    } as Satellite
  })
}

function buildPath(lon: number, lat: number, span: number) {
  const path: Array<[number, number]> = []
  for (let i = 0; i <= 24; i += 1) {
    const t = (i / 24) * span
    path.push([lon + t, Math.max(-80, Math.min(80, lat + Math.sin(i) * 8))])
  }
  return path
}
