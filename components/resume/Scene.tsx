"use client";
import { OrbitControls, Environment, Text, Float, Billboard } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Ground } from './Ground';
import { Player } from './Player';
import { DirectionSign } from './DirectionSign';
import { useControls } from 'leva';
import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, PerspectiveCamera } from 'three';
import { ResumeData } from '../../lib/server/redisActions';
import React from 'react';
import { SignBoard } from './SignBoard';

export const Scene = ({ resume }: { resume: ResumeData }) => {
    if (!resume || !resume.workExperience || !resume.education) {
        console.error('Invalid or missing resume data');
        return <div>No resume data available.</div>;
    }

    const { gravity } = useControls('Physics', {
        gravity: {
            value: -9.81,
            min: -20,
            max: 0,
            step: 0.1,
        },
    });

    const { followSpeed } = useControls('Camera', {
        followSpeed: {
            value: 5,
            min: 0,
            max: 10,
            step: 0.1,
        },
    });

    const { showAxes, axesSize, showGrid } = useControls('Debug', {
        showAxes: false,
        axesSize: {
            value: 100,
            min: 10,
            max: 200,
            step: 10,
        },
        showGrid: false,
    });

    const { camera } = useThree();
    const playerRef = useRef<RigidBody>(null);
    const [currentSection, setCurrentSection] = useState(0);
    const { zoom } = useControls('Camera', {
        zoom: {
            value: 50,
            min: 20,
            max: 90,
            step: 1,
        },
    });
    const [playerMoving, setPlayerMoving] = useState(false);
    const targetFov = useRef(50);

    useEffect(() => {
        camera.up.set(0, 1, 0);
        targetFov.current = playerMoving ? 90 : 50;
    }, [camera, playerMoving]);

    useFrame(() => {
        if (!playerRef.current) return;
        const playerPosition = playerRef.current.translation();
        camera.position.set(
            playerPosition.x - 8,
            playerPosition.y + 6,
            playerPosition.z + 8
        );
        camera.up.set(0, 1, 0);
        camera.lookAt(playerPosition.x, playerPosition.y, playerPosition.z);

        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
        const perspCam = camera as PerspectiveCamera;
        perspCam.fov = lerp(perspCam.fov, targetFov.current, 0.08);
        perspCam.updateProjectionMatrix();

        const sectionLength = 15;
        const newSection = Math.floor(playerPosition.x / sectionLength);
        if (newSection !== currentSection) {
            setCurrentSection(newSection);
        }
    });

    return (
        <>
            <Environment preset="sunset" />
            <ambientLight intensity={0.5} />
            <directionalLight
                castShadow
                position={[10, 10, 5]}
                intensity={1.5}
                shadow-mapSize={[1024, 1024]}
            />

            {/* boards for work experience */}
            {resume.workExperience.map((exp, idx) => (
                <SignBoard
                    key={`board-work-${idx}`}
                    position={[idx * 15, 4, 0]}
                    lines={[
                        exp.company,
                        exp.title,
                        `${exp.start} - ${exp.end}`,
                    ]}
                />
            ))}

            {/* boards for education */}
            {resume.education.map((edu, idx) => {
                const x = (resume.workExperience.length + idx) * 15;
                return (
                    <SignBoard
                        key={`board-edu-${idx}`}
                        position={[x, 4, 0]}
                        lines={[edu.school, edu.degree, `${edu.start} - ${edu.end}`]}
                    />
                );
            })}

            <Physics gravity={[0, gravity, 0]}>
                <Ground />
                <Player ref={playerRef} onMoveChange={setPlayerMoving} />
            </Physics>
        </>
    );
};