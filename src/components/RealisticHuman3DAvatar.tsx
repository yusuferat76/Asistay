import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface RealisticHuman3DAvatarProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  isVisionActive?: boolean;
  status?: 'secure' | 'alert' | 'breach';
  onClick?: () => void;
}

export const RealisticHuman3DAvatar: React.FC<RealisticHuman3DAvatarProps> = ({
  isListening = false,
  isSpeaking = false,
  isVisionActive = false,
  status = 'secure',
  onClick,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [emotion, setEmotion] = useState<'neutral' | 'curious' | 'alert' | 'speaking'>('neutral');

  useEffect(() => {
    if (isSpeaking) {
      setEmotion('speaking');
    } else if (isListening) {
      setEmotion('curious');
    } else if (status === 'breach' || status === 'alert') {
      setEmotion('alert');
    } else {
      setEmotion('neutral');
    }
  }, [isSpeaking, isListening, status]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = 160;
    const height = 160;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.4);

    // Renderer with antialias and alpha
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x0a192f, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    keyLight.position.set(2, 3, 2);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x1d4ed8, 1.8);
    fillLight.position.set(-2, -1, 1.5);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(
      status === 'breach' ? 0xef4444 : status === 'alert' ? 0xf59e0b : 0x06b6d4,
      3,
      8
    );
    rimLight.position.set(0, 1.5, -1.2);
    scene.add(rimLight);

    // Root Group for head rotations
    const headGroup = new THREE.Group();
    scene.add(headGroup);

    // 1. Stylized Realistic Human Cranium & Face Base
    const headGeom = new THREE.SphereGeometry(0.85, 48, 48);
    // Deform geometry into human skull/jaw shape
    const pos = headGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Elongate and taper jaw downwards
      if (y < 0) {
        const factor = Math.abs(y);
        x *= 1 - factor * 0.28;
        z *= 1 - factor * 0.15;
      }
      // Forehead rounding
      if (y > 0.3) {
        z *= 0.95;
      }
      // Cheekbone definition
      if (y > -0.1 && y < 0.3 && Math.abs(x) > 0.4) {
        x *= 1.06;
      }
      pos.setXYZ(i, x, y, z);
    }
    headGeom.computeVertexNormals();

    const headMat = new THREE.MeshStandardMaterial({
      color: 0x07111e,
      roughness: 0.32,
      metalness: 0.65,
      wireframe: false,
    });
    const headMesh = new THREE.Mesh(headGeom, headMat);
    headGroup.add(headMesh);

    // Holographic Wireframe Outer Shell
    const wireGeom = new THREE.SphereGeometry(0.87, 24, 24);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const wireMesh = new THREE.Mesh(wireGeom, wireMat);
    headGroup.add(wireMesh);

    // 2. Anatomical Human Eyebrows (Left & Right)
    const browCurveL = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.48, 0.24, 0.76),
      new THREE.Vector3(-0.32, 0.32, 0.81),
      new THREE.Vector3(-0.14, 0.26, 0.82),
    ]);
    const browGeomL = new THREE.TubeGeometry(browCurveL, 20, 0.022, 8, false);

    const browCurveR = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.14, 0.26, 0.82),
      new THREE.Vector3(0.32, 0.32, 0.81),
      new THREE.Vector3(0.48, 0.24, 0.76),
    ]);
    const browGeomR = new THREE.TubeGeometry(browCurveR, 20, 0.022, 8, false);

    const browMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      roughness: 0.3,
    });
    const browMeshL = new THREE.Mesh(browGeomL, browMat);
    const browMeshR = new THREE.Mesh(browGeomR, browMat);
    headGroup.add(browMeshL);
    headGroup.add(browMeshR);

    // 3. Realistic 3D Human Eyes (Sclera + Iris + Pupil + Eyelids)
    const eyeSocketGroupL = new THREE.Group();
    const eyeSocketGroupR = new THREE.Group();
    eyeSocketGroupL.position.set(-0.28, 0.16, 0.74);
    eyeSocketGroupR.position.set(0.28, 0.16, 0.74);
    headGroup.add(eyeSocketGroupL);
    headGroup.add(eyeSocketGroupR);

    // Sclera (White of Eye)
    const eyeWhiteGeom = new THREE.SphereGeometry(0.11, 24, 24);
    const eyeWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.1,
      metalness: 0.1,
    });
    const eyeWhiteL = new THREE.Mesh(eyeWhiteGeom, eyeWhiteMat);
    const eyeWhiteR = new THREE.Mesh(eyeWhiteGeom, eyeWhiteMat);
    eyeSocketGroupL.add(eyeWhiteL);
    eyeSocketGroupR.add(eyeWhiteR);

    // Iris (Glowing Cyber Core)
    const irisGeom = new THREE.CircleGeometry(0.055, 32);
    const irisMat = new THREE.MeshBasicMaterial({
      color: status === 'breach' ? 0xef4444 : status === 'alert' ? 0xf59e0b : 0x00f0ff,
    });
    const irisL = new THREE.Mesh(irisGeom, irisMat);
    const irisR = new THREE.Mesh(irisGeom, irisMat);
    irisL.position.set(0, 0, 0.106);
    irisR.position.set(0, 0, 0.106);
    eyeSocketGroupL.add(irisL);
    eyeSocketGroupR.add(irisR);

    // Pupil (Dark center with reflection)
    const pupilGeom = new THREE.CircleGeometry(0.026, 24);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x020617 });
    const pupilL = new THREE.Mesh(pupilGeom, pupilMat);
    const pupilR = new THREE.Mesh(pupilGeom, pupilMat);
    pupilL.position.set(0, 0, 0.108);
    pupilR.position.set(0, 0, 0.108);
    eyeSocketGroupL.add(pupilL);
    eyeSocketGroupR.add(pupilR);

    // Eyelids (Upper and Lower lids for smooth natural blinking)
    const upperLidGeom = new THREE.SphereGeometry(
      0.116,
      24,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.5
    );
    const lidMat = new THREE.MeshStandardMaterial({
      color: 0x030712,
      roughness: 0.5,
    });
    const upperLidL = new THREE.Mesh(upperLidGeom, lidMat);
    const upperLidR = new THREE.Mesh(upperLidGeom, lidMat);
    upperLidL.rotation.x = -Math.PI * 0.45;
    upperLidR.rotation.x = -Math.PI * 0.45;
    eyeSocketGroupL.add(upperLidL);
    eyeSocketGroupR.add(upperLidR);

    // 4. Expressive Realistic Human Lips & Mouth
    const upperLipCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.24, -0.36, 0.78),
      new THREE.Vector3(-0.08, -0.34, 0.83),
      new THREE.Vector3(0, -0.35, 0.84),
      new THREE.Vector3(0.08, -0.34, 0.83),
      new THREE.Vector3(0.24, -0.36, 0.78),
    ]);
    const upperLipGeom = new THREE.TubeGeometry(upperLipCurve, 24, 0.024, 12, false);

    const lowerLipCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.21, -0.37, 0.78),
      new THREE.Vector3(0, -0.42, 0.83),
      new THREE.Vector3(0.21, -0.37, 0.78),
    ]);
    const lowerLipGeom = new THREE.TubeGeometry(lowerLipCurve, 20, 0.026, 12, false);

    const lipMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
      roughness: 0.25,
      metalness: 0.5,
    });
    const upperLipMesh = new THREE.Mesh(upperLipGeom, lipMat);
    const lowerLipMesh = new THREE.Mesh(lowerLipGeom, lipMat);
    headGroup.add(upperLipMesh);
    headGroup.add(lowerLipMesh);

    // Mouth Cavity (Dark interior for when mouth opens while speaking)
    const mouthCavityGeom = new THREE.SphereGeometry(0.16, 16, 16);
    const mouthCavityMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const mouthCavityMesh = new THREE.Mesh(mouthCavityGeom, mouthCavityMat);
    mouthCavityMesh.position.set(0, -0.38, 0.72);
    mouthCavityMesh.scale.set(1.2, 0.4, 0.6);
    headGroup.add(mouthCavityMesh);

    // Audio Analysis Setup (for live voice-reactive lip sync)
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array | null = null;

    const setupMic = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const source = audioCtx.createMediaStreamSource(stream);
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          dataArray = new Uint8Array(analyser.frequencyBinCount);
        }
      } catch (err) {
        // Fallback to simulated audio frequency
      }
    };
    if (isListening) {
      setupMic();
    }

    // Interactive Pointer Tracking
    let targetRotX = 0;
    let targetRotY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / width) * 2 - 1;
      const mouseY = -(((e.clientY - rect.top) / height) * 2 - 1);
      targetRotY = mouseX * 0.28;
      targetRotX = -mouseY * 0.22;
    };
    window.addEventListener('mousemove', handlePointerMove);

    // Animation & Emotion State Loop
    let blinkTimer = 0;
    let isBlinking = false;
    let clock = new THREE.Clock();
    let animFrameId: number;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth Head Tracking & Breathing
      headGroup.rotation.y += (targetRotY - headGroup.rotation.y) * 0.08;
      headGroup.rotation.x += (targetRotX - headGroup.rotation.x) * 0.08;
      headGroup.position.y = Math.sin(elapsedTime * 1.8) * 0.025; // Subtle natural breathing

      // Wireframe pulse
      wireMesh.rotation.y = elapsedTime * 0.15;

      // Realistic Human Blinking (every 3.5 seconds for 180ms)
      blinkTimer += 0.016;
      if (blinkTimer > 3.4) {
        isBlinking = true;
        if (blinkTimer > 3.6) {
          isBlinking = false;
          blinkTimer = 0;
        }
      }

      // Eyelid Rotation (Blink interpolation)
      const targetLidAngle = isBlinking ? -Math.PI * 0.05 : -Math.PI * 0.45;
      upperLidL.rotation.x += (targetLidAngle - upperLidL.rotation.x) * 0.35;
      upperLidR.rotation.x += (targetLidAngle - upperLidR.rotation.x) * 0.35;

      // Audio Frequency Analysis & Mouth Movement
      let voiceAmplitude = 0;
      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray as any);
        const lowSum = dataArray.slice(0, 8).reduce((acc, v) => acc + v, 0);
        voiceAmplitude = lowSum / (8 * 255);
      } else if (isSpeaking) {
        // Procedural speech phonemes
        voiceAmplitude = Math.abs(Math.sin(elapsedTime * 9) * 0.65 + Math.cos(elapsedTime * 14) * 0.35);
      } else if (isListening) {
        voiceAmplitude = Math.abs(Math.sin(elapsedTime * 4) * 0.2);
      }

      // Mouth Deformation (Lip-sync)
      const openAmount = voiceAmplitude * 0.16;
      lowerLipMesh.position.y = -openAmount;
      upperLipMesh.position.y = openAmount * 0.3;
      mouthCavityMesh.scale.y = 0.4 + voiceAmplitude * 1.2;

      // Eyebrow Emotion Expressions
      if (status === 'breach' || status === 'alert') {
        // Furrowed, stern alert expression
        browMeshL.position.y = -0.04;
        browMeshR.position.y = -0.04;
        browMeshL.rotation.z = 0.14;
        browMeshR.rotation.z = -0.14;
      } else if (isListening) {
        // Inquisitive, raised eyebrows
        browMeshL.position.y = 0.035;
        browMeshR.position.y = 0.035;
        browMeshL.rotation.z = -0.08;
        browMeshR.rotation.z = 0.08;
      } else {
        // Natural resting
        browMeshL.position.y = 0;
        browMeshR.position.y = 0;
        browMeshL.rotation.z = 0;
        browMeshR.rotation.z = 0;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      headGeom.dispose();
      headMat.dispose();
      wireGeom.dispose();
      wireMat.dispose();
    };
  }, [isListening, isSpeaking, status]);

  return (
    <div
      ref={mountRef}
      onClick={onClick}
      className="relative w-40 h-40 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
      title="Gerçekçi 3D Siber Ajan (Tıklayın: AI Görüşü & Ekran Paylaşımı)"
    />
  );
};
