import { Canvas } from '@react-three/fiber'
import { Player } from './resume/Player'
import { Html, OrbitControls } from '@react-three/drei'
import { useRouter } from 'next/navigation'
import React from 'react'
import { DirectionBillboard } from './resume/DirectionBillboard'

function SectionTrigger({ position, label, href }: { position: [number, number, number]; label: string; href: string }) {
  const router = useRouter()

  return (
    <mesh
      position={position}
      onClick={() => router.push(href)}
      onPointerOver={(e) => (e.stopPropagation(), (document.body.style.cursor = 'pointer'))}
      onPointerOut={(e) => (e.stopPropagation(), (document.body.style.cursor = 'auto'))}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial visible={false} />
      <Html center>
        <div className="rounded-lg bg-white px-2 py-1 text-xs text-black shadow-lg">{label}</div>
      </Html>
    </mesh>
  )
}

export default function SceneCanvas() {
  return (
    <Canvas className="fixed inset-0 -z-10" camera={{ position: [0, 3, 6], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Player position={[0, 0, 0]} />
      <DirectionBillboard position={[0, 1.5, -8]} rotation={[0, 0, 0]} text="Downtown →" />
      <SectionTrigger position={[5, 0, -5]} label="About" href="/about" />
      <SectionTrigger position={[-5, 0, -5]} label="Projects" href="/projects" />
      <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 2} target={[0, 1, 0]} />
    </Canvas>
  )
}