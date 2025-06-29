"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Head from 'next/head';

export default function Home() {
    const containerRef = useRef(null);
    const textMeshRef = useRef(null);
    const calendarTextRef = useRef(null);
    const sceneRef = useRef(null);
    const digitalClockRef = useRef(null);
    const calendarRef = useRef(null);

    const updateText = (timeString) => {
        if (!sceneRef.current || !digitalClockRef.current) return;

        if (textMeshRef.current) {
            sceneRef.current.remove(textMeshRef.current);
        }

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 1024;
        canvas.height = 512;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = 'Bold 100px Arial';
        context.fillStyle = '#000000';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(timeString, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide
        });

        const geometry = new THREE.PlaneGeometry(1.2, 0.6);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(digitalClockRef.current.position);
        mesh.position.x += 0.64;
        mesh.position.z += 0.97;
        mesh.position.y -= 0.2;
        mesh.rotation.copy(digitalClockRef.current.rotation);
        mesh.rotation.y += Math.PI;

        mesh.scale.set(1, 1, 1);

        sceneRef.current.add(mesh);
        textMeshRef.current = mesh;
    };

    const updateCalendarText = () => {
        if (!sceneRef.current || !calendarRef.current) return;

        if (calendarTextRef.current) {
            sceneRef.current.remove(calendarTextRef.current);
        }

        const now = new Date();
        const month = now.toLocaleString('default', { month: 'short' }).toUpperCase();
        const day = now.getDate().toString();

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 512;
        context.clearRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = '#000000';
        context.textAlign = 'center';
        context.textBaseline = 'top';

        context.font = 'bold 90px Arial';
        context.fillText(month, canvas.width / 2, 100);

        context.font = 'bold 150px Arial';
        context.fillText(day, canvas.width / 2, 250);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide
        });

        const geometry = new THREE.PlaneGeometry(0.9, 0.9);
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.copy(calendarRef.current.position);
        mesh.position.x += 0.64;
        mesh.position.y += 0.08;
        mesh.position.z += 0.983;
        mesh.rotation.copy(calendarRef.current.rotation);
        mesh.rotation.y += Math.PI;

        mesh.scale.set(0.4, 0.4, 0.4);

        sceneRef.current.add(mesh);
        calendarTextRef.current = mesh;
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0x000000);

        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        const loader = new GLTFLoader();
        loader.load('/room.glb', (gltf) => {
            gltf.scene.scale.set(3.5, 3.5, 3.5);
            scene.add(gltf.scene);

            gltf.scene.traverse((child) => {
                if (child.name.toLowerCase().includes('digitalclock')) {
                    digitalClockRef.current = child;
                    updateTime();
                }

                if (child.name.toLowerCase().includes('calendar')) {
                    calendarRef.current = child;
                    updateCalendarText();
                }
            });
        });

        const updateTime = () => {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const separator = now.getSeconds() % 2 === 0 ? ':' : ' ';
            const timeString = `${hours}${separator}${minutes}`;
            updateText(timeString);
        };

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const interval = setInterval(updateTime, 1000);

        const midnightUpdate = setInterval(() => {
            const now = new Date();
            if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0) {
                updateCalendarText();
            }
        }, 1000);

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            clearInterval(midnightUpdate);
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
            <div
                ref={containerRef}
                style={{
                    width: '100vw',
                    height: '100vh',
                    background: 'transparent',
                }}
            />
        </>
    );
}
