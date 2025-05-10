import { Text } from '@react-three/drei'
import { useSpring, a } from '@react-spring/three'

interface NoticeProps {
  index: number
  currentSection: number
  data: any // Replace 'any' with a more specific type if possible
}

export const Notice = ({ index, currentSection, data }: NoticeProps) => {
  const { opacity, positionZ } = useSpring({
    opacity: currentSection === index ? 1 : 0,
    positionZ: currentSection === index ? -5 : 0,
    config: { mass: 1, tension: 200, friction: 20 },
  })

  return (
    <a.group position-z={positionZ} opacity={opacity}>
      <Text
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        position={[0, 2, 0]}
      >
        {data.company || data.school}
      </Text>
      <Text
        fontSize={0.3}
        color="lightgrey"
        anchorX="center"
        anchorY="middle"
        position={[0, 1, 0]}
      >
        {data.title || data.degree}
      </Text>
      <Text
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        position={[0, 0, 0]}
      >
        {data.description || `${data.start} - ${data.end}`}
      </Text>
    </a.group>
  )
}
