import DeckGL from "@deck.gl/react"
import { ScatterplotLayer, PathLayer, BitmapLayer } from "@deck.gl/layers"
import { MapView } from "@deck.gl/core"
import { TileLayer } from "@deck.gl/geo-layers"
import type { Satellite } from "@/store/useTelemetryStore"

interface GroundTrackMapProps {
  satellites: Satellite[]
  timestamp?: string
}

const MAP_VIEW = new MapView({ repeat: true })

export function GroundTrackMap({ satellites, timestamp }: GroundTrackMapProps) {
  const layers = [
    new TileLayer({
      id: "basemap",
      data: "https://tiles.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      minZoom: 0,
      maxZoom: 7,
      tileSize: 256,
      renderSubLayers: (props) => {
        const bbox = props.tile.bbox
        if (!("west" in bbox)) return null
        const { west, south, east, north } = bbox
        return new BitmapLayer(props, {
          image: props.data,
          bounds: [west, south, east, north],
        })
      },
    }),
    new PathLayer({
      id: "history-tracks",
      data: satellites,
      getPath: (d: Satellite) => d.groundHistory ?? [],
      getColor: [0, 255, 255, 120],
      widthMinPixels: 1.5,
    }),
    new PathLayer({
      id: "prediction-tracks",
      data: satellites,
      getPath: (d: Satellite) => d.groundPrediction ?? [],
      getColor: [255, 0, 255, 140],
      widthMinPixels: 1.5,
    }),
    new ScatterplotLayer({
      id: "current-positions",
      data: satellites,
      getPosition: (d: Satellite) => {
        const gt = d.groundTrack
        if (Array.isArray(gt) && gt.length > 0) return gt[0] as [number, number]
        return [0, 0] as [number, number]
      },
      getFillColor: (d: Satellite) => (d.collisionRisk === "critical" ? [255, 80, 80] : [0, 255, 255]),
      getRadius: 15000,
      radiusUnits: "meters",
      opacity: 0.8,
      pickable: false,
    }),
    new PathLayer({
      id: "terminator-line",
      data: [getTerminatorLine(timestamp)],
      getPath: (d: Array<[number, number]>) => d,
      getColor: [40, 120, 255, 120],
      widthMinPixels: 2,
    }),
  ]

  return (
    <div className="relative h-full w-full rounded-xl border border-white/10 bg-gradient-to-b from-[#05070d] via-[#050505] to-[#05070d]">
      <DeckGL
        views={MAP_VIEW}
        controller={{ dragPan: true, dragRotate: false, scrollZoom: true }}
        initialViewState={{ longitude: 0, latitude: 0, zoom: 0.8 }}
        layers={layers}
      />
      <div className="pointer-events-none absolute left-4 top-4 text-[10px] uppercase tracking-[0.25em] text-white/70">
        Ground Track Map
      </div>
    </div>
  )
}

function getTerminatorLine(timestamp?: string) {
  const date = timestamp ? new Date(timestamp) : new Date()
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60
  const offset = (hour / 24) * 360 - 180
  const line: Array<[number, number]> = []
  for (let lat = -85; lat <= 85; lat += 5) {
    line.push([offset, lat])
  }
  return line
}
