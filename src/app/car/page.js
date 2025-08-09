'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function CarPage() {
    const mountRef = useRef(null);

    useEffect(() => {
        // === Scene Setup ===
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xbfd1e5);

        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        camera.position.set(5, 5, 10);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

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

        // === Car Group ===
        const carGroup = new THREE.Group();

        // === Car Body ===
        const carBodyGeo = new THREE.BoxGeometry(1, 0.5, 2);
        const carBodyMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const carBody = new THREE.Mesh(carBodyGeo, carBodyMat);
        carBody.position.y = 0.25;
        carGroup.add(carBody);

        // === Wheels ===
        const wheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x000000 });

        const frontLeftPivot = new THREE.Group();
        const frontRightPivot = new THREE.Group();

        const createWheel = (x, y, z) => {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(x, y, z);
            return wheel;
        };

        // Front Left
        const frontLeftWheel = createWheel(0, 0, 0);
        frontLeftPivot.add(frontLeftWheel);
        frontLeftPivot.position.set(-0.5, 0.1, -0.9);
        carGroup.add(frontLeftPivot);

        // Front Right
        const frontRightWheel = createWheel(0, 0, 0);
        frontRightPivot.add(frontRightWheel);
        frontRightPivot.position.set(0.5, 0.1, -0.9);
        carGroup.add(frontRightPivot);

        // Rear Left
        const rearLeftWheel = createWheel(-0.5, 0.1, 0.9);
        carGroup.add(rearLeftWheel);

        // Rear Right
        const rearRightWheel = createWheel(0.5, 0.1, 0.9);
        carGroup.add(rearRightWheel);

        // Add car group to scene
        scene.add(carGroup);

        // === Movement & Steering ===
        const keys = {};
        const speed = 0.1;
        const turnSpeed = 0.02;
        let wheelSteerAngle = 0;
        const maxSteerAngle = Math.PI / 6; // 30 degrees

        const onKeyDown = (e) => (keys[e.key.toLowerCase()] = true);
        const onKeyUp = (e) => (keys[e.key.toLowerCase()] = false);
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        const animate = () => {
            requestAnimationFrame(animate);

            // --- Steering logic ---
            if (keys['a'] || keys['arrowleft']) {
                wheelSteerAngle = Math.min(wheelSteerAngle + 0.02, maxSteerAngle);
            } else if (keys['d'] || keys['arrowright']) {
                wheelSteerAngle = Math.max(wheelSteerAngle - 0.02, -maxSteerAngle);
            } else {
                // Gradually return to center
                if (wheelSteerAngle > 0) wheelSteerAngle -= 0.02;
                if (wheelSteerAngle < 0) wheelSteerAngle += 0.02;
                if (Math.abs(wheelSteerAngle) < 0.01) wheelSteerAngle = 0;
            }

            // Rotate front wheels visually
            frontLeftPivot.rotation.y = wheelSteerAngle;
            frontRightPivot.rotation.y = wheelSteerAngle;

            // --- Move forward/backward ---
            if (keys['w'] || keys['arrowup']) {
                const direction = new THREE.Vector3(0, 0, -1);
                direction.applyQuaternion(carGroup.quaternion);
                carGroup.position.add(direction.multiplyScalar(speed));
            }
            if (keys['s'] || keys['arrowdown']) {
                const direction = new THREE.Vector3(0, 0, 1);
                direction.applyQuaternion(carGroup.quaternion);
                carGroup.position.add(direction.multiplyScalar(speed));
            }

            // --- Rotate car body based on steering ---
            if (Math.abs(wheelSteerAngle) > 0.001) {
                if (keys['w'] || keys['arrowup']) {
                    carGroup.rotation.y += wheelSteerAngle * 0.05; // forward
                }
                if (keys['s'] || keys['arrowdown']) {
                    carGroup.rotation.y -= wheelSteerAngle * 0.05; // reverse
                }
            }

            renderer.render(scene, camera);
        };

        animate();

        // === Resize Handling ===
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
