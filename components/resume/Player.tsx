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
  mobileLeftPressed?: boolean;
  mobileRightPressed?: boolean;
  mobileJumpPressed?: boolean; // Added prop
} & React.ComponentPropsWithoutRef<'group'>;

export const Player = forwardRef<RigidBody, PlayerProps>((props, ref) => {
  const { 
    onMoveChange, 
    mobileLeftPressed = false,
    mobileRightPressed = false,
    mobileJumpPressed = false, // Added default value
    ...restProps 
  } = props;
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
  const walkAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize and manage walk audio
  React.useEffect(() => {
    const audio = new Audio('/music/walk3.mp3');
    audio.loop = true;
    walkAudioRef.current = audio;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Resume walk sound if the player is moving
        if (prevMovingRef.current && walkAudioRef.current?.paused) {
          walkAudioRef.current.play().catch((err) => console.error("Error playing walk sound:", err));
        }
      } else {
        // Pause walk sound when tab is inactive
        walkAudioRef.current?.pause();
      }
    };

    // Add event listener for visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      // Cleanup
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (walkAudioRef.current) {
        walkAudioRef.current.pause();
        walkAudioRef.current = null;
      }
    };
  }, []);

  useFrame((state) => {
    if (!bodyRef.current) return

    // For debugging:
    // console.log("Keys state in Player:", keys.forward, keys.backward);

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
        // Play walk sound
        if (walkAudioRef.current && walkAudioRef.current.paused) {
          walkAudioRef.current.play().catch(error => console.error("Error playing walk sound:", error));
        }
      } else if (actions[walkAnim]) {
        if (currentAnimRef.current === walkAnim) {
          actions[walkAnim].fadeOut(0.3)
          setTimeout(() => { if (actions[walkAnim]) actions[walkAnim].stop() }, 300)
          currentAnimRef.current = null
        }
        // Pause walk sound
        if (walkAudioRef.current && !walkAudioRef.current.paused) {
          walkAudioRef.current.pause();
          walkAudioRef.current.currentTime = 0; // Reset for next play
        }
      }
      prevMovingRef.current = moving
    }

    // Forward the ref to parent
    if (ref) {
      ref.current = bodyRef.current
    }

    const velocity = bodyRef.current.linvel()
    const newVelocity = new Vector3(0, velocity.y, 0) // Keep current Y velocity for jumps/gravity

    // Calculate intended movement deltas based on keyboard and mobile inputs
    let deltaX = 0;
    if (keys.right || mobileRightPressed) { // Player moves right with keyboard OR mobile input
      deltaX += 1;
    }
    if (keys.left || mobileLeftPressed) { // Player moves left with keyboard OR mobile input
      deltaX -= 1;
    }

    let deltaZ = 0;
    // if (keys.backward) { // Assuming no mobile forward/backward for now
    //   deltaZ += 1;
    // }
    // if (keys.forward) { // Assuming no mobile forward/backward for now
    //   deltaZ -= 1;
    // }

    newVelocity.x = deltaX * movementSpeed;
    newVelocity.z = deltaZ * movementSpeed;

    // Apply damping if there's no directional input
    if (deltaX === 0 && deltaZ === 0) {
      const dampingFactor = 1 - damping * (state.clock.getDelta());
      newVelocity.x = velocity.x * dampingFactor;
      newVelocity.z = velocity.z * dampingFactor;
    }

    // Handle jumping
    if ((keys.jump || mobileJumpPressed) && Math.abs(velocity.y) < 0.1) { // Check mobileJumpPressed
      newVelocity.y = jumpForce
    }

    bodyRef.current.setLinvel(newVelocity, true)

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
    // Calculate movement direction vector (only X and Z components)
    const movementDir = new Vector3(deltaX, 0, deltaZ);
    if (movementDir.lengthSq() > 0.001) { // If there is significant movement input
        movementDir.normalize();
        const angle = Math.atan2(movementDir.x, movementDir.z); // Calculate angle based on X and Z
        const rotation = new Quaternion();
        rotation.setFromAxisAngle(new Vector3(0, 1, 0), angle);
        bodyRef.current.setRotation(rotation, true);
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
        dispose={null}
      />
    </RigidBody>
  )
})

// Preload the model for performance
useGLTF.preload('/models/player.glb')
