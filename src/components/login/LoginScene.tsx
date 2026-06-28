"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import { Sparkles, Clouds, Cloud, PerspectiveCamera } from "@react-three/drei";
import Mountain from "../hero/Mountain";

function Atmosphere() {
  const cloudsRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.005; // Very slow
    }
  });

  return (
    <>
      <Sparkles 
        count={300} 
        scale={[50, 20, 50]} 
        position={[0, 5, -15]} 
        size={1.5} 
        speed={0.1} // Very slow
        opacity={0.2} 
        color="#a8b2b0" // Very subtle emerald-tinted grey
      />
      
      <group ref={cloudsRef}>
        <Clouds material={THREE.MeshBasicMaterial}>
          <Cloud segments={30} bounds={[20, 2, 20]} volume={10} color="#111111" position={[0, 5, -20]} opacity={0.3} speed={0.05} />
          <Cloud segments={30} bounds={[20, 2, 20]} volume={10} color="#050505" position={[-15, 2, -15]} opacity={0.4} speed={0.05} />
          <Cloud segments={30} bounds={[20, 2, 20]} volume={10} color="#0a0a0a" position={[15, 8, -18]} opacity={0.2} speed={0.05} />
        </Clouds>
      </group>
    </>
  );
}

function CameraRig() {
  const cameraGroupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (cameraGroupRef.current) {
      // Extremely slow, subtle breathing motion
      cameraGroupRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.05) * 1;
      cameraGroupRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.02) * 0.5;
      cameraGroupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.02) * 0.02;
    }
  });

  return (
    <group ref={cameraGroupRef}>
      <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={45} />
    </group>
  );
}

export default function LoginScene() {
  return (
    <div className="absolute inset-0 w-full h-full z-0 bg-[#020202]">
      <Canvas shadows dpr={[1, 2]}>
        <color attach="background" args={["#020202"]} />
        <fog attach="fog" args={["#020202", 5, 25]} />
        
        <Suspense fallback={null}>
          <CameraRig />
          
          {/* Extremely subtle lighting for silhouette effect */}
          <ambientLight intensity={0.05} color="#050806" />
          <directionalLight 
            position={[-5, 10, -5]} 
            intensity={0.2} 
            color="#dcdedf" 
            castShadow 
            shadow-mapSize={[1024, 1024]}
          />
          {/* Subtle emerald/warm accent light behind the mountain */}
          <pointLight position={[0, -2, -15]} intensity={0.5} color="#0a1a15" />
          
          <Mountain />
          <Atmosphere />
          
          <EffectComposer>
            <Bloom luminanceThreshold={0.5} mipmapBlur intensity={0.3} />
            <Noise opacity={0.08} />
            <Vignette eskil={false} offset={0.2} darkness={1.3} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
