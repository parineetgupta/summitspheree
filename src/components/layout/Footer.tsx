"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(textRef.current, {
        opacity: 0,
        y: 20,
        duration: 2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 95%",
        }
      });
    }, footerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="w-full py-12 md:py-16 flex justify-center items-center relative z-20 bg-[#050505] border-t border-white/5 mt-auto">
      <p ref={textRef} className="text-[9px] md:text-[10px] font-sans tracking-[0.4em] uppercase text-white/60 font-medium">
        Crafted by Parineet Gupta
      </p>
    </footer>
  );
}
