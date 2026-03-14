import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import type { DebrisObject, Satellite } from "@/store/useTelemetryStore"

interface OrbitVisualizerProps {
  satellites: Satellite[]
  debris: DebrisObject[]
  selectedId?: string
  onSelect?: (id?: string) => void
}

export function OrbitVisualizer({ satellites, debris, selectedId, onSelect }: OrbitVisualizerProps) {
  return (
    <div className="relative h-full w-full">
      <Canvas camera={{ position: [3.2, 1.6, 3.2], fov: 42 }} gl={{ antialias: true }}>
        <color attach="background" args={["#020205"]} />
        <ambientLight intensity={0.6} />
        <pointLight position={[4, 2, 2]} intensity={1.2} color="#4ff0ff" />
        <Stars radius={80} depth={50} count={1500} factor={4} saturation={0} fade />
        <Earth />
        <Atmosphere />
        <OrbitRings />
        <SatelliteInstances satellites={satellites} selectedId={selectedId} onSelect={onSelect} />
        <DebrisField debris={debris} />
        <TrajectoryLine satellites={satellites} selectedId={selectedId} />
        <OrbitControls enablePan enableZoom enableRotate dampingFactor={0.1} />
      </Canvas>
      <div className="pointer-events-none absolute left-4 top-4 rounded-md border border-cyan-400/30 bg-black/40 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-cyan-200 shadow-[0_0_20px_rgba(0,242,255,0.2)]">
        Orbital Visualizer
      </div>
    </div>
  )
}

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.05
    }
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          uTime: { value: 0 },
          uGlow: { value: 0.6 },
        }}
        vertexShader={EARTH_VERTEX}
        fragmentShader={EARTH_FRAGMENT}
      />
    </mesh>
  )
}

function Atmosphere() {
  return (
    <mesh scale={1.08}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        vertexShader={ATMOSPHERE_VERTEX}
        fragmentShader={ATMOSPHERE_FRAGMENT}
      />
    </mesh>
  )
}

function OrbitRings() {
  const rings = [1.4, 1.7, 2.0]
  return (
    <group>
      {rings.map((r) => (
        <mesh key={r} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r, r + 0.01, 128]} />
          <meshBasicMaterial color="#00f2ff" transparent opacity={0.2} />
        </mesh>
      ))}
    </group>
  )
}

function SatelliteInstances({ satellites, selectedId, onSelect }: OrbitVisualizerProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const colorArray = useMemo(() => new Float32Array(satellites.length * 3), [satellites.length])

  useEffect(() => {
    satellites.forEach((sat, i) => {
      const color =
        sat.id === selectedId
          ? new THREE.Color("#ff00ff")
          : sat.collisionRisk === "critical"
          ? new THREE.Color("#ff4d4d")
          : sat.collisionRisk === "warning"
          ? new THREE.Color("#ffb347")
          : new THREE.Color("#00ffff")
      color.toArray(colorArray, i * 3)
    })
  }, [satellites, selectedId, colorArray])

  useFrame(() => {
    if (!meshRef.current) return
    const temp = new THREE.Object3D()
    satellites.forEach((sat, i) => {
      temp.position.set(sat.position.x, sat.position.y, sat.position.z)
      temp.updateMatrix()
      meshRef.current!.setMatrixAt(i, temp.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, satellites.length]}
      onPointerDown={(event) => {
        if (!onSelect) return
        const instanceId = event.instanceId ?? undefined
        if (instanceId === undefined) return
        const sat = satellites[instanceId]
        if (sat) onSelect(sat.id)
      }}
    >
      <sphereGeometry args={[0.035, 12, 12]} />
      <meshStandardMaterial emissive="#00f2ff" emissiveIntensity={2.5} transparent vertexColors />
      <instancedBufferAttribute attach="instanceColor" args={[colorArray, 3]} />
    </instancedMesh>
  )
}

function DebrisField({ debris }: { debris: DebrisObject[] }) {
  const pointsRef = useRef<THREE.Points>(null)
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    const positions = new Float32Array(debris.length * 3)
    debris.forEach((obj, i) => {
      positions[i * 3 + 0] = obj.position.x
      positions[i * 3 + 1] = obj.position.y
      positions[i * 3 + 2] = obj.position.z
    })
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    return geom
  }, [debris])

  const criticalGeometry = useMemo(() => {
    const critical = debris.filter((obj) => obj.risk === "critical")
    const geom = new THREE.BufferGeometry()
    const positions = new Float32Array(critical.length * 3)
    critical.forEach((obj, i) => {
      positions[i * 3 + 0] = obj.position.x
      positions[i * 3 + 1] = obj.position.y
      positions[i * 3 + 2] = obj.position.z
    })
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    return geom
  }, [debris])

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0005
    }
  })

  return (
    <group>
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial color="#ffffff" size={0.01} transparent opacity={0.5} />
      </points>
      <points geometry={criticalGeometry}>
        <pointsMaterial color="#ff4d4d" size={0.02} transparent opacity={0.9} />
      </points>
    </group>
  )
}

function TrajectoryLine({ satellites, selectedId }: { satellites: Satellite[]; selectedId?: string }) {
  const target = satellites.find((sat) => sat.id === selectedId)
  if (!target) return null
  const history = target.history ?? []
  const prediction = target.prediction ?? []

  const historyGeometry = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(history.map((p) => new THREE.Vector3(p.x, p.y, p.z))),
    [history]
  )
  const predictionGeometry = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(prediction.map((p) => new THREE.Vector3(p.x, p.y, p.z))),
    [prediction]
  )

  return (
    <group>
      {history.length > 1 && (
        <line>
          <primitive object={historyGeometry} attach="geometry" />
          <lineBasicMaterial color="#00ffff" transparent opacity={0.5} />
        </line>
      )}
      {prediction.length > 1 && (
        <line>
          <primitive object={predictionGeometry} attach="geometry" />
          <lineBasicMaterial color="#ff00ff" transparent opacity={0.6} />
        </line>
      )}
    </group>
  )
}

const EARTH_VERTEX = `
varying vec2 vUv;
varying vec3 vNormal;
void main() {
  vUv = uv;
  vNormal = normal;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const EARTH_FRAGMENT = `
uniform float uTime;
uniform float uGlow;
varying vec2 vUv;
varying vec3 vNormal;
void main() {
  float lat = vUv.y * 3.14159;
  float bands = sin(lat * 6.0 + uTime * 0.2) * 0.1;
  vec3 base = vec3(0.02, 0.08, 0.14);
  vec3 lights = vec3(0.0, 0.5, 0.6);
  float city = smoothstep(0.1, 0.8, bands + vUv.x * 0.2);
  float glow = pow(1.0 - dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 2.5);
  vec3 color = base + lights * city * 0.35 + vec3(0.0, 0.2, 0.4) * glow * uGlow;
  gl_FragColor = vec4(color, 1.0);
}
`

const ATMOSPHERE_VERTEX = `
varying vec3 vNormal;
void main() {
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const ATMOSPHERE_FRAGMENT = `
varying vec3 vNormal;
void main() {
  float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
  vec3 glow = vec3(0.2, 0.8, 1.0) * intensity;
  gl_FragColor = vec4(glow, intensity);
}
`
