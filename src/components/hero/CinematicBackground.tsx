"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export function CinematicBackground() {
  const bgRef = useRef<HTMLImageElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ultra-slow cinematic pan and scale to simulate a drone shot
    if (bgRef.current) {
      gsap.to(bgRef.current, {
        scale: 1.15,
        yPercent: -5,
        xPercent: 2,
        duration: 40,
        ease: "none",
        yoyo: true,
        repeat: -1,
      });
    }

    // Snow/dust particles drifting slowly upwards and across
    if (particlesRef.current) {
      gsap.to(particlesRef.current, {
        y: "-50%",
        x: "-2%",
        duration: 20,
        ease: "none",
        repeat: -1,
      });
    }
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#050505] z-0">
      
      {/* High-res cinematic AI mountain landscape */}
      <img
        ref={bgRef}
        src="/hero-bg.png"
        alt="Cinematic Mountain Ridge"
        className="absolute inset-0 w-full h-full object-cover origin-center opacity-70"
      />

      {/* Very subtle drifting particles (snow/fog) using a CSS noise mask or simple dots */}
      <div 
        ref={particlesRef}
        className="absolute top-0 left-0 w-[200%] h-[200%] pointer-events-none opacity-20 mix-blend-screen"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '120px 120px',
          backgroundPosition: '0 0, 60px 60px',
        }}
      />

      {/* 50% Dark Overlay for perfect text readability as requested */}
      <div className="absolute inset-0 bg-[#050505]/50" />
      
      {/* Subtle vignette edges */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#050505]/80" />
    </div>
  );
}
