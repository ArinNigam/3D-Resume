"use client";
import { OrbitControls, Environment, Text, Float, Billboard, Grid, Sphere } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Ground } from './Ground';
import { Player } from './Player';
import { useControls } from 'leva';
import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, PerspectiveCamera } from 'three';
import { ResumeData } from '../../lib/server/redisActions';

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

            {resume.workExperience.map((exp, index) => (
                <group key={`exp-${index}`} position={[index * 15, 2, 0]}>
                    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
                            <Text
                                color="gold"
                                fontSize={0.5}
                                position={[0, 2, 0]}
                                anchorX="center"
                            >
                                {exp.company}
                            </Text>
                            <Text
                                color="white"
                                fontSize={0.3}
                                position={[0, 1.2, 0]}
                                anchorX="center"
                            >
                                {exp.title}
                            </Text>
                            <Text
                                color="white"
                                fontSize={0.2}
                                position={[0, 0.6, 0]}
                                anchorX="center"
                                maxWidth={4}
                                textAlign="center"
                            >
                                {exp.description}
                            </Text>
                            <Text
                                color="#888888"
                                fontSize={0.15}
                                position={[0, 0, 0]}
                                anchorX="center"
                            >
                                {`${exp.start} - ${exp.end}`}
                            </Text>
                        </Billboard>
                    </Float>
                </group>
            ))}

            {resume.education.map((edu, index) => {
                const position = new Vector3(
                    (resume.workExperience.length + index) * 15,
                    2,
                    0
                );
                return (
                    <group key={`edu-${index}`} position={position}>
                        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                            <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
                                <Text
                                    color="lightblue"
                                    fontSize={0.5}
                                    position={[0, 2, 0]}
                                    anchorX="center"
                                >
                                    {edu.school}
                                </Text>
                                <Text
                                    color="white"
                                    fontSize={0.3}
                                    position={[0, 1.2, 0]}
                                    anchorX="center"
                                >
                                    {edu.degree}
                                </Text>
                                <Text
                                    color="#888888"
                                    fontSize={0.2}
                                    position={[0, 0.6, 0]}
                                    anchorX="center"
                                >
                                    {`${edu.start} - ${edu.end}`}
                                </Text>
                            </Billboard>
                        </Float>
                    </group>
                );
            })}

            <Physics gravity={[0, gravity, 0]}>
                <Ground />
                <Player ref={playerRef} onMoveChange={setPlayerMoving} />
            </Physics>
        </>
    );
};