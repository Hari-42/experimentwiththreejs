'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Head from 'next/head';

export default function FacePage() {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        // Camera
        const camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 4, 5);
        camera.lookAt(0, 0, 0);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(5, 10, 7.5);
        scene.add(dirLight);

        // Mouse tracking
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const target = new THREE.Vector3();
        const currentLook = new THREE.Vector3();

        // Eye references
        let eyeLeft = null;
        let eyeRight = null;
        const lerpFactor = 0.06; // Slower tracking (0.1 = 10% per frame)

        // Load model
        const loader = new GLTFLoader();
        loader.load(
            '/face1.glb',
            (gltf) => {
                const model = gltf.scene;
                model.scale.set(80, 80, 80);
                model.position.set(0,-15,0);
                model.rotation.set(-0.3,0,0);
                scene.add(model);

                model.traverse((child) => {
                    if (!child.isMesh) return;

                    if (child.name === 'Sphere') {
                        eyeLeft = child;
                        eyeLeft.scale.z = -0.008; // Flip on Z-axis
                    }
                    if (child.name === 'Sphere1') {
                        eyeRight = child;
                        eyeRight.scale.z = -0.008; // Flip on Z-axis
                    }
                });
            },
            undefined,
            (error) => console.error('Error loading GLB:', error)
        );

        // Mouse movement
        const onMouseMove = (event) => {
            const rect = container.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        };
        container.addEventListener('mousemove', onMouseMove);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            // Update target position
            raycaster.setFromCamera(mouse, camera);
            const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
            raycaster.ray.intersectPlane(plane, target);

            // Smooth eye tracking
            if (eyeLeft) {
                currentLook.lerp(target, lerpFactor);
                eyeLeft.lookAt(currentLook);
                eyeLeft.rotation.z = 0; // Prevent tilting
            }

            if (eyeRight) {
                currentLook.lerp(target, lerpFactor);
                eyeRight.lookAt(currentLook);
                eyeRight.rotation.z = 0;
            }

            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
            container.removeEventListener('mousemove', onMouseMove);
            if (renderer.domElement) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return (
        <>
            <Head>
                <title>Eye Tracker</title>
            </Head>
            <main>
                <div
                    ref={containerRef}
                    style={{
                        width: '100%',
                        height: '500px'
                    }}
                />
            </main>
        </>
    );
}