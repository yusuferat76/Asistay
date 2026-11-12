import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

export const DigitalAgentAvatar: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [micAccess, setMicAccess] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    // Three.js Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(100, 100);
    mountRef.current.appendChild(renderer.domElement);

    // Face Elements
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x0077ff, wireframe: true });
    const head = new THREE.Mesh(geometry, material);
    scene.add(head);

    const eyeGeom = new THREE.SphereGeometry(0.2, 16, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyeL = new THREE.Mesh(eyeGeom, eyeMat);
    eyeL.position.set(-0.4, 0.3, 0.9);
    head.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeom, eyeMat);
    eyeR.position.set(0.4, 0.3, 0.9);
    head.add(eyeR);

    const mouthGeom = new THREE.BoxGeometry(0.5, 0.1, 0.1);
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mouth = new THREE.Mesh(mouthGeom, mouthMat);
    mouth.position.set(0, -0.4, 0.9);
    head.add(mouth);

    camera.position.z = 2;

    // Audio Analysis Setup
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array | null = null;

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        setMicAccess(true);
      } catch (err) {
        console.warn("Audio analysis blocked:", err);
        setMicAccess(false);
      }
    };
    initAudio();

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (micAccess && analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        const lowFreq = dataArray.slice(0, 10).reduce((a, b) => a + b) / 10;
        const midFreq = dataArray.slice(10, 50).reduce((a, b) => a + b) / 40;
        
        // Deform mouth based on voice
        mouth.scale.set(1, 1 + lowFreq / 100, 1);
        head.scale.set(1 + midFreq / 500, 1 + midFreq / 500, 1 + midFreq / 500);
      } else {
        // Idle animation when mic is not active
        head.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [micAccess]);

  return <div ref={mountRef} className="w-24 h-24 rounded-full overflow-hidden" />;
};
