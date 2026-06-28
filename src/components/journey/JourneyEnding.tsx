"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function JourneyEnding() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade out into darkness as we reach the very bottom
      gsap.to(containerRef.current, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "center center",
          end: "bottom center",
          scrub: true,
        }
      });
      
      // Fade in the text initially when it comes into view
      gsap.from(".ending-text", {
        y: 100,
        opacity: 0,
        duration: 2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="h-screen w-full relative flex flex-col items-center justify-center bg-[#050505] overflow-hidden">
      <div className="ending-text text-center flex flex-col items-center z-10">
        <h2 className="text-7xl md:text-[10rem] font-serif text-white tracking-tighter font-light italic mb-12">
          Keep Climbing.
        </h2>
        <p className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-[#6b7280]">
          The summit is only halfway there.
        </p>
      </div>
      
      {/* Subtle bottom gradient to pure black */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
}
