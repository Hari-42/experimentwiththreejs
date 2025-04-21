"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import Head from 'next/head';

export default function Home() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const textureLoader = new THREE.TextureLoader();
    const greenTexture = textureLoader.load('/green.png'); // Ensure this exists in /public

    const loader = new FBXLoader();
    let model = null;

    loader.load(
        '/cube.fbx',
        (object) => {
          object.traverse((child) => {
            if (child.isMesh) {
              child.material = new THREE.MeshStandardMaterial({
                map: greenTexture,
                roughness: 0.8,
                metalness: 0.3
              });
            }
          });

          object.scale.set(0.5, 0.5, 0.5);
          object.position.set(0, -8, -20);
          scene.add(object);
          model = object;
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total * 100).toFixed(2) + '% loaded');
        },
        (error) => {
          console.error('Error loading FBX:', error);
        }
    );

    const animate = () => {
      requestAnimationFrame(animate);
      if (model) {
        model.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
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
          <title>CUBE TEST</title>
          <meta name="description" content="FBX cube with green texture" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main>
          <h1>THREE JS CUBE</h1>
          <div ref={containerRef} style={{ width: '100%', height: '500px' }} />
        </main>
      </>
  );
}
