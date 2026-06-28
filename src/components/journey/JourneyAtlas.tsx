"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Expedition } from "@/types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function JourneyAtlas({ expeditions }: { expeditions: Expedition[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Extract unique locations
  const uniqueLocations = Array.from(new Set(expeditions.map(e => e.location).filter(Boolean)));

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in the atlas container
      gsap.from(".atlas-container", {
        opacity: 0,
        y: 50,
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        }
      });

      // Subtle slow scale (camera movement effect)
      gsap.to(".atlas-grid", {
        scale: 1.1,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        }
      });

      // Pop markers in
      gsap.from(".atlas-marker", {
        scale: 0,
        opacity: 0,
        stagger: 0.1,
        ease: "back.out(1.5)",
        scrollTrigger: {
          trigger: ".atlas-container",
          start: "top 60%",
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [expeditions]);

  if (uniqueLocations.length === 0) return null;

  return (
    <section ref={containerRef} className="py-40 bg-[#050505] relative z-10 w-full overflow-hidden flex flex-col items-center">
      <div className="text-center mb-24 z-20">
        <p className="text-[10px] tracking-[0.5em] text-[#6b7280] uppercase mb-8">The Regions</p>
        <h2 className="text-5xl md:text-7xl font-serif text-white tracking-tighter font-light italic">The Atlas</h2>
      </div>

      <div className="atlas-container relative w-full max-w-7xl aspect-[21/9] md:aspect-[2.5/1] bg-[#020202] overflow-hidden flex items-center justify-center">
        {/* Dark terrain grid simulation */}
        <div className="atlas-grid absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050505_80%)] z-0" />
        
        <div className="relative w-full h-full flex items-center justify-center p-12 z-10">
          <div className="flex flex-wrap justify-center gap-12 relative">
            {uniqueLocations.map((loc, idx) => {
              const matchedExp = expeditions.find(e => e.location === loc);
              return (
                <div key={idx} className="atlas-marker relative group cursor-crosshair flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-[#00D084] shadow-[0_0_15px_rgba(0,208,132,0.8)] z-10 transition-transform duration-500 group-hover:scale-150" />
                  
                  {/* Subtle Pulse */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-[#00D084]/20 rounded-full scale-50 opacity-0 group-hover:opacity-100 group-hover:scale-150 group-hover:border-[#00D084]/50 transition-all duration-700 pointer-events-none" />
                  
                  {/* Stealth UI Tooltip */}
                  <div className="absolute top-8 opacity-0 group-hover:opacity-100 -translate-y-4 group-hover:translate-y-0 transition-all duration-500 flex flex-col items-center pointer-events-none min-w-[200px]">
                    <div className="h-4 w-px bg-white/20 mb-2" />
                    <div className="bg-[#0a0a0a] border border-white/10 px-6 py-4 backdrop-blur-md flex flex-col items-center text-center">
                      <span className="text-[8px] tracking-[0.3em] uppercase text-[#00D084] mb-2">{loc}</span>
                      <span className="text-xl font-serif text-white italic mb-4">{matchedExp?.title || 'Unknown Peak'}</span>
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <span className="text-[7px] tracking-widest text-[#4b5563] uppercase">Dist</span>
                          <span className="text-xs font-serif text-[#d1d5db] italic">{matchedExp?.distance || '--'}km</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[7px] tracking-widest text-[#4b5563] uppercase">Elev</span>
                          <span className="text-xs font-serif text-[#d1d5db] italic">{matchedExp?.elevation || '--'}m</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
