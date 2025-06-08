"use client";
import LoadingFallback from '../LoadingFallback';
import { ResumeData } from '../../lib/server/redisActions';
import { Scene } from './Scene';
import { Canvas } from '@react-three/fiber';
import { Leva } from 'leva';

export const FullResume = ({
  resume,
  mobileLeftPressed, 
  mobileRightPressed,
  mobileJumpPressed, 
}: {
  resume?: ResumeData | null;
  mobileLeftPressed: boolean; 
  mobileRightPressed: boolean; 
  mobileJumpPressed: boolean; 
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
          mobileLeftPressed={mobileLeftPressed} 
          mobileRightPressed={mobileRightPressed} 
          mobileJumpPressed={mobileJumpPressed} 
        />
      </Canvas>
    </div>
  );
};