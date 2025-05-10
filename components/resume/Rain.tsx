import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import { BufferGeometry, Vector3 } from 'three'

export function Rain() {
  const pointsRef = useRef<typeof Points>(null)

  const positions = useMemo(() => {
    const p = new Float32Array(1000 * 3)
    for (let i = 0; i < 5000; i++) {
      p[i * 3 + 0] = (Math.random() - 0.5) * 200 // x
      p[i * 3 + 1] = Math.random() * 20 + 10     // y
      p[i * 3 + 2] = (Math.random() - 0.5) * 200 // z
    }
    return p
  }, [])

  useFrame(() => {
    if (!pointsRef.current) return
    const { array } = (pointsRef.current as unknown as Points<BufferGeometry>).geometry.attributes.position
    for (let i = 0; i < array.length; i += 3) {
      array[i + 1] -= 0.1
      if (array[i + 1] < 0) {
        array[i + 1] = 20
      }
    }
    (pointsRef.current as unknown as Points<BufferGeometry>).geometry.attributes.position.needsUpdate = true
  })

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled>
      <PointMaterial size={0.25} color="#aaddff" />
    </Points>
  )
}
