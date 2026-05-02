"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, PerspectiveCamera, Icosahedron } from "@react-three/drei";
import * as THREE from "three";

function AnimatedHeroShape() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.1;
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={[0, 0, -2]} scale={1.8}>
        <icosahedronGeometry args={[2, 1]} />
        <meshPhysicalMaterial 
          color="#00E5FF"
          emissive="#7000FF"
          emissiveIntensity={0.4}
          wireframe={true}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </Float>
  );
}

export function Hero3DEffect() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-40 mix-blend-screen">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} color="#00E5FF" intensity={3} />
        <pointLight position={[-10, -10, -10]} color="#B026FF" intensity={3} />
        
        {/* Deep space stars effect */}
        <Stars radius={150} depth={50} count={3000} factor={4} saturation={1} fade speed={1.5} />
        
        <AnimatedHeroShape />
      </Canvas>
      {/* Heavy vignette overlay so it blends seamlessly into the black background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_50%,transparent_0%,#090909_80%)]" />
    </div>
  );
}
