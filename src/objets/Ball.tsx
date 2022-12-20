import * as THREE from 'three'
import CustomShaderMaterial from 'three-custom-shader-material'
import { useMemo, useRef, useState } from 'react'

import { useTexture } from '@react-three/drei'
import { ThreeEvent, useFrame } from '@react-three/fiber'
import { RigidBody, RigidBodyApi } from '@react-three/rapier'

import { useControls } from 'leva'

import fragmentShader from '../shaders/ball/fragment.glsl'
import vertexShader from '../shaders/ball/vertex.glsl'

const textures = {
  albedo: './assets/textures/plastic/albedo.png',
  normal: './assets/textures/plastic/normal.png',
  roughness: './assets/textures/plastic/roughness.png',
}

interface IBallProps {
  color: string
  radius: number
  start: [number, number, number]
}

const textureHandler = (texture: THREE.Texture | THREE.Texture[]) => {
  if (Array.isArray(texture)) return
  texture.encoding = THREE.sRGBEncoding
}

export default function Ball(props: IBallProps) {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)
  const ballRef = useRef<THREE.Mesh | null>(null)
  const bodyRef = useRef<RigidBodyApi | null>(null)
  const albedo = useTexture(textures.albedo, textureHandler)
  const normal = useTexture(textures.normal)
  const roughness = useTexture(textures.roughness, textureHandler)

  const color = useMemo(() => new THREE.Color(props.color), [props.color])

  const {
    uT_12: [t1, t2],
    uT_34: [t3, t4],
    uT_56: [t5, t6],
    uT_78: [t7, t8],
  } = useControls({
    uT_12: {
      value: [0.1, 0.9],
      min: 0,
      max: 1,
    },

    uT_34: {
      value: [0.15, 1],
      min: 0,
      max: 1,
    },

    uT_56: {
      value: [0.15, 0.42],
      min: 0,
      max: 1,
    },

    uT_78: {
      value: [0, 1],
      min: 0,
      max: 1,
    },
  })

  const [cameraPosition, setCameraPosition] = useState(
    () => new THREE.Vector3(0, 0, 0),
  )

  useFrame((scene, delta) => {
    // if (ballRef.current) {
    //   ballRef.current.position.y = Math.sin(Date.now() / 1000) * 0.5 + 1
    // }

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta
      materialRef.current.uniforms.uColor.value = color

      materialRef.current.uniforms['uT_1'].value = t1
      materialRef.current.uniforms['uT_2'].value = t2
      materialRef.current.uniforms['uT_3'].value = t3
      materialRef.current.uniforms['uT_4'].value = t4
      materialRef.current.uniforms['uT_5'].value = t5
      materialRef.current.uniforms['uT_6'].value = t6
      materialRef.current.uniforms['uT_7'].value = t7
      materialRef.current.uniforms['uT_8'].value = t8
    }

    setCameraPosition(scene.camera.position)
  })

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    console.log('click', e.point)
    console.log('click', cameraPosition)
    const v = new THREE.Vector3()
    v.subVectors(e.point, cameraPosition)
    v.normalize()
    v.multiplyScalar(2)
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
      >
        <sphereGeometry args={[1, 32, 64]} />
        <CustomShaderMaterial
          baseMaterial={THREE.MeshStandardMaterial}
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          normalMap={normal}
          normalScale={new THREE.Vector2(-1, -1)}
          uniforms={{
            uTime: { value: 0 },
            uColor: { value: color },
            uAlbedoMap: { value: albedo },
            uNormalMap: { value: normal },
            uRoughnessMap: { value: roughness },
            uT_1: { value: 0 },
            uT_2: { value: 0 },
            uT_3: { value: 0 },
            uT_4: { value: 0 },
            uT_5: { value: 0 },
            uT_6: { value: 0 },
            uT_7: { value: 0 },
            uT_8: { value: 0 },
          }}
        />
      </mesh>
    </RigidBody>
  )
}
