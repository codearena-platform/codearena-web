"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export interface ObstacleData {
    id: string;
    x: number;
    z: number;
}

export interface ArenaConfig {
    width: number;
    height: number;
    obstacles: ObstacleData[];
}

interface ArenaCanvasProps {
    width?: number;
    height?: number;
    obstacles: ObstacleData[];
    onObstaclesChange: (obstacles: ObstacleData[]) => void;
}

export default function ArenaCanvas({ width = 800, height = 600, obstacles, onObstaclesChange }: ArenaCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const obsMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
    const obstaclesRef = useRef(obstacles);
    obstaclesRef.current = obstacles;

    useEffect(() => {
        if (!containerRef.current) return;

        // --- Scene Setup ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0a);

        // --- Camera ---
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
        camera.position.set(0, 500, 600);
        camera.lookAt(0, 0, 0);

        // --- Renderer ---
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        containerRef.current.appendChild(renderer.domElement);

        // --- Controls ---
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // --- Lighting ---
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x00f3ff, 1);
        pointLight.position.set(200, 400, 200);
        scene.add(pointLight);

        // --- Grid / Floor ---
        const gridHelper = new THREE.GridHelper(Math.max(width, height), 20, 0x00f3ff, 0x333333);
        scene.add(gridHelper);

        // Arena Boundary Box (visual only for now)
        const boxGeometry = new THREE.BoxGeometry(width, 2, height);
        const boxMaterial = new THREE.MeshBasicMaterial({
            color: 0x00f3ff,
            wireframe: true,
            transparent: true,
            opacity: 0.2
        });
        const arenaFloor = new THREE.Mesh(boxGeometry, boxMaterial);
        arenaFloor.position.y = -1;
        scene.add(arenaFloor);

        sceneRef.current = scene;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const obstacleGroup = new THREE.Group();
        obstacleGroup.name = 'obstacles';
        scene.add(obstacleGroup);

        const updateRaycast = (event: MouseEvent) => {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;
        };

        const onMouseClick = (event: MouseEvent) => {
            updateRaycast(event);
            raycaster.setFromCamera(mouse, camera);
            const obsArray = Array.from(obsMeshesRef.current.values());
            const obsIntersects = raycaster.intersectObjects(obsArray);
            if (obsIntersects.length > 0) return;

            const floorIntersects = raycaster.intersectObject(arenaFloor);
            if (floorIntersects.length > 0) {
                const pt = floorIntersects[0].point;
                const newObs: ObstacleData = {
                    id: `obs_${Date.now()}`,
                    x: pt.x,
                    z: pt.z
                };
                onObstaclesChange([...obstaclesRef.current, newObs]);
            }
        };

        const onContextMenu = (event: MouseEvent) => {
            event.preventDefault();
            updateRaycast(event);
            raycaster.setFromCamera(mouse, camera);
            const obsArray = Array.from(obsMeshesRef.current.values());
            const intersects = raycaster.intersectObjects(obsArray);
            if (intersects.length > 0) {
                const mesh = intersects[0].object as THREE.Mesh;
                const id = mesh.userData.obsId as string;
                if (id) onObstaclesChange(obstaclesRef.current.filter((o) => o.id !== id));
            }
        };

        renderer.domElement.addEventListener('click', onMouseClick);
        renderer.domElement.addEventListener('contextmenu', onContextMenu);

        // --- Animation Loop ---
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            renderer.domElement.removeEventListener('click', onMouseClick);
            renderer.domElement.removeEventListener('contextmenu', onContextMenu);
            if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [width, height]);

    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;

        const obstacleGroup = scene.getObjectByName('obstacles') as THREE.Group;
        if (!obstacleGroup) return;

        const currentIds = new Set(obstacles.map((o) => o.id));
        obsMeshesRef.current.forEach((mesh, id) => {
            if (!currentIds.has(id)) {
                obstacleGroup.remove(mesh);
                obsMeshesRef.current.delete(id);
            }
        });

        obstacles.forEach((obs) => {
            if (!obsMeshesRef.current.has(obs.id)) {
                const obsGeo = new THREE.CylinderGeometry(20, 20, 40, 32);
                const obsMat = new THREE.MeshPhongMaterial({ color: 0xff00ff, emissive: 0x330033 });
                const mesh = new THREE.Mesh(obsGeo, obsMat);
                mesh.position.set(obs.x, 20, obs.z);
                mesh.userData.obsId = obs.id;
                obstacleGroup.add(mesh);
                obsMeshesRef.current.set(obs.id, mesh);
            }
        });
    }, [obstacles]);

    return (
        <div className="relative border border-cyan-500 shadow-[0_0_15px_rgba(0,243,255,0.3)]">
            <div ref={containerRef} style={{ width: `${width}px`, height: `${height}px` }} />
            <div className="absolute top-2 left-2 bg-black/50 text-cyan-400 p-2 text-xs font-mono uppercase tracking-widest border border-cyan-500/30">
                System: Arena Designer v1.0<br />
                Resolution: {width}x{height}
            </div>
        </div>
    );
}
