import * as THREE from 'three'
import { useMemo, useRef } from 'react'

import { Environment, OrbitControls, useHelper } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Attractor } from '@react-three/rapier'

import { useControls } from 'leva'

import Ball from './Ball'

// Red: (255, 0, 0)
// Orange: (255, 165, 0)
// Yellow: (255, 255, 0)
// Peach: (255, 229, 180)
// Coral: (255, 127, 80)
// Salmon: (250, 128, 114)
// Tomato: (255, 99, 71)
// Maroon: (128, 0, 0)
// Brown: (139, 69, 19)
const colors = [
  '#0000ff',
  '#a500ff',
  '#ff00ff',
  '#e5b4ff',
  '#7f50ff',
  '#8072fa',
  '#6347ff',
  '#000080',
  '#45138b',
]

function distributePointsOnSphere(n: number, radius = 1) {
  const points = []
  const increment = Math.PI * (3 - Math.sqrt(5))
  const offset = 2 / n

  for (let i = 0; i < n; i++) {
    const y = i * offset - 1 + offset / 2
    const r = Math.sqrt(1 - y * y)
    const phi = i * increment
    const x = Math.cos(phi) * r
    const z = Math.sin(phi) * r
    const p = new THREE.Vector3(x, y, z).multiplyScalar(radius)
    points.push(p)
  }

  return points
}

export default function Scene({
  onChangeQuality,
}: {
  onChangeQuality: (quality: -1 | 0 | 1) => void
}) {
  const lightRef = useRef<THREE.DirectionalLight | null>(null)
  const count = 13

  const randomColors = useMemo(() => {
    return Array(count)
      .fill(0)
      .map((_, i) => colors[Math.floor(Math.random() * colors.length)])
  }, [])

  const randomRadius = useMemo(() => {
    return Array(count)
      .fill(0)
      .map((_, i) => Math.random() * 0.7 + 0.3)
  }, [])

  const randomStart = useMemo(() => {
    return Array(count)
      .fill(0)
      .map((_, i) => distributePointsOnSphere(count, 2)[i].toArray())
  }, [])

  const balls = useMemo(
    () =>
      Array(count)
        .fill(0)
        .map((_, i) => ({
          color: randomColors[i],
          radius: randomRadius[i],
          start: randomStart[i],
        })),
    [],
  )

  const { range, strength } = useControls({
    range: { value: 1000, min: 0, max: 1000 },
    strength: { value: 10, min: 0, max: 100 },
  })

  let smoothDelta = 1 / 30

  useFrame((state, delta) => {
    smoothDelta = smoothDelta * 0.99 + delta * 0.01

    if (smoothDelta < 1 / 30) {
      onChangeQuality(1)

      return
    }

    // if frame rate is medium, set quality to medium
    if (smoothDelta < 1 / 15) {
      onChangeQuality(0)

      return
    }

    // if frame rate is low, reduce quality
    if (smoothDelta < 1 / 5) {
      onChangeQuality(-1)

      return
    }

    // if frame rate is high, set quality to high
  })

  return (
    <>
      <OrbitControls makeDefault enablePan={false} enableZoom={false} />

      <directionalLight ref={lightRef} castShadow position={[4, 5, 2]} />

      {/* <hemisphereLight intensity={0.5} args={['lightblue', 'lightgreen']} /> */}

      <Environment preset='dawn' blur={1} background={true}></Environment>

      {/* <Ball color={color} radius={1} /> */}
      <Attractor
        range={range}
        strength={strength}
        type='linear'
        position={[0, 0, 0]}
      />
      {balls.map((props, i) => (
        <Ball key={i} {...props} />
      ))}
    </>
  )
}
