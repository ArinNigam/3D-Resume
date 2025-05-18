"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CustomLoaderProps {
  redirectPath: string;
}

const CustomLoader: React.FC<CustomLoaderProps> = ({ redirectPath }) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsClient(true); // Ensure the component renders only on the client side
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const audioElement = new Audio('/music/intro.mp3');
    setAudio(audioElement);

    const playAudio = () => {
      audioElement.play().catch((err) => {
        console.error('Audio playback failed:', err);
      });
    };

    // Attach event listener to ensure audio plays on user interaction
    document.addEventListener('click', playAudio, { once: true });

    const timeout = setTimeout(() => {
      router.push(redirectPath); // Navigate to the specified path after 10 seconds
    }, 10000); // 10 seconds

    return () => {
      audioElement.pause();
      audioElement.currentTime = 0;
      clearTimeout(timeout);
      document.removeEventListener('click', playAudio);
    };
  }, [isClient, router, redirectPath]);

  if (!isClient) return null; // Prevent rendering on the server

  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <img
        src="/gta-vi.gif"
        alt="Loading"
        className="animate-fade-in h-512 w-auto"
        style={{
          filter: 'drop-shadow(0 0 10px #ff6eec)',
          margin: '0 auto', // Center the image
        }}
      />
      <div
        className="h-4 bg-gray-300 rounded-full mt-4 overflow-hidden"
        style={{
          width: '40%',
        }}
      >
        <div
          className="h-full bg-pink-500 animate-progress"
          style={{
            animation: 'progress 10s linear forwards',
          }}
        ></div>
      </div>
      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomLoader;
