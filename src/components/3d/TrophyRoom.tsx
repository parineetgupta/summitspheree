"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, PerspectiveCamera, SpotLight, Sparkles } from "@react-three/drei";
import { CrystalTrophy } from "./CrystalTrophy";
import * as THREE from "three";

interface TrophyRoomProps {
  trophies: { id: string }[];
}

export const TrophyRoom = forwardRef<{ setLightIntensity: (val: number) => void }, TrophyRoomProps>(
  ({ trophies }, ref) => {
    const spotLightRef = useRef<THREE.SpotLight>(null);

    useImperativeHandle(ref, () => ({
      setLightIntensity: (val: number) => {
        if (spotLightRef.current) {
          spotLightRef.current.intensity = val;
        }
      }
    }));

    return (
      <div className="absolute inset-0 pointer-events-none z-0">
        <Canvas 
          shadows
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }} 
          className="pointer-events-auto"
        >
          <color attach="background" args={["#030303"]} />
          <fog attach="fog" args={["#030303", 5, 25]} />
          
          <PerspectiveCamera makeDefault position={[0, 3, 14]} fov={35} />
          
          <ambientLight intensity={0.1} />
          
          {/* Museum Volumetric-Style Spotlights */}
          <SpotLight
            ref={spotLightRef}
            position={[0, 15, 0]}
            angle={0.8}
            penumbra={1}
            intensity={0} // Starts at 0, driven by GSAP
            color="#ffffff"
            castShadow
            distance={30}
            attenuation={15}
            anglePower={4} // Creates a focused beam
          />

          {/* Ambient Dust Particles */}
          <Sparkles count={200} scale={20} size={1.5} speed={0.1} opacity={0.3} noise={1} color="#ffffff" />

          {/* Dark Environment for glass reflections */}
          <Environment preset="night" environmentIntensity={0.5} />

          {/* Map out the trophies in a 3-column layout */}
          {trophies.map((trophy, index) => {
            const col = index % 3;
            const row = Math.floor(index / 3);
            const spacingX = 4.5;
            const spacingZ = -3;
            
            const x = (col - 1) * spacingX;
            const z = row * spacingZ - 2;
            
            // Subtle scale variation
            const scaleY = 0.9 + (index % 3) * 0.15; 
            
            return (
              <CrystalTrophy 
                key={trophy.id} 
                index={index} 
                position={[x, -2, z]} 
                scale={[1, scaleY, 1]} 
              />
            );
          })}
        </Canvas>
      </div>
    );
  }
);
TrophyRoom.displayName = "TrophyRoom";

