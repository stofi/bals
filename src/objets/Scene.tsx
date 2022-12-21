import * as THREE from 'three'
import { useMemo, useRef } from 'react'

import { Environment, OrbitControls, useHelper } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Attractor, RigidBody } from '@react-three/rapier'

import { useControls } from 'leva'

import Ball from './Ball'

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
      .map((_, i) => Math.random() * 0.6 + 0.1)
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

      <directionalLight
        ref={lightRef}
        castShadow
        position={[4, 5, 2]}
        shadow-camera-near={0.1}
        shadow-camera-far={20}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-mapSize-width={1024 * 2}
        shadow-mapSize-height={1024 * 2}
        shadow-bias={-0.0001}
      />

      {/* <hemisphereLight intensity={0.5} args={['lightblue', 'lightgreen']} /> */}

      <Environment preset='night' blur={1} background={false}></Environment>

      {/* <Ball color={color} radius={1} /> */}
      <Attractor
        range={range}
        strength={strength}
        type='linear'
        position={[0, 0, 0]}
      />
      <RigidBody
        type={'fixed'}
        includeInvisible={true}
        colliders={'ball'}
        scale={0.4}
      >
        <mesh visible={false}>
          <sphereBufferGeometry args={[1, 8, 8]} />
        </mesh>
      </RigidBody>
      {balls.map((props, i) => (
        <Ball key={i} {...props} />
      ))}
    </>
  )
}
