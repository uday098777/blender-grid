import { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, Html, useProgress } from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'

// ---- GLB Model with error handling ----
function GLBModel({ url, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, onLoaded, onClick, interactive = true }) {
  const [model, setModel] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loader = new GLTFLoader()
    loader.load(
      url,
      (gltf) => {
        setModel(gltf.scene)
        setLoading(false)
        if (onLoaded) onLoaded(gltf.scene)
      },
      undefined,
      (err) => {
        console.error(`Failed to load ${url}:`, err)
        setError(err)
        setLoading(false)
      }
    )
  }, [url])

  if (loading) return null
  if (error || !model) {
    return <FallbackModel position={position} scale={scale} onClick={onClick} interactive={interactive} />
  }

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={interactive ? onClick : undefined}
      onPointerOver={interactive ? (e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' } : undefined}
      onPointerOut={interactive ? () => { document.body.style.cursor = 'auto' } : undefined}
    >
      <primitive object={model} />
    </group>
  )
}

// ---- Fallback when GLB is LFS pointer / invalid ----
function FallbackModel({ position = [0, 0, 0], scale = 1, onClick, label = '3D Model' }) {
  return (
    <group position={position} scale={scale} onClick={onClick}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}>
      {/* A simple stylized placeholder */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.3, 1]} />
        <meshStandardMaterial color="#8b6f3a" roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[1.4, 0.05, 0.9]} />
        <meshStandardMaterial color="#d4b87a" roughness={0.6} />
      </mesh>
      <Html center distanceFactor={8} position={[0, 0.5, 0]}>
        <div style={{
          background: 'rgba(10,14,23,0.85)',
          color: '#e8d5a0',
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid #c9a84c',
          fontSize: '14px',
          whiteSpace: 'nowrap',
          fontFamily: 'Georgia, serif',
          pointerEvents: 'none',
        }}>
          {label} — Click to continue
        </div>
      </Html>
    </group>
  )
}

// ---- Loading screen ----
function LoadingScreen() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div style={{
        background: 'rgba(10,14,23,0.9)',
        color: '#e8d5a0',
        padding: '16px 24px',
        borderRadius: '12px',
        border: '1px solid #c9a84c',
        fontSize: '16px',
        fontFamily: 'Georgia, serif',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚓</div>
        Loading... {Math.round(progress)}%
      </div>
    </Html>
  )
}

// ---- Stage 1: Book of Pirate Rules (full page) ----
function StageBook({ bookUrl, onBookClick }) {
  return (
    <Canvas shadows camera={{ position: [0, 1, 4], fov: 45 }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.4} color="#c9a84c" />
      <Stage adjustCamera={false} intensity={0.3} environment="sunset">
        <GLBModel
          url={bookUrl}
          scale={1.5}
          onClick={onBookClick}
          onLoaded={() => {}}
          label="Book of Pirate Rules"
        />
      </Stage>
      <OrbitControls enablePan={false} minDistance={2.5} maxDistance={6} maxPolarAngle={Math.PI / 1.8} />
      <LoadingScreen />
    </Canvas>
  )
}

// ---- Stage 2: Book opened full page (zoomed) ----
function StageBookOpen({ bookUrl, onBookClick }) {
  return (
    <Canvas shadows camera={{ position: [0, 0.5, 2.5], fov: 50 }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 6, 4]} intensity={1.5} castShadow />
      <pointLight position={[-2, 2, 2]} intensity={0.5} color="#ffcc66" />
      <Stage adjustCamera={false} intensity={0.3} environment="sunset">
        <GLBModel
          url={bookUrl}
          scale={2}
          position={[0, -0.2, 0]}
          rotation={[0, 0, 0]}
          onClick={onBookClick}
          label="Book Opened — Click to reveal the Map"
        />
      </Stage>
      <OrbitControls enablePan={false} minDistance={1.5} maxDistance={4} maxPolarAngle={Math.PI / 1.8} />
      <LoadingScreen />
    </Canvas>
  )
}

