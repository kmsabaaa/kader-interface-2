"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, MeshTransmissionMaterial, Float, Sparkles } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

function CinematicGlassRing({ isMobile }: { isMobile: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.getElapsedTime() * 0.15;
      mesh.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
      <mesh ref={mesh} scale={isMobile ? 1.0 : 1.2}>
        <torusGeometry args={[2.2, 0.6, 32, 64]} />
        {isMobile ? (
          // Lightweight material for mobile GPUs
          <meshPhysicalMaterial 
            color="#ffb703" 
            transmission={0.7} 
            thickness={1} 
            roughness={0.05} 
            metalness={0.1}
            clearcoat={1}
          />
        ) : (
          // High-end material for Desktops
          <MeshTransmissionMaterial
            backside
            samples={4} 
            thickness={0.8}
            chromaticAberration={0.8}
            anisotropy={0.3}
            distortion={0.5}
            distortionScale={0.5}
            temporalDistortion={0.1}
            color="#ffb703"
            resolution={512}
          />
        )}
      </mesh>
    </Float>
  );
}

export default function Hero3D() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 2]} 
        gl={{ 
          antialias: false,
          powerPreference: "high-performance",
          alpha: true 
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={2} color="#fbbf24" />
        <Environment preset="city" />
        
        <CinematicGlassRing isMobile={isMobile} />
        
        <Sparkles 
          count={isMobile ? 60 : 150} // Significant reduction for mobile
          scale={15} 
          size={isMobile ? 4 : 2} 
          speed={0.4} 
          opacity={0.6} 
          color="#fbbf24" 
        />
      </Canvas>
    </div>
  );
}