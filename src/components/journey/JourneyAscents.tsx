"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Expedition } from "@/types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
  } catch (e) {
    return dateString.toUpperCase();
  }
};

export function JourneyAscents({ expeditions }: { expeditions: Expedition[] }) {
  const containerRef = useRef<HTMLElement>(null);
  const completed = expeditions.filter(e => e.status === 'completed');

  useEffect(() => {
    if (completed.length === 0) return;
    const ctx = gsap.context(() => {
      
      gsap.to(".ascents-timeline-line", {
        height: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        }
      });

      gsap.from(".chapter-title-ii", {
        y: 40,
        opacity: 0,
        duration: 1.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".chapter-title-ii",
          start: "top 80%",
        }
      });

      gsap.utils.toArray(".ascent-chapter").forEach((chapter: any) => {
        gsap.from(chapter, {
          y: 60,
          opacity: 0,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: chapter,
            start: "top 75%",
          }
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, [completed]);

  if (completed.length === 0) {
    return (
      <section className="py-40 bg-[#050505] relative w-full overflow-hidden text-white flex flex-col items-center justify-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full z-0 flex justify-center">
          <div className="w-full bg-gradient-to-b from-[#00D084] via-white/10 to-[#00D084] h-full opacity-20" />
        </div>
        <div className="relative z-10 text-center chapter-title-ii bg-[#050505] px-12 py-8 border border-white/5 rounded-full backdrop-blur-md mb-12">
          <p className="text-[10px] tracking-[0.4em] text-[#00D084] uppercase font-semibold mb-4">Chapter II</p>
          <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tighter font-light mb-4">The Ascents</h2>
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#6b7280]">The mountains already conquered.</p>
        </div>
        <p className="relative z-10 text-[10px] tracking-[0.4em] uppercase text-white/30 text-center max-w-sm leading-relaxed border border-white/5 bg-white/[0.02] p-8 rounded-xl backdrop-blur-sm">
          The archive is waiting.<br/>No completed ascents found yet.
        </p>
      </section>
    );
  }
  return (
    <section ref={containerRef} className="py-40 bg-[#050505] relative w-full overflow-hidden text-white">
      
      {/* Connecting Vertical Timeline */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full z-0 flex justify-center">
        <div className="ascents-timeline-line w-full bg-gradient-to-b from-[#00D084] via-white/10 to-[#00D084] h-0 shadow-[0_0_15px_rgba(0,208,132,0.3)]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 flex flex-col gap-20 md:gap-40">
        
        {/* Chapter Header */}
        <div className="text-center chapter-title-ii bg-[#050505] inline-block px-8 md:px-12 py-6 md:py-8 relative left-1/2 -translate-x-1/2 border border-white/5 rounded-full backdrop-blur-md">
          <p className="text-[10px] tracking-[0.4em] text-[#00D084] uppercase font-semibold mb-3 md:mb-4">
            Chapter II
          </p>
          <h2 className="text-3xl md:text-5xl font-serif text-white tracking-tighter font-light mb-3 md:mb-4">
            The Ascents
          </h2>
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#6b7280]">
            The mountains already conquered.
          </p>
        </div>

        {/* Treks */}
        {completed.map((exp, index) => {
          const mediaImages = (exp.media || []).filter(m => m.type === 'image');
          const coverImage = exp.heroImage || (mediaImages.length > 0 ? mediaImages[0].url : null);
          const isEven = index % 2 === 0; 
          
          return (
            <div key={exp.id} className={`ascent-chapter flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 md:gap-16 lg:gap-32 items-center`}>
              
              {/* Image Block */}
              <div className="w-full lg:w-[45%]">
                <div className="w-full aspect-[4/5] overflow-hidden bg-[#0a0a0a] border border-white/5 relative group">
                  {coverImage ? (
                    <img 
                      src={coverImage} 
                      alt={exp.title}
                      className="w-full h-full object-cover filter brightness-[0.8] contrast-125 hover:scale-105 hover:brightness-100 transition-all duration-1000 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[8px] tracking-[0.4em] uppercase text-white/20">Archive Missing</span>
                    </div>
                  )}
                  {/* Glassmorphic Date Badge */}
                  <div className="absolute top-4 left-4 md:top-6 md:left-6 px-3 md:px-4 py-1.5 md:py-2 bg-black/40 backdrop-blur-md border border-white/10 text-[8px] md:text-[9px] tracking-[0.2em] uppercase text-white/80">
                    {formatDate(exp.date || "")}
                  </div>
                </div>
              </div>

              {/* Editorial Text Block */}
              <div className="w-full lg:w-[45%] flex flex-col items-start bg-[#050505]">
                <h3 className="text-4xl md:text-5xl lg:text-7xl font-serif tracking-tighter italic font-light mb-6 md:mb-8 text-white leading-tight">
                  {exp.title}
                </h3>
                
                <div className="w-full h-px bg-white/10 mb-6 md:mb-8" />
                
                <div className="grid grid-cols-2 gap-x-6 md:gap-x-12 gap-y-4 md:gap-y-6 mb-8 md:mb-12 w-full">
                  <div>
                    <p className="text-[8px] tracking-[0.3em] uppercase text-[#6b7280] mb-2 font-semibold">Location</p>
                    <p className="text-xs font-sans text-white/90 uppercase tracking-widest">{exp.location}</p>
                  </div>
                  <div>
                    <p className="text-[8px] tracking-[0.3em] uppercase text-[#6b7280] mb-2 font-semibold">Elevation</p>
                    <p className="text-xs font-sans text-[#00D084] uppercase tracking-widest">{exp.elevation}m</p>
                  </div>
                  <div>
                    <p className="text-[8px] tracking-[0.3em] uppercase text-[#6b7280] mb-2 font-semibold">Distance</p>
                    <p className="text-xs font-sans text-white/90 uppercase tracking-widest">{exp.distance}km</p>
                  </div>
                  <div>
                    <p className="text-[8px] tracking-[0.3em] uppercase text-[#6b7280] mb-2 font-semibold">Duration</p>
                    <p className="text-xs font-sans text-white/90 uppercase tracking-widest">{exp.duration} Days</p>
                  </div>
                </div>

                <div className="text-[#a3a3a3] text-sm leading-relaxed font-light tracking-wide whitespace-pre-wrap mb-12 line-clamp-4">
                  {exp.journal || "The trail remains silently etched in memory, awaiting its story to be told."}
                </div>
                
                <Link href={`/journey/${exp.id}`}>
                  <button className="flex items-center gap-4 px-8 py-4 border border-white/20 rounded-full hover:bg-white hover:text-black transition-all duration-700 w-fit group">
                    <span className="text-[9px] tracking-[0.3em] uppercase font-bold">Explore Archive</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </button>
                </Link>
              </div>

            </div>
          );
        })}

      </div>
    </section>
  );
}
