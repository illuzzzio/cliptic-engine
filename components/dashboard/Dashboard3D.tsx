"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

function AnimatedShape() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.15;
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh ref={meshRef} scale={1.2}>
        <torusKnotGeometry args={[1.5, 0.4, 128, 32]} />
        {/* Electric Purple wireframe material */}
        <meshPhysicalMaterial 
          color="#00E5FF"
          emissive="#B026FF"
          emissiveIntensity={0.8}
          wireframe={true}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </Float>
  );
}

export function Dashboard3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl opacity-60">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 7]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} color="#00E5FF" intensity={2} />
        <pointLight position={[-10, -10, -10]} color="#B026FF" intensity={2} />
        
        {/* Deep space stars effect */}
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={1} fade speed={2} />
        
        <AnimatedShape />
      </Canvas>
      {/* Vignette overlay to blend with background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0a0a0a_80%)]" />
    </div>
  );
}
