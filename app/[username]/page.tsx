"use client";
import LoadingFallback from '@/components/LoadingFallback';
import { FullResume } from '@/components/resume/FullResume';
import { useUserActions } from '@/hooks/useUserActions';
import { ResumeData } from '@/lib/server/redisActions';
import { useEffect, useState } from 'react';
import { useIsMobile } from '../../hooks/use-mobile';

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { resumeQuery } = useUserActions();
  const [localResumeData, setLocalResumeData] = useState<ResumeData>();
  const isMobile = useIsMobile();
  const [mobileLeftPressed, setMobileLeftPressed] = useState(false);
  const [mobileRightPressed, setMobileRightPressed] = useState(false);
  const [mobileJumpPressed, setMobileJumpPressed] = useState(false);

  useEffect(() => {
    if (resumeQuery.data?.resume?.resumeData) {
      setLocalResumeData(resumeQuery.data?.resume?.resumeData);
    }
  }, [resumeQuery.data?.resume?.resumeData]);

  if (resumeQuery.isLoading || !localResumeData) {
    return <LoadingFallback message="Loading..." />;
  }

  return (
    <div className="w-full h-screen bg-background flex flex-col select-none">
      <div className="flex-grow flex items-center justify-center">
        <FullResume
          resume={localResumeData}
          mobileLeftPressed={mobileLeftPressed}
          mobileRightPressed={mobileRightPressed}
          mobileJumpPressed={mobileJumpPressed}
        />
      </div>
      {isMobile && (
        <>
          <button
            className="fixed bottom-8 left-8 z-50 p-2 rounded-full bg-white/70 border-2 border-white text-black text-2xl w-15 h-15 flex items-center justify-center touch-none select-none"
            onPointerDown={(e) => {
              e.stopPropagation();
              setMobileLeftPressed(true);
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              setMobileLeftPressed(false);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMobileLeftPressed(true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMobileLeftPressed(false);
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            &lt;
          </button>
          <button
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 p-2 rounded bg-white/70 border-2 border-white text-black text-lg w-24 h-12 flex items-center justify-center touch-none select-none"
            onPointerDown={(e) => {
              e.stopPropagation();
              setMobileJumpPressed(true);
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              setMobileJumpPressed(false);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMobileJumpPressed(true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMobileJumpPressed(false);
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
        
          </button>
          <button
            className="fixed bottom-8 right-8 z-50 p-2 rounded-full bg-white/70 border-2 border-white text-black text-2xl w-15 h-15 flex items-center justify-center touch-none select-none"
            onPointerDown={(e) => {
              e.stopPropagation();
              setMobileRightPressed(true);
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              setMobileRightPressed(false);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMobileRightPressed(true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMobileRightPressed(false);
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            &gt;
          </button>
        </>
      )}
    </div>
  );
}
