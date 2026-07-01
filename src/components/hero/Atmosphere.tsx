"use client";

import { Sparkles, Clouds, Cloud } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useHeroStore } from "./HeroStore";

export default function Atmosphere() {
  const cloudsRef = useRef<THREE.Group>(null);
  const leftCloudRef = useRef<THREE.Group>(null);
  const rightCloudRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const progress = useHeroStore.getState().scrollProgress;

    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.02;
    }

    // Separate clouds as we enter the mountain
    if (leftCloudRef.current) {
      const targetX = -15 - (progress * 30);
      leftCloudRef.current.position.x = THREE.MathUtils.lerp(leftCloudRef.current.position.x, targetX, 0.1);
    }
    if (rightCloudRef.current) {
      const targetX = 15 + (progress * 30);
      rightCloudRef.current.position.x = THREE.MathUtils.lerp(rightCloudRef.current.position.x, targetX, 0.1);
    }
  });

  return (
    <>
      {/* Floating dust particles */}
      <Sparkles 
        count={250} 
        scale={[40, 20, 40]} 
        position={[0, 5, -10]} 
        size={2} 
        speed={0.2} 
        opacity={0.4} 
        color="#ffffff" 
      />
      
      {/* Volumetric Clouds */}
      <group ref={cloudsRef}>
        <Clouds material={THREE.MeshBasicMaterial}>
          <Cloud segments={20} bounds={[20, 2, 20]} volume={10} color="#888888" position={[0, 10, -25]} opacity={0.3} speed={0.2} />
          <group ref={leftCloudRef} position={[-15, 8, -20]}>
            <Cloud segments={20} bounds={[20, 2, 20]} volume={10} color="#aaaaaa" opacity={0.2} speed={0.1} />
          </group>
          <group ref={rightCloudRef} position={[15, 12, -22]}>
            <Cloud segments={20} bounds={[20, 2, 20]} volume={10} color="#666666" opacity={0.4} speed={0.3} />
          </group>
        </Clouds>
      </group>
    </>
  );
}
