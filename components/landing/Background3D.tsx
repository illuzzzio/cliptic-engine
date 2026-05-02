"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function InteractiveStars() {
  const pointsRef = useRef<THREE.Points>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const [positions, colors] = useMemo(() => {
    const count = 4000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const colorOptions = [
      new THREE.Color("#7000FF"), // Deep Purple
      new THREE.Color("#B026FF"), // Electric Purple
      new THREE.Color("#00E5FF"), // Cyan
      new THREE.Color("#ffffff"), // White
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50 - 25;
      
      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return [positions, colors];
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Natural slow drift towards camera
      pointsRef.current.position.z += delta * 1.5;
      if (pointsRef.current.position.z > 25) {
        pointsRef.current.position.z = 0;
      }

      // Interactive mouse parallax
      const targetX = mouse.current.x * 3;
      const targetY = mouse.current.y * 3;
      
      pointsRef.current.position.x += (targetX - pointsRef.current.position.x) * 0.05;
      pointsRef.current.position.y += (targetY - pointsRef.current.position.y) * 0.05;
      
      pointsRef.current.rotation.x += (mouse.current.y * 0.03 - pointsRef.current.rotation.x) * 0.05;
      pointsRef.current.rotation.y += (mouse.current.x * 0.03 - pointsRef.current.rotation.y) * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial vertexColors size={0.08} transparent opacity={0.8} sizeAttenuation={true} />
    </points>
  );
}

function ShootingStars() {
  const linesRef = useRef<THREE.Group>(null);
  
  const stars = useMemo(() => {
    return Array.from({ length: 8 }).map(() => ({
      x: (Math.random() - 0.5) * 100,
      y: Math.random() * 50 + 20,
      z: (Math.random() - 0.5) * 50 - 20,
      speed: Math.random() * 40 + 40,
      active: false,
      delay: Math.random() * 8,
    }));
  }, []);

  useFrame((state, delta) => {
    if (linesRef.current) {
      stars.forEach((star, i) => {
        if (!star.active) {
          star.delay -= delta;
          if (star.delay <= 0) {
            star.active = true;
            star.x = (Math.random() - 0.5) * 100;
            star.y = Math.random() * 50 + 20;
            star.z = (Math.random() - 0.5) * 50 - 20;
          }
        } else {
          // Move diagonally down-left
          star.x -= star.speed * delta;
          star.y -= star.speed * delta;
          
          if (star.y < -50 || star.x < -50) {
            star.active = false;
            star.delay = Math.random() * 5 + 2;
          }
        }
        
        const line = linesRef.current.children[i] as THREE.Mesh;
        if (line) {
          line.position.set(star.x, star.y, star.z);
          line.visible = star.active;
        }
      });
    }
  });

  return (
    <group ref={linesRef}>
      {stars.map((_, i) => (
        <mesh key={i} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.01, 0.05, 8, 4]} />
          <meshBasicMaterial color="#00E5FF" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

export function Background3D() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }} aria-hidden="true">
      {/* Deep dark base */}
      <div className="absolute inset-0" style={{ background: "#090909" }} />

      {/* Three.js Interactive Starfield & Shooting Stars */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <fog attach="fog" args={["#090909", 10, 40]} />
          <InteractiveStars />
          <ShootingStars />
        </Canvas>
      </div>

      {/* Deep Purple top blob — hero accent */}
      <div className="absolute z-10 mix-blend-screen" style={{
        width: "900px", height: "900px", top: "-200px", left: "50%",
        transform: "translateX(-50%)",
        background: "radial-gradient(ellipse, rgba(112,0,255,0.06) 0%, transparent 68%)",
        animation: "float-blob-1 8s ease-in-out infinite alternate",
        borderRadius: "50%",
      }} />

      {/* Electric Purple left blob */}
      <div className="absolute z-10 mix-blend-screen" style={{
        width: "600px", height: "600px", bottom: "10%", left: "-100px",
        background: "radial-gradient(ellipse, rgba(176,38,255,0.05) 0%, transparent 70%)",
        animation: "float-blob-2 10s ease-in-out infinite alternate",
        borderRadius: "50%",
      }} />

      {/* Cyan right blob */}
      <div className="absolute z-10 mix-blend-screen" style={{
        width: "500px", height: "500px", bottom: "20%", right: "-80px",
        background: "radial-gradient(ellipse, rgba(0,229,255,0.04) 0%, transparent 70%)",
        animation: "float-blob-3 7s ease-in-out infinite alternate",
        borderRadius: "50%",
      }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 z-10" style={{
        backgroundImage: "repeating-linear-gradient(rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 60px)",
        backgroundSize: "60px 60px",
      }} />

      {/* Grain noise */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] z-10" xmlns="http://www.w3.org/2000/svg">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* Bottom vignette */}
      <div className="absolute bottom-0 left-0 right-0 z-10" style={{ height: "300px", background: "linear-gradient(to top, #090909 0%, transparent 100%)" }} />
    </div>
  );
}
