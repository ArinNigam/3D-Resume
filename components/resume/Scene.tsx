import { OrbitControls, Float, Billboard, Grid, Sphere, Environment, Edges, Text as DreiText } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { Ground } from './Ground'
import { Player } from './Player'
import { useControls } from 'leva'
import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ResumeData } from '../../lib/server/redisActions';
import { Vector3, PerspectiveCamera, Color, BackSide } from 'three'
import { useSpring, a } from '@react-spring/three'
import { Rain } from './Rain'
import { DirectionSign } from './DirectionSign'

// Animated board that opens only when player is inside its 5×5 footprint
const AnimatedBoard = ({
  positionX = -5,
  positionY = 0.2,
  positionZ = -2,
  playerPos,
  label,
  children,
}: {
  positionX?: number
  positionY?: number
  positionZ?: number
  playerPos: Vector3
  label?: string
  children: React.ReactNode
}) => {
  const inside =
    Math.abs(playerPos.x - positionX) <= 2.5 &&
    Math.abs(playerPos.z - positionZ) <= 2.5

  // animate box fill and text opacity
  const { fill, textOpacity } = useSpring({
    fill: inside ? 0.5 : 0,
    textOpacity: inside ? 1 : 0,
    config: { mass: 1, tension: 120, friction: 60 },
  })

  return (
    <a.group
      position-x={positionX}
      position-y={positionY}
      position-z={positionZ}
    >
      {/* outline */}
      <mesh>
        <boxGeometry args={[5, 0, 5]} />
        <meshStandardMaterial transparent opacity={0} />
        <Edges scale={[1.01,1.01,1.01]} color="white" />
      </mesh>

      {/* animated fill */}
      <a.mesh>
        <boxGeometry args={[5, 2, 5]} />
        <a.meshStandardMaterial transparent opacity={fill} />
      </a.mesh>

      {/* label or content with fade */}
      <Billboard lockX lockY lockZ position={[0, 2, 0]}>
        {inside ? (
          <a.group opacity={textOpacity}>
            <Float>{children}</Float>
          </a.group>
        ) : label ? (
          <a.group opacity={textOpacity.to(o => 1)}>
            <DreiText color="white" fontSize={1} anchorX="center" anchorY="middle"
              rotation={[0, -Math.PI / 4, 0]}>
              {label}
            </DreiText>
          </a.group>
        ) : null}
      </Billboard>
    </a.group>
  )
}

// add date formatter
function formatDate(input: string) {
  const d = new Date(input)
  return d.toLocaleString('default', { month: 'long', year: 'numeric' })
}

