import { Suspense, useState } from 'react'

import { Canvas, useFrame } from '@react-three/fiber'
import {
  Bloom,
  DepthOfField,
  EffectComposer,
} from '@react-three/postprocessing'
import { Debug, Physics, RigidBody } from '@react-three/rapier'

import { Leva } from 'leva'

import Scene from './objets/Scene'

export default function Experience() {
  const qualitySettings = [1 / 4, 1 / 2, 1, 2]
  const [qualityIndex, setQualityIndex] = useState(1)

  const handleQualityChange = (quality: -1 | 0 | 1) => {
    const index = Math.max(0, Math.min(qualitySettings.length - 1, quality + 1))
    setQualityIndex(index)
  }

  return (
    <>
      <Suspense>
        <Leva hidden={true} />
        <Canvas
          flat={false}
          shadows={true}
          dpr={qualitySettings[qualityIndex]}
          camera={{
            position: [-0.1, 0.1, -0.1],
            frustumCulled: true,
          }}
        >
          <color args={['lightblue']} attach='background' />
          <Suspense>
            <EffectComposer>
              <Bloom></Bloom>
              {/* <DepthOfField focusDistance={1}></DepthOfField> */}
            </EffectComposer>
            <Physics gravity={[0, 0, 0]}>
              <Scene onChangeQuality={handleQualityChange} />
              <RigidBody
                type={'fixed'}
                includeInvisible={true}
                colliders={'ball'}
                scale={0.5}
              >
                <mesh visible={false}>
                  <sphereBufferGeometry args={[1, 8, 8]} />
                </mesh>
              </RigidBody>
              {/* <Debug /> */}
            </Physics>
          </Suspense>
        </Canvas>
      </Suspense>
    </>
  )
}
