import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { useControls } from 'leva'
import { useGLTF } from '@react-three/drei'
import React from 'react'

export function Ground() {
  const { groundColor } = useControls('Ground', {
    groundColor: 'black'
  })
  const gltf = useGLTF('/models/ground.glb')
  const { scene: groundScene } = gltf

  // Log only names of objects that could be the sky or background
  React.useEffect(() => {
    if (groundScene) {
      groundScene.traverse((child) => {
        if (
          typeof child.name === 'string' &&
          /(sky|background|env|cloud|atmosphere)/i.test(child.name)
        ) {
          console.log('Possible sky object:', child.name);
        }
      });
    }
  }, [groundScene]);

  return (
    <RigidBody type="fixed" restitution={0.2} friction={1}>
      <group scale={[0.01, 0.01, 0.01]} position={[300, 0, 70]}>
        <primitive object={groundScene} dispose={null} />
      </group>

      <CuboidCollider args={[150, 2, 400]} position={[0, -2, 0]} />

      {/* City buildings along both sides of the road */}
      {Array.from({ length: 16 }).map((_, i) => {
        // Place buildings at intervals along X, on both sides
        const x = -38 + i * 5;
        const zLeft = -8;
        const zRight = 8;
        const width = 3 + Math.random() * 1.5;
        const depth = 3 + Math.random() * 1.5;
        const height = 6 + Math.random() * 10;
        // Window stripes (just a different color band)
        return [
          // Left side building
          // <group key={`bldg-left-${i}`}>
          //   <mesh position={[x, height / 2, zLeft]} castShadow receiveShadow>
          //     <boxGeometry args={[width, height, depth]} />
          //     <meshStandardMaterial color="#b0b6ba" />
          //   </mesh>
          //   {/* Windows as stripes */}
          //   {Array.from({ length: Math.floor(height / 2) }).map((_, wi) => (
          //     <mesh
          //       key={`win-left-${i}-${wi}`}
          //       position={[x, 1.5 + wi * 2, zLeft + depth / 2 + 0.01]}
          //     >
          //       <boxGeometry args={[width * 0.8, 0.3, 0.05]} />
          //       <meshStandardMaterial color="#e6e9f0" emissive="#b3d0ff" emissiveIntensity={0.5} />
          //     </mesh>
          //   ))}
          // </group>,
          // Right side building
          // <group key={`bldg-right-${i}`}>
          //   <mesh position={[x, height / 2, zRight]} castShadow receiveShadow>
          //     <boxGeometry args={[width, height, depth]} />
          //     <meshStandardMaterial color="#b0b6ba" />
          //   </mesh>
          //   {Array.from({ length: Math.floor(height / 2) }).map((_, wi) => (
          //     <mesh
          //       key={`win-right-${i}-${wi}`}
          //       position={[x, 1.5 + wi * 2, zRight - depth / 2 - 0.01]}
          //     >
          //       <boxGeometry args={[width * 0.8, 0.3, 0.05]} />
          //       <meshStandardMaterial color="#e6e9f0" emissive="#b3d0ff" emissiveIntensity={0.5} />
          //     </mesh>
          //   ))}
          // </group>
        ]
      })}
    </RigidBody>
  )
}

useGLTF.preload('/models/ground.glb') 
