"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import Mountain from "./Mountain";
import Atmosphere from "./Atmosphere";
import { useHeroStore } from "./HeroStore";

function CameraRig() {
  const cameraGroupRef = useRef<THREE.Group>(null);
  const fogRef = useRef<THREE.Fog>(null);
  
  useFrame((state) => {
    const progress = useHeroStore.getState().scrollProgress;
    
    if (cameraGroupRef.current) {
      // Base cinematic drift
      const driftX = Math.sin(state.clock.elapsedTime * 0.1) * 2;
      const driftY = Math.cos(state.clock.elapsedTime * 0.05) * 1;
      
      // Scroll-driven forward movement (enter the mountain)
      // Camera starts at Z=5 and moves deep into the scene to Z=-20
      const targetZ = 5 - (progress * 25);
      
      cameraGroupRef.current.position.x = driftX;
      cameraGroupRef.current.position.y = driftY;
      
      // Lerp camera Z for smoothness
      cameraGroupRef.current.position.z = THREE.MathUtils.lerp(
        cameraGroupRef.current.position.z,
        targetZ,
        0.1
      );
      
      // Slight upward look as we get closer
      cameraGroupRef.current.rotation.x = progress * 0.2;
    }

    if (fogRef.current) {
      // Clear fog as we scroll in
      const targetNear = 10 + (progress * 20);
      const targetFar = 40 + (progress * 80);
      
      fogRef.current.near = THREE.MathUtils.lerp(fogRef.current.near, targetNear, 0.1);
      fogRef.current.far = THREE.MathUtils.lerp(fogRef.current.far, targetFar, 0.1);
    }
  });

  return (
    <>
      <fog ref={fogRef} attach="fog" args={["#020203", 10, 40]} />
      <group ref={cameraGroupRef} position={[0, 0, 5]}>
        <PerspectiveCamera makeDefault position={[0, 0, 0]} fov={50} />
      </group>
    </>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 w-full h-full z-0 bg-[#050505]">
      <Canvas shadows dpr={[1, 2]}>
        <color attach="background" args={["#020203"]} />
        
        <Suspense fallback={null}>
          <CameraRig />
          
          {/* Atmospheric Lighting */}
          <ambientLight intensity={0.2} color="#406080" />
          <directionalLight 
            position={[-10, 20, 10]} 
            intensity={1.5} 
            color="#ffffff" 
            castShadow 
            shadow-mapSize={[2048, 2048]}
          />
          <pointLight position={[0, 5, -10]} intensity={0.5} color="#88bbee" />
          
          <Mountain />
          <Atmosphere />
          
          {/* Cinematic Post-Processing */}
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} mipmapBlur intensity={0.8} />
            <Noise opacity={0.05} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
