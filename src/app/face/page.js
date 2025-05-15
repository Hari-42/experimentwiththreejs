'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import Head from 'next/head';

export default function FacePage() {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 2, 5);
        camera.lookAt(0, 0, 0);

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);

        // FBX Loader without material override
        const loader = new FBXLoader();
        loader.load(
            '/cube.fbx',
            (object) => {
                object.scale.set(0.5, 0.5, 0.5);
                object.position.set(0, -8, -20);
                scene.add(object);

                renderer.render(scene, camera); // One-time render
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100).toFixed(2) + '% loaded');
            },
            (error) => {
                console.error('Error loading FBX:', error);
            }
        );

        // Handle window resize
        const handleResize = () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.render(scene, camera);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (container && renderer.domElement) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return (
        <>
            <Head>
                <title>CUBE TEST</title>
                <meta name="description" content="FBX cube with original material" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <h1>THREE JS CUBE</h1>
                <div ref={containerRef} style={{ width: '100%', height: '500px' }} />
            </main>
        </>
    );
}
