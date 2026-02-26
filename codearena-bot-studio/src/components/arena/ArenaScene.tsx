"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import type { WorldState, RobotState, BulletState } from '@/types';
import { Robot3D } from '../Robot3D';
import * as THREE from 'three';

const ARENA_WIDTH = 800;
const ARENA_HEIGHT = 600;

interface ArenaSceneProps {
    state: WorldState | null;
}

function Floor() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ARENA_WIDTH / 2, -1, ARENA_HEIGHT / 2]} receiveShadow>
            <planeGeometry args={[ARENA_WIDTH, ARENA_HEIGHT]} />
            <meshStandardMaterial color="#050505" roughness={0.4} metalness={0.8} />
        </mesh>
    );
}

function ZoneRing({ zone }: { zone: { x: number; y: number; radius: number } }) {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[zone.x, 2, zone.y]}>
            <ringGeometry args={[zone.radius, zone.radius + 5, 64]} />
            <meshBasicMaterial color="#ff0000" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
    );
}

function Bots({ bots }: { bots: RobotState[] }) {
    return (
        <>
            {bots?.map((bot) => (
                <Robot3D
                    key={bot.id}
                    state={bot}
                    primaryColor={(bot.teamId ?? 'blue') === 'red' ? '#ff0000' : '#00f3ff'}
                    secondaryColor="#ffffff"
                />
            ))}
        </>
    );
}

function Bullets({ bullets }: { bullets: BulletState[] }) {
    return (
        <>
            {bullets?.map((bullet) => (
                <mesh key={bullet.id} position={[bullet.position.x, 5, bullet.position.y]}>
                    <sphereGeometry args={[2, 8, 8]} />
                    <meshBasicMaterial color="#ffaa00" />
                </mesh>
            ))}
        </>
    );
}

export function ArenaScene({ state }: ArenaSceneProps) {
    const bots = state?.bots ?? [];
    const bullets = state?.bullets ?? [];

    return (
        <Canvas shadows dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[ARENA_WIDTH / 2, 600, ARENA_HEIGHT + 200]} fov={50} />
            <OrbitControls target={[ARENA_WIDTH / 2, 0, ARENA_HEIGHT / 2]} maxPolarAngle={Math.PI / 2.5} />

            <ambientLight intensity={0.5} />
            <spotLight position={[ARENA_WIDTH / 2, 500, ARENA_HEIGHT / 2]} angle={0.5} penumbra={1} intensity={2} castShadow />
            <pointLight position={[0, 100, 0]} intensity={1} color="#00f3ff" />
            <pointLight position={[ARENA_WIDTH, 100, ARENA_HEIGHT]} intensity={1} color="#9d00ff" />

            <Floor />
            {state?.zone && <ZoneRing zone={state.zone} />}
            <Bots bots={bots} />
            <Bullets bullets={bullets} />
        </Canvas>
    );
}
