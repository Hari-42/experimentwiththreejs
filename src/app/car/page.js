'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function CarPage() {
    const mountRef = useRef(null);

    useEffect(() => {
        // === Scene ===
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xbfd1e5);

        // === Camera ===
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        camera.position.set(5, 5, 10);
        camera.lookAt(0, 0, 0);

        // === Renderer ===
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        // === Lighting ===
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(ambientLight, directionalLight);

        // === Ground ===
        const groundGeo = new THREE.PlaneGeometry(100, 100);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x808080 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        scene.add(ground);

        // === Car ===
        const carGeo = new THREE.BoxGeometry(1, 0.5, 2);
        const carMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const car = new THREE.Mesh(carGeo, carMat);
        car.position.y = 0.25;
        scene.add(car);

        // === Movement ===
        const keys = {};

        const onKeyDown = (e) => (keys[e.key.toLowerCase()] = true);
        const onKeyUp = (e) => (keys[e.key.toLowerCase()] = false);
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        const speed = 0.1;
        const turnSpeed = 0.03;

        const animate = () => {
            requestAnimationFrame(animate);

            // Forward/back
            if (keys['w'] || keys['arrowup']) {
                car.translateZ(-speed);
            }
            if (keys['s'] || keys['arrowdown']) {
                car.translateZ(speed);
            }

            // Rotation
            if (keys['a'] || keys['arrowleft']) {
                car.rotation.y += turnSpeed;
            }
            if (keys['d'] || keys['arrowright']) {
                car.rotation.y -= turnSpeed;
            }

            renderer.render(scene, camera);
        };

        animate();

        // === Resize Handler ===
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // === Cleanup ===
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            renderer.dispose();
            if (renderer.domElement && renderer.domElement.parentNode) {
                renderer.domElement.parentNode.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={mountRef} />;
}
