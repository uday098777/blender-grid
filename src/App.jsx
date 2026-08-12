import { Suspense, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

import bookUrl from '../attached_assets/book_of_pirate_rules_-_week_5_1786555426895.glb'
import compassUrl from '../attached_assets/jack_sparrows_compass_1786555420123.glb'
import mapUrl from '../attached_assets/pirate_map_1786555434471.glb'
import pearlUrl from '../attached_assets/the_black_pearl_1786555441556.glb'

const sceneBackground = '#080b11'

function Model({ url, targetSize, position = [0, 0, 0], rotation = [0, 0, 0], onClick }) {
  const { scene } = useGLTF(url)
  const model = useMemo(() => scene.clone(true), [scene])
  const modelRef = useRef()

  // The uploaded models have different native units. Fit each original model
  // to the scene without changing its geometry or materials.
  useLayoutEffect(() => {
    if (!modelRef.current) return

    const bounds = new THREE.Box3().setFromObject(modelRef.current)
    const size = bounds.getSize(new THREE.Vector3())
    const center = bounds.getCenter(new THREE.Vector3())
    const largestSide = Math.max(size.x, size.y, size.z)

    modelRef.current.position.set(-center.x, -center.y, -center.z)
    modelRef.current.scale.setScalar(targetSize / largestSide)
  }, [model, targetSize])

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={onClick}
      onPointerOver={onClick ? () => { document.body.style.cursor = 'pointer' } : undefined}
      onPointerOut={onClick ? () => { document.body.style.cursor = 'default' } : undefined}
    >
      <group ref={modelRef}>
        <primitive object={model} />
      </group>
    </group>
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 7, 6]} intensity={1.8} />
      <directionalLight position={[-5, 2, -4]} intensity={0.55} color="#c58f45" />
    </>
  )
}

function BookScene({ onBookClick }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5.8], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
    >
      <Lights />
      <Suspense fallback={null}>
        <Model url={bookUrl} targetSize={3.7} onClick={onBookClick} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={4.2}
        maxDistance={7}
        minPolarAngle={Math.PI / 2.5}
        maxPolarAngle={Math.PI / 1.7}
      />
    </Canvas>
  )
}

function MapScene() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.1, 7], fov: 43 }}
      gl={{ antialias: true, alpha: true }}
    >
      <Lights />
      <pointLight position={[0, 1.5, 3]} intensity={0.65} color="#f0bd69" />
      <Suspense fallback={null}>
        <Model url={mapUrl} targetSize={3.45} position={[0, 0.75, 0]} />
        <Model
          url={pearlUrl}
          targetSize={2.15}
          position={[0, -2.05, -0.15]}
          rotation={[0, -0.35, 0]}
        />
        <Model url={compassUrl} targetSize={0.92} position={[0, 2.45, 0.25]} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={5.2}
        maxDistance={9}
        minPolarAngle={Math.PI / 2.7}
        maxPolarAngle={Math.PI / 1.65}
      />
    </Canvas>
  )
}

function Loading() {
  return <div className="loading" aria-label="Loading 3D model" />
}

export default function App() {
  const [stage, setStage] = useState('book')

  return (
    <main className="pirate-world">
      <div className="scene">
        <Suspense fallback={<Loading />}>
          {stage === 'book' ? (
            <BookScene onBookClick={() => setStage('map')} />
          ) : (
            <MapScene />
          )}
        </Suspense>
      </div>

      {stage === 'map' && (
        <button
          className="back-button"
          type="button"
          onClick={() => setStage('book')}
          aria-label="Return to the book"
        >
          ‹
        </button>
      )}

      <style>{`
        :root {
          background: ${sceneBackground};
        }

        .pirate-world {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          position: relative;
          background:
            radial-gradient(ellipse at 50% 42%, #17202b 0%, #0b1018 48%, ${sceneBackground} 100%);
        }

        .scene {
          position: absolute;
          inset: 0;
        }

        .scene canvas {
          display: block;
          width: 100% !important;
          height: 100% !important;
        }

        .loading {
          position: absolute;
          inset: 0;
          background: ${sceneBackground};
        }

        .back-button {
          position: absolute;
          top: 22px;
          left: 24px;
          z-index: 3;
          width: 42px;
          height: 42px;
          border: 1px solid rgba(214, 166, 81, 0.58);
          border-radius: 50%;
          background: rgba(8, 11, 17, 0.5);
          color: #d6a651;
          font: 32px/36px Georgia, serif;
          cursor: pointer;
          opacity: 0.72;
          transition: opacity 180ms ease, background 180ms ease;
        }

        .back-button:hover,
        .back-button:focus-visible {
          opacity: 1;
          background: rgba(31, 37, 45, 0.8);
          outline: none;
        }

        @media (max-width: 600px) {
          .back-button {
            top: 14px;
            left: 14px;
          }
        }
      `}</style>
    </main>
  )
}

useGLTF.preload(bookUrl)
useGLTF.preload(compassUrl)
useGLTF.preload(mapUrl)
useGLTF.preload(pearlUrl)