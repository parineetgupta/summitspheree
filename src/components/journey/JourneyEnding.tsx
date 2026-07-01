"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface JourneyEndingProps {
  showCTA?: boolean;
}

export function JourneyEnding({ showCTA = false }: JourneyEndingProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in text
      gsap.from(".ending-text", {
        y: 30,
        opacity: 0,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        }
      });

      // Only fade to black at the very bottom if we are NOT showing the CTA
      if (!showCTA) {
        gsap.to(containerRef.current, {
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "center center",
            end: "bottom bottom",
            scrub: true,
          }
        });
      }
    }, containerRef);
    return () => ctx.revert();
  }, [showCTA]);

  return (
    <section ref={containerRef} className="h-screen w-full flex flex-col items-center justify-center bg-[#050505] relative z-10 border-t border-[#111111] px-6">
      <div className="text-center ending-text flex flex-col items-center max-w-xl">
        <div className="w-px h-16 bg-gradient-to-t from-[#00D084]/50 to-transparent mb-10" />
        
        <h2 className="text-5xl md:text-8xl font-serif text-white tracking-tighter font-light italic mb-6">
          Keep Climbing.
        </h2>
        
        <p className="text-[9px] tracking-[0.4em] text-[#6b7280] uppercase mb-12">
          The summit is just the beginning
        </p>

        {showCTA && (
          <div className="mt-4 pt-10 border-t border-white/5 w-full flex flex-col items-center gap-6">
            <p className="text-white/60 font-serif italic text-sm md:text-base tracking-wide">
              Inspired to start your own adventure archive?
            </p>
            <Link href="/login">
              <button className="group px-8 py-3.5 bg-[#00D084] hover:bg-[#00e691] text-black font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-500 rounded-full shadow-[0_0_30px_rgba(0,208,132,0.15)] hover:shadow-[0_0_40px_rgba(0,208,132,0.3)] flex items-center gap-2">
                <span>Start Your Own Journey</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
