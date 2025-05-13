"use client";
import LoadingFallback from '../LoadingFallback';
import { ResumeData } from '../../lib/server/redisActions';
import { Scene } from './Scene';
import { Canvas } from '@react-three/fiber';
import { Leva } from 'leva';

export const FullResume = ({
  resume,
  mobileLeftPressed, // Added prop
  mobileRightPressed, // Added prop
  mobileJumpPressed, // Added prop
}: {
  resume?: ResumeData | null;
  mobileLeftPressed: boolean; // Added prop type
  mobileRightPressed: boolean; // Added prop type
  mobileJumpPressed: boolean; // Added prop type
}) => {
  if (!resume) {
    return <LoadingFallback message="Loading Resume..." />;
  }

  return (
    <div className="w-full h-screen">
      <Leva hidden/>
      <Canvas
        className="w-full h-full"
        shadows
        frameloop="demand"
        gl={{
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
        }}
        camera={{
          fov: 45,
          near: 0.1,
          far: 200,
          position: [4, 2, 6],
        }}
      >
        <Scene
          resume={resume}
          mobileLeftPressed={mobileLeftPressed} // Pass prop
          mobileRightPressed={mobileRightPressed} // Pass prop
          mobileJumpPressed={mobileJumpPressed} // Pass prop
        />
      </Canvas>
    </div>
  );
};