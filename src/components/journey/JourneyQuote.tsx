"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function JourneyQuote() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(textRef.current, {
        opacity: 0,
        y: 15,
        duration: 2.5,
        ease: "power1.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef} 
      className="py-32 w-full flex items-center justify-center bg-[#050505] relative z-10 select-none overflow-hidden"
    >
      <div 
        ref={textRef} 
        className="text-center px-8 max-w-4xl"
      >
        <p className="font-serif italic text-3xl md:text-5xl lg:text-6xl text-white/80 font-light tracking-tight leading-snug">
          "The mountains remain.<br/>Only the memories return."
        </p>
      </div>
    </section>
  );
}