export const Scene = ({ resume }: { resume: ResumeData }) => {
  const audioRef = useRef<HTMLAudioElement>()
  const { gravity } = useControls('Physics', {
    gravity: {
      value: -9.81,
      min: -20,
      max: 0,
      step: 0.1
    }
  })

  const { followSpeed } = useControls('Camera', {
    followSpeed: {
      value: 5,
      min: 0,
      max: 10,
      step: 0.1
    }
  })

  const { showAxes, axesSize, showGrid } = useControls('Debug', {
    showAxes: false,
    axesSize: {
      value: 100,
      min: 10,
      max: 200,
      step: 10
    },
    showGrid: false
  })

  const { camera } = useThree();
  const playerRef = useRef<RigidBody>(null)
  const orbitRef = useRef<OrbitControls>(null)
  const [currentSection, setCurrentSection] = useState(-1)
  const { zoom } = useControls('Camera', {
    zoom: {
      value: 50,
      min: 20,
      max: 90,
      step: 1
    }
  })
  const [playerMoving, setPlayerMoving] = useState(false)
  const targetFov = useRef(50)
  const [freeCamera, setFreeCamera] = useState(false)
  const [playerPos, setPlayerPos] = useState<Vector3>(new Vector3())

  useEffect(() => {
    camera.up.set(0, 1, 0)
    targetFov.current = playerMoving ? 90 : 50;

    const handleTouchpadClick = () => {
      setFreeCamera(!freeCamera)
    }

    window.addEventListener('click', handleTouchpadClick)
    return () => {
      window.removeEventListener('click', handleTouchpadClick)
    }
  }, [camera, playerMoving, freeCamera])

  useFrame(() => {
    if (!playerRef.current) return;
    const pos = playerRef.current.translation();
    setPlayerPos(new Vector3(pos.x, pos.y, pos.z));

    console.log(`Player Position → x: ${pos.x.toFixed(2)}, y: ${pos.y.toFixed(2)}, z: ${pos.z.toFixed(2)}`);

    if (!freeCamera) {
      camera.position.set(
        pos.x - 10,
        pos.y + 6,
        pos.z + 10 
      );
      camera.up.set(0, 1, 0);
      camera.lookAt(pos.x, pos.y, pos.z);
    } else {
      if (orbitRef.current) {
        orbitRef.current.target.copy(pos)
      }
    }

    // Smoothly interpolate camera FOV toward targetFov
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const perspCam = camera as PerspectiveCamera;
    perspCam.fov = lerp(perspCam.fov, targetFov.current, 0.08);
    perspCam.updateProjectionMatrix();

    // Update current section based on player position
    const sectionLength = 15;  // match board width
    const newSection = Math.floor(pos.x / sectionLength);
    if (newSection !== currentSection) {
      setCurrentSection(newSection);
    }
  });

  // Set a brownish blurry background
  const { scene } = useThree()
  useEffect(() => {
    scene.background = new Color('#f8c291') // deep brown
  }, [scene])

  // center workExperience row around x=12
  const expCount = resume.workExperience.length
  const centerIndex = (expCount - 1) / 2

  // sort chronologically by start date
  const sortedWork = [...resume.workExperience].sort((a, b) =>
    new Date(a.start).getTime() - new Date(b.start).getTime()
  )
  const sortedEdu = [...resume.education].sort((a, b) =>
    new Date(a.start).getTime() - new Date(b.start).getTime()
  )

  return (
    <>
      <Environment preset="sunset" backgroundBlurriness={100} />
      <Rain />
      <OrbitControls
        ref={orbitRef}
        enabled={freeCamera}
        maxPolarAngle={Math.PI/2 - Math.PI / 12  } // Prevent camera from going above ground
        minDistance={5} // Minimum zoom distance
        maxDistance={20} // Maximum zoom distance
      />

      {/* Warm ambient light*/}
      {/*<ambientLight intensity={0} color="#b08c4a" />*/}
      {/*/!* Soft hemisphere light for diffuse effect *!/*/}
      {/*<hemisphereLight*/}
      {/*  skyColor="#b08c4a"*/}
      {/*  groundColor="#3a2a1e"*/}
      {/*  intensity={3}*/}
      {/*/>*/}
      {/*/!* Optional: softer directional light *!/*/}
      {/*<directionalLight*/}
      {/*  castShadow*/}
      {/*  position={[10, 10, 5]}*/}
      {/*  intensity={1}*/}
      {/*  color="#b08c4a"*/}
      {/*  shadow-mapSize={[1024, 1024]}*/}
      {/*/>*/}
      {/*/!* Blurry dome sky *!/*/}
      <mesh scale={[100, 100, 100]} position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#00008B" roughness={10} metalness={0} side={BackSide} />
      </mesh>

      {/* Coordinate System Helpers */}
      {showGrid && (
        <>
          {/* XZ Grid */}
          <Grid
            args={[axesSize * 2, axesSize * 2]}
            position={[0, 0, 0]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#6f6f6f"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#9d4b4b"
            fadeDistance={axesSize}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid
          />
          {/* XY Grid */}
          <Grid
            args={[axesSize * 2, axesSize * 2]}
            position={[0, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#6f6f6f"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#4b9d4b"
            fadeDistance={axesSize}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid
          />
          {/* YZ Grid */}
          <Grid
            args={[axesSize * 2, axesSize * 2]}
            position={[0, 0, 0]}
            rotation={[0, Math.PI / 2, 0]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#6f6f6f"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#4b4b9d"
            fadeDistance={axesSize}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid
          />
        </>
      )}

      {showAxes && (
        <>
          {/* X Axis (Red) */}
          <group position={[0, 0, 0]}>
            <mesh position={[axesSize / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, axesSize]} />
              <meshBasicMaterial color="red" />
            </mesh>
            <Sphere position={[axesSize, 0, 0]} args={[0.2]}>
              <meshBasicMaterial color="red" />
            </Sphere>
            <Billboard position={[axesSize + 1, 0, 0]}>
              <DreiText color="red" fontSize={0.5}>X</DreiText>
            </Billboard>
          </group>

          {/* Y Axis (Green) */}
          <group position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <mesh position={[axesSize / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, axesSize]} />
              <meshBasicMaterial color="green" />
            </mesh>
            <Sphere position={[axesSize, 0, 0]} args={[0.2]}>
              <meshBasicMaterial color="green" />
            </Sphere>
            <Billboard position={[axesSize + 1, 0, 0]}>
              <DreiText color="green" fontSize={0.5}>Y</DreiText>
            </Billboard>
          </group>

          {/* Z Axis (Blue) */}
          <group position={[0, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <mesh position={[axesSize / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, axesSize]} />
              <meshBasicMaterial color="blue" />
            </mesh>
            <Sphere position={[axesSize, 0, 0]} args={[0.2]}>
              <meshBasicMaterial color="blue" />
            </Sphere>
            <Billboard position={[axesSize + 1, 0, 0]}>
              <DreiText color="blue" fontSize={0.5}>Z</DreiText>
            </Billboard>
          </group>
        </>
      )}

      {/* Resume Experience Boards */}
      {sortedWork.map((exp, index) => {
        const px = index * 15
        const pz = -1
        return (
          <group key={`exp-${index}`}>
            <AnimatedBoard
              positionX={px}
              positionY={0.1}
              positionZ={pz}
              playerPos={playerPos}
              label={`Work Experience ${index + 1}`}
            >
              <DreiText
                color="red"
                fontSize={1}
                rotation={[0, -Math.PI / 4, 0]}
                position={[0, 2, 0]} 
              >
                {exp.company}
              </DreiText>
              <DreiText
                color="yellow"
                fontSize={0.8}
                rotation={[0, -Math.PI / 4, 0]}
                position={[0, 1, 0]} 
              >
                {exp.title}
              </DreiText>
            </AnimatedBoard>
            <DirectionSign
              position={[px + 3, 1, pz]}
              rotation={[0, -Math.PI / 2, 0]}
              text={`${formatDate(exp.start)} - ${formatDate(exp.end!)}`}
            />
          </group>
        )
      })}

      {/* Education Boards */}
      {sortedEdu.map((edu, index) => {
        const eduIndex = sortedWork.length + index
        const px = eduIndex * 15
        const pz = -1
        return (
          <group key={`edu-${index}`}>
            <AnimatedBoard
              positionX={px}
              positionY={0.2}
              positionZ={pz}
              playerPos={playerPos}
              label={`Education ${index + 1}`}
            >
              <DreiText 
                color="red" 
                fontSize={0.5}
                anchorX="center" 
                anchorY="middle"
                rotation={[0, -Math.PI / 4, 0]}
                position={[0, 2, 0]} 
              >
                {edu.school}
              </DreiText>
              <DreiText
                color="yellow"
                fontSize={0.4}
                anchorX="center"
                anchorY="middle"
                rotation={[0, -Math.PI / 4, 0]}
                position={[0, 1, 0]} 
              >
                {edu.degree}
              </DreiText>
            </AnimatedBoard>
            <DirectionSign
              position={[px + 3, 1, pz]}
              rotation={[0, -Math.PI / 2, 0]}
              text={`${formatDate(edu.start)} - ${formatDate(edu.end)}`}
            />
          </group>
        )
      })}

      <Physics gravity={[0, gravity, 0]}>
        <Ground />
        <Player ref={playerRef} onMoveChange={setPlayerMoving} />
      </Physics>
    </>
  )
}
