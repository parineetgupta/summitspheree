"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { createNoise3D } from "simplex-noise";

interface CrystalTrophyProps {
  position?: [number, number, number];
  scale?: [number, number, number];
  index: number;
}

export function CrystalTrophy({ position = [0, 0, 0], scale = [1, 1, 1], index }: CrystalTrophyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const crystalRef = useRef<THREE.Mesh>(null);
  
  // Base rotation offset to make each crystal look unique
  const baseRotationY = index * (Math.PI / 3);
  
  // Generate a unique, highly detailed mountain crystal geometry using SimplexNoise
  const geometry = useMemo(() => {
    // Reduced geometry density for performance
    const geo = new THREE.ConeGeometry(1, 3, 64, 64);
    const pos = geo.attributes.position;
    
    // Seed noise with the trophy index so they all look different
    const noise3D = createNoise3D();
    const v = new THREE.Vector3();
    
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      
      // Calculate height factor so the base remains relatively flat and the peak gets more jagged
      const heightFactor = Math.max(0, (v.y + 1.5) / 3); 
      
      // Multiple octaves of noise for a natural "fractal" rocky look
      let noiseVal = noise3D(v.x * 2 + index, v.y * 2, v.z * 2) * 0.2;
      noiseVal += noise3D(v.x * 4 + index, v.y * 4, v.z * 4) * 0.1;
      noiseVal += noise3D(v.x * 8 + index, v.y * 8, v.z * 8) * 0.05;
      
      // Apply displacement
      const displacement = 1 + noiseVal * heightFactor;
      v.x *= displacement;
      v.z *= displacement;
      
      // Pinch the top slightly to ensure a sharp peak
      if (v.y > 1.2) {
        const pinch = Math.max(0, 1.5 - v.y);
        v.x *= pinch;
        v.z *= pinch;
      }

      pos.setXYZ(i, v.x, v.y, v.z);
    }
    
    geo.computeVertexNormals();
    return geo;
  }, [index]);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Slow ambient rotation
    groupRef.current.rotation.y = baseRotationY + state.clock.getElapsedTime() * 0.1;
    
    // Gentle mouse reaction
    const targetX = (state.pointer.x * Math.PI) / 10;
    const targetY = (state.pointer.y * Math.PI) / 10;
    
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetY, 0.05);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -targetX, 0.05);
    
    // Subtle float
    groupRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.5 + index) * 0.2;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      
      {/* The High-Fidelity Crystal Mountain */}
      <mesh ref={crystalRef} geometry={geometry} position={[0, 1.5, 0]} castShadow receiveShadow>
        <MeshTransmissionMaterial 
          backside
          resolution={512} // Cap refraction resolution
          samples={2} // Reduced from 4
          thickness={3}
          roughness={0} // Completely polished surface
          transmission={1}
          ior={1.5} // Quartz/Glass index of refraction
          chromaticAberration={0.06}
          anisotropy={0.3}
          distortion={0.5}
          distortionScale={0.3}
          color="#ffffff"
          attenuationColor="#a7f3d0" // Soft emerald tint as light passes through
          attenuationDistance={2}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* The Premium Obsidian Pedestal */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.2, 1.3, 0.4, 64]} />
        <meshStandardMaterial 
          color="#020202" 
          metalness={0.9} 
          roughness={0.1}
          envMapIntensity={2} 
        />
      </mesh>
      
      {/* Subtle Glowing Core under the crystal */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshBasicMaterial color="#00D084" transparent opacity={0.6} />
      </mesh>

    </group>
  );
}
