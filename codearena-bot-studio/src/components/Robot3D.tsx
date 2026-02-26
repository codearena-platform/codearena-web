"use client";

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { RobotState } from '@/types';
import * as THREE from 'three';

interface Robot3DProps {
    state: RobotState;
    primaryColor: string;
    secondaryColor: string;
}

export function Robot3D({ state, primaryColor, secondaryColor }: Robot3DProps) {
    const groupRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Group>(null);
    const gunRef = useRef<THREE.Group>(null);
    const radarRef = useRef<THREE.Group>(null);

    // Visual Flash on Hit
    const prevHull = useRef(state.hull);
    const flashIntensity = useRef(0);

    useFrame((_, delta) => {
        // Detect damage
        if (state.hull < prevHull.current) {
            flashIntensity.current = 1.0; // Max flash
        }
        prevHull.current = state.hull;

        if (flashIntensity.current > 0) {
            flashIntensity.current = Math.max(0, flashIntensity.current - delta * 3); // Fade out
        }

        if (groupRef.current) {
            // Updated to match proto Vector3 (X, Y) mapping to 3D scene (X, Z) or (X, Y) depending on camera
            // Legacy code used X, Y for position but Rendered as X, Z (Y up).
            // Let's assume standard top-down: X=X, Z=Y, Y=Altitude
            if (state.position) {
                groupRef.current.position.set(state.position.x, 0, state.position.y);
            }
        }

        // Apply flash color
        if (bodyRef.current) {
            bodyRef.current.rotation.y = -state.heading;
            bodyRef.current.children.forEach((child: any) => {
                if (child.material && child.material.emissive) {
                    child.material.emissive.setHex(0xff0000);
                    child.material.emissiveIntensity = flashIntensity.current;
                }
            });
        }

        if (gunRef.current) {
            gunRef.current.rotation.y = -state.gunHeading;
        }

        if (radarRef.current) {
            radarRef.current.rotation.y = -state.radarHeading;
        }
    });

    const cls = state.class ?? 'TANK';
    const getChassisDims = () => {
        switch (cls) {
            case 'TANK': return [40, 5, 40] as [number, number, number];
            case 'SCOUT': return [28, 3, 28] as [number, number, number];
            case 'SNIPER': default: return [34, 4, 34] as [number, number, number];
        }
    };

    const getTrackDims = () => {
        switch (cls) {
            case 'TANK': return [46, 5, 5] as [number, number, number];
            case 'SCOUT': return [32, 3, 3] as [number, number, number];
            case 'SNIPER': default: return [38, 4, 4] as [number, number, number];
        }
    };

    const chassisDims = getChassisDims();
    const trackDims = getTrackDims();

    return (
        <group ref={groupRef}>
            <group ref={bodyRef}>
                {/* Chassis */}
                <mesh position={[0, 2, 0]} castShadow receiveShadow>
                    <boxGeometry args={chassisDims} />
                    <meshStandardMaterial color={primaryColor} />
                </mesh>

                {/* Tracks */}
                <mesh position={[chassisDims[0] / 2 + 2, 2, 0]} castShadow>
                    <boxGeometry args={[4, trackDims[1], trackDims[0]]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
                <mesh position={[-chassisDims[0] / 2 - 2, 2, 0]} castShadow>
                    <boxGeometry args={[4, trackDims[1], trackDims[0]]} />
                    <meshStandardMaterial color="#333" />
                </mesh>

                {/* Turret */}
                <group ref={gunRef} position={[0, 4, 0]}>
                    <mesh position={[0, 2, 0]} castShadow>
                        <cylinderGeometry args={[10, 12, 4]} />
                        <meshStandardMaterial color={secondaryColor} />
                    </mesh>
                    <mesh position={[0, 2, 15]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                        <cylinderGeometry args={[2, 2, 30]} />
                        <meshStandardMaterial color="#666" />
                    </mesh>

                    {/* Radar */}
                    <group ref={radarRef} position={[0, 4, 0]}>
                        <mesh position={[0, 2, 0]}>
                            <cylinderGeometry args={[2, 2, 4]} />
                            <meshStandardMaterial color="#999" />
                        </mesh>
                        <mesh position={[0, 5, 0]}>
                            <boxGeometry args={[2, 4, 15]} />
                            <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={0.5} />
                        </mesh>
                    </group>
                </group>
            </group>

            {/* Shield */}
            {state.shieldHp > 0 && (
                <mesh position={[0, 5, 0]}>
                    <sphereGeometry args={[40, 16, 16]} />
                    <meshStandardMaterial
                        color={primaryColor}
                        transparent
                        opacity={0.2 + (state.shieldHp / 50) * 0.3} // Approx max shield
                        side={THREE.DoubleSide}
                        depthWrite={false}
                    />
                </mesh>
            )}
        </group>
    );
}
