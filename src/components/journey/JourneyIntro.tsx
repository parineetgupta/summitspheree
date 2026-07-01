"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface JourneyIntroProps {
  onShareClick?: () => void;
  isOwner?: boolean;
  isPublic?: boolean;
  onToggleVisibility?: () => void;
}

export function JourneyIntro({
  onShareClick,
  isOwner = false,
  isPublic = true,
  onToggleVisibility
}: JourneyIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in main text
      gsap.from(".hero-element", {
        y: 40,
        opacity: 0,
        duration: 2,
        ease: "power3.out",
        stagger: 0.2,
      });

      // Vertical line descends on scroll
      gsap.to(".timeline-line", {
        height: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        }
      });
      
      // Fade out content on scroll
      gsap.to(".hero-content", {
        y: -100,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="h-screen w-full flex flex-col items-center justify-center bg-[#050505] relative z-10 overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        {/* Cinematic Light Beams */}
        <div className="absolute top-[-10%] left-[20%] w-[1px] h-[150%] bg-white/20 transform rotate-12 blur-[2px]" />
        <div className="absolute top-[-20%] right-[30%] w-[2px] h-[150%] bg-[#00D084]/20 transform -rotate-12 blur-[4px]" />
        
        {/* Subtle Fog */}
        <div className="absolute bottom-0 w-full h-[60vh] bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
        
        {/* Abstract Mountain Wireframe SVG */}
        <svg className="absolute bottom-10 left-0 w-full h-[40vh] opacity-10" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path d="M0 100 L20 60 L40 80 L60 30 L80 70 L100 40 L100 100 Z" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-[#00D084]" />
          <path d="M0 100 L30 50 L50 90 L70 20 L90 80 L100 60 L100 100 Z" fill="none" stroke="currentColor" strokeWidth="0.1" className="text-white" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="hero-content relative z-20 flex flex-col items-center text-center px-4 w-full max-w-4xl">
        <h1 className="hero-element text-6xl md:text-8xl lg:text-[140px] font-serif text-white tracking-tighter font-light leading-none mb-12 uppercase mix-blend-difference">
          Relive<br />
          <span className="italic opacity-90">The Journey</span>
        </h1>
        
        <p className="hero-element text-[10px] md:text-xs tracking-[0.4em] text-[#888888] uppercase font-sans max-w-md leading-relaxed">
          Every summit leaves a memory.<br/>
          Every memory becomes an archive.
        </p>

        {onShareClick && (
          <div className="hero-element mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-50">
            <button 
              onClick={onShareClick} 
              className="px-8 py-3 border border-white/20 hover:border-white rounded-full text-[9px] tracking-[0.4em] uppercase font-bold text-white/80 hover:text-white transition-all duration-700 flex items-center gap-2"
            >
              <span>🔗</span> Share Journey
            </button>
            
            {isOwner && onToggleVisibility && (
              <button 
                onClick={onToggleVisibility} 
                className="px-5 py-3 border border-white/10 hover:border-[#00D084]/40 bg-white/[0.02] hover:bg-[#00D084]/5 rounded-full text-[9px] tracking-[0.4em] uppercase font-bold transition-all duration-700 flex items-center gap-2 text-white/60 hover:text-[#00D084]"
              >
                {isPublic ? (
                  <>
                    <span className="text-[#00D084]">🌍</span> Public Journey
                  </>
                ) : (
                  <>
                    <span className="text-amber-500">🔒</span> Private Journey
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* The Connecting Vertical Timeline */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-[30vh] flex flex-col items-center justify-end z-30">
        {/* The line that grows */}
        <div className="timeline-line w-full bg-gradient-to-b from-transparent via-[#00D084] to-[#00D084] h-0 shadow-[0_0_15px_rgba(0,208,132,0.6)]" />
      </div>

    </section>
  );
}
