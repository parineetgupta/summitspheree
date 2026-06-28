"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface JourneyStatsProps {
  summits: number;
  distance: number;
  elevation: number;
}

export function JourneyStats({ summits, distance, elevation }: JourneyStatsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const summitsRef = useRef<HTMLSpanElement>(null);
  const distanceRef = useRef<HTMLSpanElement>(null);
  const elevationRef = useRef<HTMLSpanElement>(null);
  const dreamsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in the stats sequentially
      gsap.from(".stat-item", {
        y: 100,
        opacity: 0,
        duration: 1.5,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
        }
      });

      // Count-up animations for the numbers
      const setupCounter = (ref: React.RefObject<HTMLElement | null>, target: number) => {
        if (!ref.current) return;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 60%",
          },
          onUpdate: () => {
            if (ref.current) ref.current.innerText = Math.round(obj.val).toString();
          }
        });
      };

      setupCounter(summitsRef, summits);
      setupCounter(distanceRef, distance);
      setupCounter(elevationRef, elevation);
      setupCounter(dreamsRef, 0); // Placeholder for "Dream Expeditions"

    }, containerRef);

    return () => ctx.revert();
  }, [summits, distance, elevation]);

  return (
    <section ref={containerRef} className="min-h-[80vh] w-full flex flex-col items-center justify-center bg-[#050505] relative py-32 px-8">
      <p className="text-[10px] tracking-[0.5em] text-[#6b7280] uppercase mb-32">The Journey So Far</p>
      
      <div className="flex flex-wrap justify-center gap-24 md:gap-40 max-w-6xl w-full">
        <div className="stat-item flex flex-col items-center text-center">
          <span ref={summitsRef} className="text-7xl md:text-9xl font-serif text-white mb-6 tracking-tighter font-light">0</span>
          <span className="text-[9px] tracking-[0.3em] text-[#6b7280] uppercase">Summits Completed</span>
        </div>
        
        <div className="stat-item flex flex-col items-center text-center">
          <div className="flex items-baseline gap-2 mb-6">
            <span ref={distanceRef} className="text-7xl md:text-9xl font-serif text-white tracking-tighter font-light">0</span>
            <span className="text-2xl font-serif italic text-[#4b5563]">km</span>
          </div>
          <span className="text-[9px] tracking-[0.3em] text-[#6b7280] uppercase">Distance Traversed</span>
        </div>
        
        <div className="stat-item flex flex-col items-center text-center">
          <div className="flex items-baseline gap-2 mb-6">
            <span ref={elevationRef} className="text-7xl md:text-9xl font-serif text-white tracking-tighter font-light">0</span>
            <span className="text-2xl font-serif italic text-[#4b5563]">m</span>
          </div>
          <span className="text-[9px] tracking-[0.3em] text-[#6b7280] uppercase">Elevation Gained</span>
        </div>
        
        <div className="stat-item flex flex-col items-center text-center">
          <span ref={dreamsRef} className="text-7xl md:text-9xl font-serif text-white mb-6 tracking-tighter font-light">0</span>
          <span className="text-[9px] tracking-[0.3em] text-[#6b7280] uppercase">Dream Expeditions</span>
        </div>
      </div>
    </section>
  );
}
