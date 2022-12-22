import * as THREE from 'three'
import { useMemo, useRef, useState } from 'react'

import { ThreeEvent, useFrame } from '@react-three/fiber'
import { RigidBody, RigidBodyApi } from '@react-three/rapier'

import { useControls } from 'leva'

import Material from './Material'

interface IBallProps {
  color: string
  radius: number
  start: [number, number, number]
}

const sphere = new THREE.SphereGeometry(1, 32, 64)

export default function Ball(props: IBallProps) {
  const ballRef = useRef<THREE.Mesh | null>(null)
  const bodyRef = useRef<RigidBodyApi | null>(null)

  const [cameraPosition, setCameraPosition] = useState(
    () => new THREE.Vector3(0, 0, 0),
  )

  useFrame((scene, delta) => {
    setCameraPosition(scene.camera.position)
  })

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    const v = new THREE.Vector3()
    v.subVectors(e.point, cameraPosition)
    v.normalize()
    v.multiplyScalar(5)
    bodyRef.current?.applyImpulse(v)
  }

  return (
    <RigidBody
      ref={bodyRef}
      colliders={'ball'}
      position={props.start}
      scale={props.radius}
      mass={1}
    >
      <mesh
        onClick={handleClick}
        position-y={1}
        ref={ballRef}
        castShadow
        receiveShadow
        geometry={sphere}
      >
        <Material color={props.color} />
      </mesh>
    </RigidBody>
  )
}
