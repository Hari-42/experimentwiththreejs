"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Head from 'next/head';

export default function Home() {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        const camera = new THREE.PerspectiveCamera(
            35, // Tighter FOV = less distortion
            window.innerWidth / window.innerHeight,
            0.001, // Allow zooming extremely close
            1000
        );
        camera.position.set(0, 2, 5);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        // No zoom limits for infinite zoom
        controls.target.set(0, 0, 0);
        controls.update();

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);

        const loader = new GLTFLoader();
        loader.load(
            '/room.glb',
            (gltf) => {
                const model = gltf.scene;
                scene.add(model);

                model.scale.set(3,3,3)

                const box = new THREE.Box3().setFromObject(model);
                const center = new THREE.Vector3();
                box.getCenter(center);

                model.position.sub(center); // Center model at origin
                controls.target.copy(new THREE.Vector3(0, 0, 0));
                controls.update();
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100).toFixed(2) + '% loaded');
            },
            (error) => {
                console.error('Error loading GLB:', error);
            }
        );

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

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
                <title>GLB Viewer Fullscreen</title>
                <meta name="description" content="Fullscreen GLB viewer with OrbitControls" />
                <link rel="icon" href="/favicon.ico" />
                <style>{`
                    html, body {
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        height: 100%;
                        overflow: hidden;
                        background: black;
                    }
                `}</style>
            </Head>
            <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />
        </>
    );
}
