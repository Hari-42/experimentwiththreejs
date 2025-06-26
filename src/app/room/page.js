"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Head from 'next/head';

export default function Home() {
    const containerRef = useRef(null);
    const textMeshRef = useRef(null);
    const sceneRef = useRef(null);
    const digitalClockRef = useRef(null);

    const updateText = (timeString) => {
        if (!sceneRef.current || !digitalClockRef.current) return;

        // Remove previous text if exists
        if (textMeshRef.current) {
            sceneRef.current.remove(textMeshRef.current);
        }

        // Create canvas for texture
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 1024;
        canvas.height = 512;

        // Clear with transparent background
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw black text
        context.font = 'Bold 100px Arial'; // Slightly smaller font
        context.fillStyle = '#000000';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(timeString, canvas.width / 2, canvas.height / 2);

        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide
        });

        // Create plane (smaller size)
        const geometry = new THREE.PlaneGeometry(1.2, 0.6);

        // Position at digital clock
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(digitalClockRef.current.position);
        mesh.position.z -= 0.01;
        mesh.position.y -= 0.001;
        mesh.rotation.copy(digitalClockRef.current.rotation);

        // Flip 180 degrees
        mesh.rotation.y += Math.PI;

        // Additional scaling
        mesh.scale.set(0.28, 0.28, 0.28);

        sceneRef.current.add(mesh);
        textMeshRef.current = mesh;
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Scene setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0x000000);

        // Camera
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 5;

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Load GLB model
        const loader = new GLTFLoader();
        loader.load('/room.glb', (gltf) => {
            scene.add(gltf.scene);

            // Find digital clock
            gltf.scene.traverse((child) => {
                if (child.name.toLowerCase().includes('digitalclock')) {
                    digitalClockRef.current = child;
                    console.log('Digital clock found at:', child.position);
                    updateTime();
                }
            });
        });

        // Time update function with blinking colon
        const updateTime = () => {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const separator = now.getSeconds() % 2 === 0 ? ':' : ' ';
            const timeString = `${hours}${separator}${minutes}`;
            updateText(timeString);
        };

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Update time every second
        const interval = setInterval(updateTime, 1000);

        // Handle resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
            container.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    return (
        <>
            <Head>
                <title>3D Digital Clock</title>
                <meta name="description" content="3D clock with transparent background" />
            </Head>
            <div ref={containerRef} style={{
                width: '100vw',
                height: '100vh',
                background: 'transparent'
            }} />
        </>
    );
}
