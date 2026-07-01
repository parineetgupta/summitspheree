"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";
import { Suspense, useRef, useMemo } from "react";
import * as THREE from "three";
import { Sparkles, PerspectiveCamera } from "@react-three/drei";

function AtlasConstellation() {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  
  // Generate random points for the atlas nodes
  const { points, lineGeometry } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const count = 100;
    const radius = 15;
    
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * radius * 2;
      const y = (Math.random() - 0.5) * radius * 2;
      const z = (Math.random() - 0.5) * radius; // Keep it slightly flatter
      pts.push(new THREE.Vector3(x, y, z));
    }
    
    // Connect nodes that are close to each other
    const linePositions: number[] = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const distance = pts[i].distanceTo(pts[j]);
        if (distance < 5) { // Threshold for connection
          linePositions.push(
            pts[i].x, pts[i].y, pts[i].z,
            pts[j].x, pts[j].y, pts[j].z
          );
        }
      }
    }
    
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    
    return { points: pts, lineGeometry: geom };
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Extremely slow, mysterious rotation
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
    if (linesRef.current) {
      // Subtle pulsing opacity on the connections
      (linesRef.current.material as THREE.LineBasicMaterial).opacity = 0.05 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={[5, 0, -10]}>
      {/* Nodes */}
      {points.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#E2E8F0" transparent opacity={0.4} />
        </mesh>
      ))}
      
      {/* Connections (Routes) */}
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial color="#64748B" transparent opacity={0.05} linewidth={1} />
      </lineSegments>
    </group>
  );
}

function Atmosphere() {
  return (
    <Sparkles 
      count={400} 
      scale={[30, 30, 20]} 
      position={[5, 0, -10]} 
      size={1.5} 
      speed={0.2} 
      opacity={0.15} 
      color="#A0AEC0" 
    />
  );
}

function CameraRig() {
  const cameraGroupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (cameraGroupRef.current) {
      // Very slow cinematic breathing
      cameraGroupRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.5;
      cameraGroupRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.05) * 0.5;
    }
  });

  return (
    <group ref={cameraGroupRef}>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />
    </group>
  );
}

export default function LoginScene() {
  return (
    <div className="absolute inset-0 w-full h-full z-0 bg-[#020202]">
      <Canvas dpr={[1, 1.5]}>
        <color attach="background" args={["#020202"]} />
        <fog attach="fog" args={["#020202", 10, 30]} />
        
        <Suspense fallback={null}>
          <CameraRig />
          
          <AtlasConstellation />
          <Atmosphere />
          
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} />
            <Noise opacity={0.05} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
