"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

import { Expedition } from "@/types";

export function JourneyStats({ expeditions }: { expeditions: Expedition[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const summitsRef = useRef<HTMLSpanElement>(null);
  const distanceRef = useRef<HTMLSpanElement>(null);
  const elevationRef = useRef<HTMLSpanElement>(null);
  const dreamsRef = useRef<HTMLSpanElement>(null);

  const completed = expeditions.filter(e => e.status === "completed");
  const summits = completed.length;
  const distance = completed.reduce((acc, e) => acc + (Number(e.distance) || 0), 0);
  const elevation = completed.reduce((acc, e) => acc + (Number(e.elevation) || 0), 0);
  const dreams = expeditions.filter(e => e.status === "future").length;

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
      setupCounter(dreamsRef, dreams);

    }, containerRef);

    return () => ctx.revert();
  }, [summits, distance, elevation, dreams]);

  return (
    <section ref={containerRef} className="w-full flex flex-col items-center justify-center bg-[#050505] relative py-32 md:py-40 px-8 border-y border-white/5">
      <div className="text-center bg-[#050505] inline-block px-12 py-8 border border-white/5 rounded-full backdrop-blur-md mb-20">
        <p className="text-[10px] tracking-[0.4em] text-[#00D084] uppercase font-semibold mb-4">
          Chapter I
        </p>
        <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tighter font-light mb-4">
          The Journey
        </h2>
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#6b7280]">
          The story so far.
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-16 md:gap-12 max-w-6xl w-full">
        <div className="stat-item flex flex-col items-center text-center">
          <span ref={summitsRef} className="text-6xl md:text-7xl lg:text-8xl font-serif text-white mb-4 tracking-tighter font-light">0</span>
          <span className="text-[9px] tracking-[0.3em] text-[#6b7280] uppercase">Summits Completed</span>
        </div>
        
        <div className="stat-item flex flex-col items-center text-center">
          <div className="flex items-baseline gap-2 mb-4">
            <span ref={distanceRef} className="text-6xl md:text-7xl lg:text-8xl font-serif text-white tracking-tighter font-light">0</span>
            <span className="text-xl md:text-2xl font-serif italic text-[#4b5563]">km</span>
          </div>
          <span className="text-[9px] tracking-[0.3em] text-[#6b7280] uppercase">Distance Traversed</span>
        </div>
        
        <div className="stat-item flex flex-col items-center text-center">
          <div className="flex items-baseline gap-2 mb-4">
            <span ref={elevationRef} className="text-6xl md:text-7xl lg:text-8xl font-serif text-white tracking-tighter font-light">0</span>
            <span className="text-xl md:text-2xl font-serif italic text-[#4b5563]">m</span>
          </div>
          <span className="text-[9px] tracking-[0.3em] text-[#6b7280] uppercase">Elevation Gained</span>
        </div>
        
        <div className="stat-item flex flex-col items-center text-center">
          <span ref={dreamsRef} className="text-6xl md:text-7xl lg:text-8xl font-serif text-white mb-4 tracking-tighter font-light">0</span>
          <span className="text-[9px] tracking-[0.3em] text-[#6b7280] uppercase">Dream Expeditions</span>
        </div>
      </div>
    </section>
  );
}
