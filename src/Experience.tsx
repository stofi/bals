import * as THREE from 'three'
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
  const qualitySettings = [1 / 4, 1 / 2, 1]
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
            position: [3, 3, 3],
            frustumCulled: true,
          }}
        >
          <color args={['#7c3c2c']} attach='background' />
          <Suspense>
            <EffectComposer>
              <Bloom></Bloom>
              {/* <DepthOfField focusDistance={1}></DepthOfField> */}
            </EffectComposer>
            <fog attach='fog' args={['#7c3c2c', 12, 16]} />

            <Physics gravity={[0, 0, 0]}>
              <Scene onChangeQuality={handleQualityChange} />

              {/* <Debug /> */}
            </Physics>
          </Suspense>
        </Canvas>
      </Suspense>
    </>
  )
}