// ---- Stage 3: Pirate Map (full page, vertical) ----
function StageMap({ mapUrl, onMapClick, pearlUrl }) {
  return (
    <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.3} castShadow />
      <pointLight position={[-3, 5, -3]} intensity={0.3} color="#c9a84c" />

      {/* Pirate Map — full page, vertical orientation */}
      <GLBModel
        url={mapUrl}
        position={[0, 0.5, 0]}
        rotation={[0, 0, 0]}
        scale={1.8}
        onClick={onMapClick}
        label="Pirate Map — Click to summon the Black Pearl"
      />

      {/* Black Pearl — bottom, side, slightly raised, small */}
      <GLBModel
        url={pearlUrl}
        position={[2.5, -1.8, -0.5]}
        rotation={[0, -0.5, 0]}
        scale={0.3}
        interactive={false}
        onLoaded={() => {}}
        label="The Black Pearl"
      />

      <OrbitControls enablePan={false} minDistance={3} maxDistance={8} maxPolarAngle={Math.PI / 1.7} />
      <LoadingScreen />
    </Canvas>
  )
}

// ---- Main App ----
export default function App() {
  const [stage, setStage] = useState(0) // 0=book, 1=book open, 2=map+pearl
  const [transitioning, setTransitioning] = useState(false)

  const bookUrl = '/assets/book_of_pirate_rules_-_week_5.glb'
  const mapUrl = '/assets/pirate_map.glb'
  const pearlUrl = '/assets/the_black_pearl.glb'

  const handleTransition = (nextStage) => {
    setTransitioning(true)
    setTimeout(() => {
      setStage(nextStage)
      setTransitioning(false)
    }, 600)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Ocean/dark background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: stage === 2
          ? 'radial-gradient(ellipse at center, #1a2a3a 0%, #0a0e17 70%)'
          : 'radial-gradient(ellipse at center, #1a1410 0%, #0a0805 70%)',
        transition: 'background 0.6s ease',
      }} />

      {/* 3D Canvas Area */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: transitioning ? 0 : 1,
        transition: 'opacity 0.6s ease',
      }}>
        {stage === 0 && (
          <StageBook bookUrl={bookUrl} onBookClick={() => handleTransition(1)} />
        )}
        {stage === 1 && (
          <StageBookOpen bookUrl={bookUrl} onBookClick={() => handleTransition(2)} />
        )}
        {stage === 2 && (
          <StageMap mapUrl={mapUrl} onMapClick={() => {}} pearlUrl={pearlUrl} />
        )}
      </div>

      {/* UI Overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, padding: '20px 30px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        pointerEvents: 'none', zIndex: 10,
      }}>
        <h1 style={{
          color: '#c9a84c',
          fontSize: '24px',
          fontFamily: 'Georgia, serif',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          letterSpacing: '1px',
        }}>
          ☠ Pirate's Quest
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['Book', 'Book Open', 'Map & Pearl'].map((label, i) => (
            <div key={i} style={{
              width: '30px', height: '4px', borderRadius: '2px',
              background: stage >= i ? '#c9a84c' : 'rgba(201,168,76,0.3)',
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>
      </div>

      {/* Bottom hint */}
      <div style={{
        position: 'absolute', bottom: 30, left: 0, right: 0,
        textAlign: 'center', pointerEvents: 'none', zIndex: 10,
      }}>
        <p style={{
          color: 'rgba(232,213,160,0.7)',
          fontSize: '15px',
          fontFamily: 'Georgia, serif',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          {stage === 0 && '⚓ Click on the Book of Pirate Rules to open it'}
          {stage === 1 && '📜 Click the book to reveal the Pirate Map'}
          {stage === 2 && '🗺️ Explore the Pirate Map — The Black Pearl awaits below'}
        </p>
      </div>

      {/* Back button (stages 1+) */}
      {stage > 0 && (
        <button
          onClick={() => handleTransition(stage - 1)}
          style={{
            position: 'absolute', top: 70, left: 30,
            background: 'rgba(10,14,23,0.7)',
            color: '#c9a84c',
            border: '1px solid #c9a84c',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '14px',
            fontFamily: 'Georgia, serif',
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 20,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(201,168,76,0.2)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(10,14,23,0.7)'}
        >
          ← Back
        </button>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
