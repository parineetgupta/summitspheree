"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Expedition } from "@/types";
import { Mountain, Footprints, Globe } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function JourneyAchievements({ expeditions }: { expeditions: Expedition[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const completed = expeditions.filter(e => e.status === "completed");

  let highestSummit = { elevation: 0, title: "None", date: "" };
  let longestWalk = { distance: 0, title: "None", date: "" };
  const uniqueLocations = Array.from(new Set(completed.map(e => e.region || e.location).filter(Boolean)));
  
  completed.forEach(exp => {
    const el = Number(exp.elevation) || 0;
    const dist = Number(exp.distance) || 0;
    if (el > highestSummit.elevation) highestSummit = { elevation: el, title: exp.title || "Untitled", date: exp.date };
    if (dist > longestWalk.distance) longestWalk = { distance: dist, title: exp.title || "Untitled", date: exp.date };
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".achievement-card", {
        y: 100,
        opacity: 0,
        stagger: 0.2,
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%",
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, [completed]);

  if (completed.length === 0) {
    return (
      <section className="py-40 bg-[#050505] relative w-full overflow-hidden text-white flex flex-col items-center justify-center border-y border-white/5">
        <Mountain className="w-16 h-16 text-white/5 mb-6" />
        <p className="text-[10px] tracking-[0.4em] uppercase text-white/20">Awaiting your first summit</p>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="py-40 bg-[#050505] relative w-full overflow-hidden text-white flex flex-col items-center justify-center border-y border-white/5">
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.02] via-[#050505] to-[#050505] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8">
        
        <div className="flex justify-center w-full mb-24">
          <div className="text-center bg-[#050505] inline-block px-12 py-8 border border-white/5 rounded-full backdrop-blur-md">
            <p className="text-[10px] tracking-[0.4em] text-[#00D084] uppercase font-semibold mb-4">
              Chapter IV
            </p>
            <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tighter font-light mb-4">
              Achievements
            </h2>
            <p className="text-[9px] tracking-[0.2em] uppercase text-[#6b7280]">
              Signature Milestones.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Highest Summit */}
          <div className="achievement-card bg-white/[0.02] border border-white/10 rounded-2xl p-10 flex flex-col items-center text-center backdrop-blur-sm group hover:border-[#00D084]/50 transition-colors duration-500">
            <Mountain className="w-12 h-12 text-[#00D084] mb-8 opacity-70 group-hover:opacity-100 transition-opacity" strokeWidth={1} />
            <h3 className="text-2xl font-serif italic text-white tracking-wide mb-2">Highest Summit</h3>
            <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 mb-8">{highestSummit.title}</p>
            <div className="mt-auto flex items-baseline gap-2">
              <span className="text-5xl font-serif text-white font-light">{highestSummit.elevation}</span>
              <span className="text-sm font-serif italic text-white/40">m</span>
            </div>
          </div>

          {/* Long Walk */}
          <div className="achievement-card bg-white/[0.02] border border-white/10 rounded-2xl p-10 flex flex-col items-center text-center backdrop-blur-sm group hover:border-[#00D084]/50 transition-colors duration-500">
            <Footprints className="w-12 h-12 text-[#00D084] mb-8 opacity-70 group-hover:opacity-100 transition-opacity" strokeWidth={1} />
            <h3 className="text-2xl font-serif italic text-white tracking-wide mb-2">Longest Expedition</h3>
            <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 mb-8">{longestWalk.title}</p>
            <div className="mt-auto flex items-baseline gap-2">
              <span className="text-5xl font-serif text-white font-light">{longestWalk.distance}</span>
              <span className="text-sm font-serif italic text-white/40">km</span>
            </div>
          </div>

          {/* The Explorer */}
          <div className="achievement-card bg-white/[0.02] border border-white/10 rounded-2xl p-10 flex flex-col items-center text-center backdrop-blur-sm group hover:border-[#00D084]/50 transition-colors duration-500">
            <Globe className="w-12 h-12 text-[#00D084] mb-8 opacity-70 group-hover:opacity-100 transition-opacity" strokeWidth={1} />
            <h3 className="text-2xl font-serif italic text-white tracking-wide mb-2">The Explorer</h3>
            <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 mb-8">Distinct Regions</p>
            <div className="mt-auto flex items-baseline gap-2">
              <span className="text-5xl font-serif text-white font-light">{uniqueLocations.length}</span>
              <span className="text-sm font-serif italic text-white/40">regions</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
