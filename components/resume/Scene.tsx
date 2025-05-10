import { OrbitControls, Text, Float, Billboard, Grid, Sphere, Environment, Edges } from '@react-three/drei'
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

// Animated board that lies flat, then flips up on X-axis; opens only when stepped on
const AnimatedBoard = ({
  index,
  positionX = -5,
  positionY = 0.2,
  positionZ = -2,
  currentSection,
  children,
}) => {
  // only animate boards whose index is between 0 and 5
  const active = currentSection === index && index >= 0 && index <= 5
  const { rotationZ } = useSpring({
    rotationZ: active ? Math.PI / 2 : 0,
    config: { mass: 1, tension: 170, friction: 26 },
  })

  return (
    <a.group position-x={positionX} position-y={positionY} position-z={positionZ}>
      {/* only mesh rotates */}
      <a.mesh scale-y={active ? 2 : 1}>
        <boxGeometry args={[5, 2, 5]} />
        <a.meshStandardMaterial
          color={active ? 'green' : 'blue'}
          transparent
          opacity={0.2}
        />
      </a.mesh>

      {/* text stays fixed in world space */}
      <Billboard
        position={[0, 2, 0]}
        lockX
        lockY
        lockZ
      >
        <Float >
          {children}
        </Float>
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
    const playerPosition = playerRef.current.translation();

    console.log(`Player Position → x: ${playerPosition.x.toFixed(2)}, y: ${playerPosition.y.toFixed(2)}, z: ${playerPosition.z.toFixed(2)}`);

    if (!freeCamera) {
      camera.position.set(
        playerPosition.x - 10,
        playerPosition.y + 6,
        playerPosition.z + 10 
      );
      camera.up.set(0, 1, 0);
      camera.lookAt(playerPosition.x, playerPosition.y, playerPosition.z);
    } else {
      if (orbitRef.current) {
        orbitRef.current.target.copy(playerPosition)
      }
    }

    // Smoothly interpolate camera FOV toward targetFov
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const perspCam = camera as PerspectiveCamera;
    perspCam.fov = lerp(perspCam.fov, targetFov.current, 0.08);
    perspCam.updateProjectionMatrix();

    // Update current section based on player position
    const sectionLength = 15;  // match board width
    const newSection = Math.floor(playerPosition.x / sectionLength);
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
              <Text color="red" fontSize={0.5}>X</Text>
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
              <Text color="green" fontSize={0.5}>Y</Text>
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
              <Text color="blue" fontSize={0.5}>Z</Text>
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
              index={index}
              currentSection={currentSection}
              positionX={px}
              positionY={currentSection === index ? 2 : 0}
              positionZ={pz}
            >
              {currentSection === index ? (
                <>
                  <Text
              color="red"
              fontSize={0.5}
              anchorX="center"
              anchorY="middle"
              rotation={[0, -Math.PI / 6, 0]}
              position={[0, 2, 0]} // company title, top
                  >
              {exp.company}
                  </Text>
                  <Text
              color="yellow"
              fontSize={0.4}
              anchorX="center"
              anchorY="middle"
              rotation={[0, -Math.PI / 6, 0]}
              position={[0, 1.5, 0]} // job title, middle
                  >
              {exp.title}
                  </Text>
                  {/* <Text
              color="red"
              fontSize={0.3}
              maxWidth={10}
              textAlign="center"
              anchorX="center"
              anchorY="middle"
              rotation={[0, -Math.PI / 6, 0]}
              position={[0, 1, 0]} // description
                  >
              {exp.description}
                  </Text> */}
                  {/* <Text
              color="white"
              fontSize={0.3}
              anchorX="center"
              anchorY="middle"
              rotation={[0, -Math.PI / 6, 0]}
              position={[0, 1, 0]} // dates at bottom
                  >
              {`${exp.start} - ${exp.end}`}
                  </Text> */}
                </>
              ) : (
                <Text
                  color="white"
                  fontSize={0.5}
                  textAlign="center"
                  anchorX="center"
                  anchorY="middle"
                  rotation={[0, -Math.PI / 6, 0]}
                >
                  Work Experience {index + 1}
                </Text>
              )}
            </AnimatedBoard>
            <DirectionSign
              position={[px + 3, 1, pz]}
              rotation={[0, -Math.PI / 2, 0]}
              text={`${formatDate(exp.start)} - ${formatDate(exp.end)}`}
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
              index={eduIndex}
              currentSection={currentSection}
              positionX={px}
              positionY={0.2}
              positionZ={pz}
            >
              {currentSection === eduIndex ? (
                <>
                <Text 
                  color="red" 
                  fontSize={0.5}
                  anchorX="center" 
                  anchorY="middle"
                  rotation={[0, -Math.PI / 6, 0]}
                  position={[0, 3, 0]} 
                >
                  {edu.school}
                </Text>
                <Text
                  color="yellow"
                  fontSize={0.4}
                  anchorX="center"
                  anchorY="middle"
                  rotation={[0, -Math.PI / 6, 0]}
                  position={[0, 2, 0]} 
                >
                  {edu.degree}
                </Text>
                {/* <Text
                  color="yellow"
                  fontSize={0.3}
                  anchorX="center"
                  anchorY="middle"
                  rotation={[0, -Math.PI / 6, 0]}
                  position={[0, 1, 0]}
                >
                  {`${edu.start} - ${edu.end}`}
                </Text> */}
                </>
              ) : (
                <Text
                color="white"
                fontSize={0.5}
                textAlign="center"
                anchorX="center"
                anchorY="middle"
                rotation={[0, -Math.PI / 6, 0]}
                >
                Education {index + 1}
                </Text>
              )}
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
