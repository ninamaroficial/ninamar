'use client'

import { useRef, Suspense, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'

interface ModelProps {
  modelPath: string
  scale?: number
}

function Model({ modelPath, scale = 1 }: ModelProps) {
  const { scene } = useGLTF(modelPath)
  const modelRef = useRef<THREE.Group>(null)

  useEffect(() => {
    console.log('Modelo cargado:', scene)
    console.log('Scale aplicado:', scale)
  }, [scene, scale])

  // Animación sutil de flotación
  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.position.y = -0.3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={scale}
      position={[0, -2, 0]}
    />
  )
}

interface ProductViewer3DProps {
  modelPath: string
  autoRotate?: boolean
  scale?: number
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ffb3f9" />
    </mesh>
  )
}

// Precargar el modelo
useGLTF.preload('/models/producto-compressed.glb')

export default function ProductViewer3D({
  modelPath,
  autoRotate = true,
  scale = 2
}: ProductViewer3DProps) {
  useEffect(() => {
    console.log('ProductViewer3D montado')
    console.log('Model path:', modelPath)
    console.log('Scale:', scale)
    console.log('AutoRotate:', autoRotate)
  }, [modelPath, scale, autoRotate])

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      onCreated={() => console.log('Canvas creado')}
    >
      <Suspense fallback={<LoadingFallback />}>
        {/* Iluminación */}
        <ambientLight intensity={0.8} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <directionalLight position={[0, 5, 5]} intensity={0.5} />

        {/* Entorno para reflejos - usando archivo local */}
        <Environment files="/hdri/studio_small_03_1k.hdr" />

        {/* Modelo */}
        <Model modelPath={modelPath} scale={scale} />

        {/* Controles con restricción - sin dar vuelta completa */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          autoRotate={autoRotate}
          autoRotateSpeed={1.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
          dampingFactor={0.05}
          rotateSpeed={0.5}
        />
      </Suspense>
    </Canvas>
  )
}