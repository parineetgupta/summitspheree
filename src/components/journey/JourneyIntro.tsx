"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RevealText } from "../ui/RevealText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function JourneyIntro() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pin the section while the line draws
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=100%",
          pin: true,
          scrub: true,
        },
      });

      tl.to(lineRef.current, { height: "100%", ease: "none" })
        .to(".intro-content", { opacity: 0, y: -50, ease: "none" }, 0.5);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="h-screen w-full relative flex flex-col items-center justify-center bg-[#050505] overflow-hidden">
      <div className="intro-content flex flex-col items-center z-10 text-center">
        <p className="text-[10px] tracking-[0.5em] text-[#6b7280] uppercase mb-8">Welcome To</p>
        <RevealText 
          text="My Journey" 
          as="h1" 
          className="font-serif text-6xl md:text-8xl lg:text-9xl text-white font-[200] tracking-tight mb-8 leading-none"
        />
        <p className="font-serif italic text-[#a3a3a3] text-lg md:text-2xl tracking-widest font-[300]">
          Every expedition becomes a memory.
        </p>
      </div>

      <div className="absolute top-[65%] bottom-0 w-px flex flex-col items-center justify-start z-0">
        <div ref={lineRef} className="w-full h-0 bg-gradient-to-b from-[#00D084] to-transparent shadow-[0_0_15px_rgba(0,208,132,0.5)] origin-top" />
      </div>
    </section>
  );
}
