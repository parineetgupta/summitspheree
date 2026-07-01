"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export default function Mountain() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Generate procedural mountain geometry
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(100, 100, 64, 64);
    geo.rotateX(-Math.PI / 2);

    const positions = geo.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      
      // Simple pseudo-random fractal noise for mountain shape
      // Center peak
      const dist = Math.sqrt(x * x + z * z);
      const centerPeak = Math.max(0, 20 - dist * 0.8) * 1.5;
      
      // Add some high-frequency noise for rocky detail
      const noise1 = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 2.0;
      const noise2 = Math.sin(x * 2.0 + z) * Math.cos(z * 2.0 - x) * 0.5;
      
      // Base elevation
      let y = centerPeak + noise1 + noise2;
      
      // Flatten edges
      if (dist > 30) {
        y *= Math.max(0, 1 - (dist - 30) / 20);
      }
      
      positions[i + 1] = y;
    }
    
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, -5, -20]} receiveShadow castShadow>
      <meshStandardMaterial 
        color="#1a1a1a"
        roughness={0.9}
        metalness={0.1}
        flatShading={true}
      />
    </mesh>
  );
}
