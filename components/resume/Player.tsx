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

    // Log available animation names once
    React.useEffect(() => {
        if (names && names.length > 0) {
            console.log('Player model animations:', names)
        }
    }, [names])
    
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

        // Update position display
        const position = bodyRef.current.translation()
        setControls({
            x: Number(position.x.toFixed(2)),
            y: Number(position.y.toFixed(2)),
            z: Number(position.z.toFixed(2))
        })

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
            rotation.setFromAxisAngle(new Vector3(0, 1, 0), 0)
            bodyRef.current.setRotation(rotation, true)
        } else if (keys.backward) {
            // Face positive Z axis: 180deg
            const rotation = new Quaternion()
            rotation.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI)
            bodyRef.current.setRotation(rotation, true)
        }
    })

    return (
        <RigidBody
            ref={bodyRef}
            colliders="cuboid"
            mass={1}
            type="dynamic"
            position={[0, 3, 0]}
            enabledRotations={[false, false, false]}
            lockRotations
            linearDamping={0.5}
            friction={1}
        >
            <primitive
                object={playerScene}
                scale={[0.01, 0.01, 0.01]}
                castShadow
            />
        </RigidBody>
    )
})

// Preload the model for performance
useGLTF.preload('/models/player.glb') 