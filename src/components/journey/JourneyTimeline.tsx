"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Expedition } from "@/types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const formatMonthYear = (dateStr: string) => {
  if (!dateStr) return "UNKNOWN DATE";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
  } catch (e) {
    return dateStr.toUpperCase();
  }
};

export function JourneyTimeline({ expeditions }: { expeditions: Expedition[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Draw the central line
      gsap.fromTo(".timeline-line", 
        { height: "0%" },
        { 
          height: "100%", 
          ease: "none", 
          scrollTrigger: { 
            trigger: ".timeline-wrapper", 
            start: "top center", 
            end: "bottom center", 
            scrub: true 
          } 
        }
      );
      
      const nodes = gsap.utils.toArray(".timeline-node");
      nodes.forEach((node: unknown) => {
        const nodeEl = node as Element;
        const isLeft = nodeEl.classList.contains("left-side");
        
        // Fade in the text content
        gsap.from(nodeEl.querySelector(".timeline-content"), {
          x: isLeft ? -50 : 50,
          opacity: 0,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: { 
            trigger: nodeEl, 
            start: "top 75%" 
          }
        });
        
        // Glow the dot when it passes the center of the screen
        gsap.to(nodeEl.querySelector(".dot"), {
          scale: 1.5,
          backgroundColor: "#00D084",
          boxShadow: "0 0 20px 2px rgba(0, 208, 132, 0.6)",
          scrollTrigger: {
            trigger: nodeEl,
            start: "top 50%",
            end: "bottom 50%",
            toggleActions: "play reverse play reverse"
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [expeditions]);

  if (expeditions.length === 0) return null;

  return (
    <section ref={containerRef} className="py-40 bg-[#050505] relative z-10 w-full overflow-hidden">
      <div className="text-center mb-40">
        <p className="text-[10px] tracking-[0.5em] text-[#6b7280] uppercase mb-8">History</p>
        <h2 className="text-5xl md:text-7xl font-serif text-white tracking-tighter font-light italic">The Timeline</h2>
      </div>

      <div className="timeline-wrapper relative max-w-5xl mx-auto">
        {/* Faint Background Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/5 -translate-x-1/2" />
        
        {/* Animated Fill Line */}
        <div className="timeline-line absolute left-1/2 top-0 w-px bg-[#00D084]/50 -translate-x-1/2 origin-top shadow-[0_0_10px_rgba(0,208,132,0.3)]" />
        
        <div className="space-y-48 relative pt-20 pb-20">
          {expeditions.map((exp, index) => {
            const isLeft = index % 2 === 0;
            return (
              <div key={exp.id} className={`timeline-node ${isLeft ? 'left-side' : 'right-side'} flex w-full relative items-center`}>
                
                <div className={`timeline-content w-1/2 ${isLeft ? 'pr-16 text-right' : 'order-2 pl-16 text-left'}`}>
                  <p className="text-[10px] tracking-[0.4em] uppercase text-[#6b7280] mb-3">{formatMonthYear(exp.date || "")}</p>
                  <h4 className="text-4xl font-serif italic text-white tracking-tight mb-2">{exp.title}</h4>
                  <p className="text-sm font-serif italic text-[#4b5563]">{exp.location}</p>
                </div>
                
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="dot w-2 h-2 rounded-full bg-[#333333] transition-all duration-300" />
                </div>
                
                <div className={`w-1/2 ${isLeft ? 'order-2' : ''}`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
