"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Expedition } from "@/types";
import { Compass } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const formatDate = (dateString: string) => {
  if (!dateString) return "TBD";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
  } catch (e) {
    return dateString.toUpperCase();
  }
};

export function JourneyAtlas({ expeditions }: { expeditions: Expedition[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // LOGGING: Requested by user to track down filtering issues
  console.log("JourneyAtlas - All Expeditions Received:", expeditions.length);
  
  const futureTreks = expeditions.filter(e => e.status === 'future');
  
  console.log("JourneyAtlas - Future Treks after filter:", futureTreks.length);
  console.log("JourneyAtlas - Future Treks data:", futureTreks);

  useEffect(() => {
    if (futureTreks.length === 0) return;
    const ctx = gsap.context(() => {
      
      gsap.to(".atlas-timeline-line", {
        height: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        }
      });

      gsap.from(".chapter-title-iii", {
        y: 40,
        opacity: 0,
        duration: 1.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".chapter-title-iii",
          start: "top 80%",
        }
      });
      
    }, containerRef);
    return () => ctx.revert();
  }, [futureTreks]);

  return (
    <section ref={containerRef} className="py-40 bg-[#050505] relative w-full text-white overflow-hidden">
      
      {/* Connecting Vertical Timeline */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full z-0 flex justify-center">
        <div className="atlas-timeline-line w-full bg-gradient-to-b from-[#00D084] via-white/10 to-[#00D084] h-0 shadow-[0_0_15px_rgba(0,208,132,0.3)]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-8 relative z-10 flex flex-col gap-20 md:gap-32">
        
        {/* Chapter Header */}
        <div className="text-center chapter-title-iii bg-[#050505] inline-block px-8 md:px-12 py-6 md:py-8 relative left-1/2 -translate-x-1/2 border border-white/5 rounded-full backdrop-blur-md">
          <p className="text-[10px] tracking-[0.4em] text-[#00D084] uppercase font-semibold mb-3 md:mb-4">
            Chapter III
          </p>
          <h2 className="text-3xl md:text-5xl font-serif text-white tracking-tighter font-light mb-3 md:mb-4">
            The Atlas
          </h2>
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#6b7280]">
            The adventures that still call from the horizon.
          </p>
        </div>

        <div className="atlas-grid grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative z-10">
          {futureTreks.length === 0 ? (
            <div className="col-span-full py-12 text-center border border-white/10 bg-white/5 backdrop-blur-md">
              <p className="text-[10px] tracking-[0.4em] uppercase text-white/50">No Future Tracks Available</p>
              <p className="text-xs text-white/30 mt-2 font-light">Add a Future Track in the Admin Panel to see it here.</p>
            </div>
          ) : (
            futureTreks.map((trek) => {
              const mediaImages = (trek.media || []).filter(m => m.type === 'image');
              const coverImage = trek.heroImage || (mediaImages.length > 0 ? mediaImages[0].url : null);
              
              return (
                <div key={trek.id} className="atlas-card group flex flex-col justify-between p-8 md:p-12 bg-white/[0.01] border border-white/5 hover:border-white/20 transition-all duration-700 relative overflow-hidden backdrop-blur-sm">
                  
                  {/* Background Image & Overlay */}
                  <div className="absolute inset-0 z-0">
                    {coverImage ? (
                      <img 
                        src={coverImage} 
                        alt={trek.title || trek.mountain || "Peak"} 
                        className="w-full h-full object-cover opacity-10 filter grayscale brightness-[0.5] group-hover:opacity-40 group-hover:grayscale-[0.5] group-hover:scale-105 transition-all duration-1000 ease-out"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#00D084]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    )}
                    <div className="absolute inset-0 bg-[#050505]/60 z-10" />
                  </div>
                  
                  <div className="relative z-20 mb-16">
                    <div className="flex items-center justify-between mb-8">
                      <Compass className="w-6 h-6 text-[#00D084]/40 group-hover:text-[#00D084]/80 transition-colors duration-700 group-hover:rotate-45" />
                      <span className="text-[8px] tracking-[0.3em] uppercase text-[#00D084] border border-[#00D084]/20 px-3 py-1 rounded-full bg-[#00D084]/5">
                        Planned
                      </span>
                    </div>
                  
                  <h3 className="text-4xl font-serif tracking-tighter italic font-light text-white mb-2">
                    {trek.title || trek.mountain || "Unknown Peak"}
                  </h3>
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#6b7280] mb-8">
                    {trek.location || "Unknown Location"}
                  </p>
                  
                  <div className="w-full h-px bg-white/5 mb-8" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[8px] tracking-[0.3em] uppercase text-[#1e3a8a] mb-1 font-semibold">Target Date</p>
                      <p className="text-[10px] tracking-widest text-white/80">{formatDate(trek.date || "")}</p>
                    </div>
                    <div>
                      <p className="text-[8px] tracking-[0.3em] uppercase text-[#1e3a8a] mb-1 font-semibold">Target Elevation</p>
                      <p className="text-[10px] tracking-widest text-white/80">{trek.elevation ? `${trek.elevation}m` : "TBD"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="relative z-20">
                  <p className="text-[8px] tracking-[0.3em] uppercase text-[#1e3a8a] mb-3 font-semibold">Field Notes</p>
                  <p className="text-xs text-[#888888] font-light leading-relaxed italic border-l border-white/10 pl-4">
                    {trek.journal || "Preparations and routing are underway. Awaiting conditions."}
                  </p>
                </div>
  
              </div>
            );
          })
          )}
        </div>

      </div>
    </section>
  );
}
