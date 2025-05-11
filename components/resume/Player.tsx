import { useRef, forwardRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { useKeyboardControls } from '../../hooks/useKeyboardControls'
import { useControls, folder } from 'leva'
import { Vector3, Quaternion } from 'three'
import { useGLTF, useAnimations } from '@react-three/drei'
import React from 'react'

type PlayerProps = {
  onMoveChange?: (moving: boolean) => void;
} & React.ComponentPropsWithoutRef<'group'>;

export const Player = forwardRef<RigidBody, PlayerProps>((props, ref) => {
  const { onMoveChange, ...restProps } = props;
  const bodyRef = useRef<RigidBody>(null)
  const keys = useKeyboardControls()
  const gltf = useGLTF('/models/player.glb')
  const { scene: playerScene, animations } = gltf
  const { actions, names } = useAnimations(animations, playerScene)

  const [{ playerColor, movementSpeed, jumpForce, damping }, setControls] = useControls(() => ({
    Player: folder({
      playerColor: '#ff0000',
      movementSpeed: {
        value: 4,
        min: 0,
        max: 10,
        step: 0.1
      },
      jumpForce: {
        value: 5,
        min: 0,
        max: 10,
        step: 0.1
      },
      damping: {
        value: 2.5,
        min: 0,
        max: 5,
        step: 0.1
      }
    }),
    Position: folder({
      x: {
        value: 0,
        min: -50,
        max: 50,
        step: 0.1,
        disabled: true
      },
      y: {
        value: 0,
        min: -50,
        max: 50,
        step: 0.1,
        disabled: true
      },
      z: {
        value: 0,
        min: -50,
        max: 50,
        step: 0.1,
        disabled: true
      }
    })
  }))

  const prevPos = useRef({ x: NaN, y: NaN, z: NaN })

  // Log available animation names once
  React.useEffect(() => {
    if (names && names.length > 0) {
      console.log('Player model animations:', names)
    }
  }, [names])

  console.log(names);

  // Track previous movement state to only update animation when it changes
  const prevMovingRef = useRef(false)
  // Track the currently playing animation
  const currentAnimRef = useRef<string | null>(null)

  useFrame((state) => {
    if (!bodyRef.current) return

    // Read velocity BEFORE setting new velocity
    const currentVelocity = bodyRef.current.linvel()
    const moving = Math.abs(currentVelocity.x) > 0.01 || Math.abs(currentVelocity.z) > 0.01

    // Animation switching logic: only trigger when movement state changes
    const walkAnim = names.find(n => n === 'Take 001') || names[0]
    if (moving !== prevMovingRef.current) {
      if (onMoveChange) onMoveChange(moving)
      if (moving && actions[walkAnim]) {
        if (currentAnimRef.current !== walkAnim) {
          actions[walkAnim].reset().fadeIn(0.1).play()
          currentAnimRef.current = walkAnim
        }
      } else if (actions[walkAnim]) {
        if (currentAnimRef.current === walkAnim) {
          actions[walkAnim].fadeOut(0.3)
          setTimeout(() => { if (actions[walkAnim]) actions[walkAnim].stop() }, 300)
          currentAnimRef.current = null
        }
      }
      prevMovingRef.current = moving
    }

    // Forward the ref to parent
    if (ref) {
      ref.current = bodyRef.current
    }

    const velocity = bodyRef.current.linvel()
    const newVelocity = new Vector3(0, velocity.y, 0)

    // Handle movement based on world axes
    if (keys.right) {
      newVelocity.x = movementSpeed
    }
    if (keys.left) {
      newVelocity.x = -movementSpeed
    }
    if (keys.backward) {
      newVelocity.z = movementSpeed
    }
    if (keys.forward) {
      newVelocity.z = -movementSpeed
    }

    // Apply damping when no movement keys are pressed
    if (!keys.forward && !keys.backward && !keys.left && !keys.right) {
      const dampingFactor = 1 - damping * (state.clock.getDelta())
      newVelocity.x = velocity.x * dampingFactor
      newVelocity.z = velocity.z * dampingFactor
    }

    // Handle jumping
    if (keys.jump && Math.abs(velocity.y) < 0.1) {
      newVelocity.y = jumpForce
    }

    bodyRef.current.setLinvel(newVelocity, true)

    // Handle forward and backward impulses
    if (keys.forward) {
      bodyRef.current.applyImpulse({ x: 0, y: 0, z: -0.2 }, true)
      const rotation = new Quaternion()
      rotation.setFromAxisAngle(new Vector3(0, 1, 0), 0)
      bodyRef.current.setRotation(rotation, true)
    }
    if (keys.backward) {
      bodyRef.current.applyImpulse({ x: 0, y: 0, z: 0.2 }, true)
      const rotation = new Quaternion()
      rotation.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI)
      bodyRef.current.setRotation(rotation, true)
    }

    // Update position display only if it changes
    const position = bodyRef.current.translation()
    const x = Number(position.x.toFixed(2))
    const y = Number(position.y.toFixed(2))
    const z = Number(position.z.toFixed(2))

    if (x !== prevPos.current.x ||
        y !== prevPos.current.y ||
        z !== prevPos.current.z) {
      prevPos.current = { x, y, z }
      setControls({
        x,
        y,
        z
      })
    }

    // Player faces direction of movement
    if (keys.right) {
      // Face positive X axis: +90deg
      const rotation = new Quaternion()
      rotation.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)
      bodyRef.current.setRotation(rotation, true)
    } else if (keys.left) {
      // Face negative X axis: -90deg
      const rotation = new Quaternion()
      rotation.setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2)
      bodyRef.current.setRotation(rotation, true)
    } else if (keys.forward) {
      // Face negative Z axis: 0deg
      const rotation = new Quaternion()
      rotation.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI)
      bodyRef.current.setRotation(rotation, true)
    } else if (keys.backward) {
      // Face positive Z axis: 180deg
      const rotation = new Quaternion()
      rotation.setFromAxisAngle(new Vector3(0, 1, 0), 0)
      bodyRef.current.setRotation(rotation, true)
    }

    
  })

  return (
    // player initial postition
    <RigidBody
      ref={bodyRef}
      colliders="cuboid"
      mass={1}
      type="dynamic"
      position={[-8, -0.4, -1]}   // spawn just above floor
      enabledRotations={[false, false, false]}
      lockRotations
      linearDamping={0.5}
      friction={1}
    >
      <primitive
        object={playerScene}
        scale={[0.012, 0.012, 0.012]}
        castShadow
      />
    </RigidBody>
  )
})

// Preload the model for performance
useGLTF.preload('/models/player.glb')