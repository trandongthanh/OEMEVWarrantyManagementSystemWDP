"use client";

import { useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  PerspectiveCamera,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";

// Interactive Range Rover Model Component
function InteractiveCar() {
  const { scene } = useGLTF("/models/range_rover_-_midnight_blue.glb");
  const carRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [currentView, setCurrentView] = useState("default");
  const { camera } = useThree();

  // Smooth rotation animation on hover with futuristic floating effect
  useFrame((state) => {
    if (carRef.current) {
      // Continuous slow rotation for showcase
      carRef.current.rotation.y += 0.002;

      // Subtle floating animation
      carRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.8) * 0.05 - 0.5;

      // Enhanced movement on hover
      if (isHovered) {
        carRef.current.rotation.y +=
          Math.sin(state.clock.elapsedTime * 2) * 0.003;
        carRef.current.position.y +=
          Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
      }
    }
  });

  // Cinematic camera transitions with better angles for Range Rover
  const handleCarClick = useCallback(() => {
    const views = {
      default: { position: [4, 1.5, 5], target: [0, 0.5, 0] },
      frontAngle: { position: [3.5, 1.2, 4], target: [0, 0.8, 0] },
      sideProfile: { position: [5, 1, 0], target: [0, 0.5, 0] },
      rearAngle: { position: [-4, 1.8, -3], target: [0, 0.5, 0] },
      topView: { position: [0, 4, 2], target: [0, 0, 0] },
    };

    const viewKeys = Object.keys(views);
    const currentIndex = viewKeys.indexOf(currentView);
    const nextView = viewKeys[(currentIndex + 1) % viewKeys.length];

    const targetView = views[nextView as keyof typeof views];

    // Smooth camera transition
    const startPos = camera.position.clone();
    const targetPos = new THREE.Vector3(...targetView.position);

    let progress = 0;
    const animate = () => {
      progress += 0.015;
      if (progress <= 1) {
        camera.position.lerpVectors(startPos, targetPos, progress);
        camera.lookAt(new THREE.Vector3(...targetView.target));
        requestAnimationFrame(animate);
      }
    };
    animate();

    setCurrentView(nextView);
  }, [camera, currentView]);

  return (
    <primitive
      ref={carRef}
      object={scene}
      position={[0, -0.05, 0]}
      scale={[0.02, 0.02, 0.02]}
      rotation={[0, Math.PI * 0.15, 0]}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onClick={handleCarClick}
    />
  );
}

// Enhanced 3D Scene Component with Futuristic Lighting
export default function CarScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [4, 1.5, 5], fov: 50 }}
      style={{ background: "transparent" }}
      gl={{ antialias: true, alpha: true }}
    >
      <PerspectiveCamera makeDefault position={[4, 1.5, 5]} />

      {/* Enhanced Lighting setup for luxury feel */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        castShadow
        color="#ffffff"
      />

      {/* Blue accent lights for Range Rover */}
      <pointLight position={[-5, 3, 5]} intensity={0.8} color="#1e40af" />
      <pointLight position={[5, 2, -5]} intensity={0.6} color="#3b82f6" />
      <pointLight position={[0, -1, 3]} intensity={0.4} color="#60a5fa" />

      {/* Spotlight for dramatic effect */}
      <spotLight
        position={[0, 5, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        castShadow
        color="#93c5fd"
      />

      {/* Premium Environment */}
      <Environment preset="sunset" />

      {/* Interactive Range Rover */}
      <InteractiveCar />

      {/* Enhanced controls for better interaction */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        autoRotate={false}
        rotateSpeed={0.4}
        maxPolarAngle={Math.PI * 0.7}
        minPolarAngle={Math.PI * 0.25}
        maxDistance={8}
        minDistance={3}
      />
    </Canvas>
  );
}
