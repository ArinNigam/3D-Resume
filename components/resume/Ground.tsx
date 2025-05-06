import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { useControls } from 'leva'
import { useGLTF } from '@react-three/drei'

export function Ground() {
    const { groundColor } = useControls('Ground', {
        groundColor: 'black'
    })
    const buildingGltf = useGLTF('/models/building.glb')
    const treeGltf = useGLTF('/models/tree.glb')

    return (
        <RigidBody type="fixed" restitution={0.2} friction={1}>
            <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color={groundColor} />
            </mesh>
            {/* Widened road */}
            <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[100, 6]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            <CuboidCollider args={[50, 3, 50]} position={[0, -2, 0]} />

            {/* Sidewalks */}
            <mesh receiveShadow position={[0, 0.02, 3.5]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[100, 1]} />
                <meshStandardMaterial color="#666" />
            </mesh>
            <mesh receiveShadow position={[0, 0.02, -3.5]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[100, 1]} />
                <meshStandardMaterial color="#666" />
            </mesh>

            {/* Center dashed lane markings */}
            {Array.from({ length: 25 }).map((_, j) => (
                <mesh
                    key={`dash-${j}`}
                    position={[-50 + (j + 0.5) * (100 / 25), 0.03, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                >
                    <planeGeometry args={[2, 0.2]} />
                    <meshStandardMaterial color="white" />
                </mesh>
            ))}

            {/* City buildings along left side */}
            {Array.from({ length: 16 }).map((_, i) => {
                const x = -38 + i * 5;
                const zLeft = -8;

                // Left side building
                return (
                    <primitive
                        key={`bldg-left-${i}`}
                        object={buildingGltf.scene.clone()}
                        position={[x, 0, zLeft]}
                        castShadow
                        receiveShadow
                    />
                )
            })}

            {/* Trees along right side */}
            {Array.from({ length: 16 }).map((_, i) => {
                const x = -38 + i * 5;
                const zRight = 8;

                // Right side tree (scaled down)
                return (
                    <primitive
                        key={`tree-${i}`}
                        object={treeGltf.scene.clone()}
                        position={[x, 0, zRight]}
                        scale={[0.3, 0.3, 0.3]}     // reduced size
                        castShadow
                        receiveShadow
                    />
                )
            })}
        </RigidBody>
    )
}

// Preload the building model
useGLTF.preload('/models/building.glb')
useGLTF.preload('/models/tree.glb')