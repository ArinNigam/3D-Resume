"use client"
import { Text } from '@react-three/drei'
import { Mesh } from 'three'
import React from 'react'

type DirectionSignProps = {
  position?: [number,number,number]
  rotation?: [number,number,number]
  text: string
}

export function DirectionSign({
  position = [10, 2, -4],
  rotation = [0, Math.PI / 4, 0],
  text,
}: DirectionSignProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* left support pole */}
      <mesh position={[-3, -1.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      {/* right support pole */}
      <mesh position={[3, -1.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      {/* sign board */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[8, 1.2, 0.1]} />
        <meshStandardMaterial color="green" />
      </mesh>
      {/* top-aligned white text */}
      <Text
        fontSize={0.3}
        color="white"
        position={[0, 1.1, 0.06]}
        anchorX="center"
        anchorY="top"
      >
        {text}
      </Text>
    </group>
  )
}
