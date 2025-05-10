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
    {/* left support pole */}
    <mesh position={[-6, 0, 2]}>
      <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
      <meshStandardMaterial color="#555" />
    </mesh>
    {/* right support pole */}
    <mesh position={[-8, 0, 4]}>
      <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
      <meshStandardMaterial color="#555" />
    </mesh>
    {/* tilted sign board */}
    <mesh position={[-7, 0.5, 3]} castShadow receiveShadow rotation={[0, Math.PI/4, 0]}>
      <boxGeometry args={[6.5, 1.2, 0.1]} />
      <meshStandardMaterial color="green" />
    </mesh>
      {/* top-aligned white text */}
    <Text
      fontSize={0.3}
      color="white"
      position={[-7, 0.5, 3.1]} 
      rotation={[0, Math.PI / 4, 0]}
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
    </group>
  )
}
