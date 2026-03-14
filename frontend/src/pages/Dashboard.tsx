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
        <div className="pointer-events-none absolute inset-0 z-40 border-2 border-red-500/60 shadow-[0_0_40px_rgba(255,0,0,0.4)]">
          <div className="absolute right-6 top-16 rounded-md border border-red-500/60 bg-red-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-red-200">
            Critical Conjunction Warning
          </div>
          <div className="absolute right-10 top-10 h-24 w-24 animate-ping rounded-full border border-red-500/50" />
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60">
          <div className="rounded-lg border border-cyan-400/30 bg-black/70 px-6 py-4 text-xs uppercase tracking-[0.3em] text-cyan-200 shadow-[0_0_30px_rgba(0,242,255,0.3)]">
            Syncing Telemetry Feed...
          </div>
        </div>
      )}

      <div className="relative z-10 flex h-full flex-col">
        <SystemStatusBar />

        {error && (
          <div className="mx-6 mt-3 rounded-md border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-xs text-orange-200">
            {error}
          </div>
        )}

        <div className="grid flex-1 grid-cols-1 gap-4 px-6 py-4 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr_340px]">
          <GlassPanel className="flex flex-col" glow="magenta">
            <SatelliteList satellites={satellites} selectedId={selectedId} onSelect={selectSatellite} />
            <div className="mt-6">
              <FuelHeatmap satellites={satellites} />
            </div>
          </GlassPanel>

          <div className="relative flex h-full flex-col gap-4">
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

          <div className="flex h-full flex-col gap-4 xl:col-span-1 lg:col-span-2">
            <GlassPanel glow="orange">
              <BullseyeChart satellites={satellites} selectedId={selectedId} />
            </GlassPanel>
            <GlassPanel className="flex-1" glow="cyan">
              <TelemetryPanel satellites={satellites} selectedId={selectedId} />
            </GlassPanel>
          </div>
        </div>

        <div className="px-6 pb-6">
          <GlassPanel glow="magenta">
            <ManeuverTimeline satellites={satellites} />
          </GlassPanel>
        </div>
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
      groundTrack: sat.groundTrack ?? [lon, lat],
      groundHistory: sat.groundHistory ?? history,
      groundPrediction: sat.groundPrediction ?? prediction,
    }
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
