'use client'
import { Text } from '@react-three/drei'
import React from 'react'

type SignBoardProps = {
  position: [number, number, number]
  rotation?: [number, number, number]
  lines: string[]
}

export function SignBoard({
  position,
  rotation = [0, -Math.PI / 2, 0], 
  lines,
}: SignBoardProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* left support pole */}
      <mesh position={[-3.8, -2, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      {/* right support pole */}
      <mesh position={[3.8, -2, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      {/* board background */}
      <mesh>
        <boxGeometry args={[8, 2, 0.1]} />
        <meshStandardMaterial color="#046307" />
      </mesh>
      {/* text lines */}
      {lines.map((line, i) => (
        <Text
          key={i}
          fontSize={0.3}
          color="white"
          position={[0, 0.6 - i * 0.5, 0.06]}
          anchorX="center"
          anchorY="middle"
        >
          {line}
        </Text>
      ))}
    </group>
  )
}
