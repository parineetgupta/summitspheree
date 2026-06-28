"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { MoveRight } from "lucide-react";
import { useHeroStore } from "./HeroStore";

export default function HeroUI() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle scroll-based fade out directly on the DOM node to prevent React re-renders
  useEffect(() => {
    const unsubscribe = useHeroStore.subscribe((state) => {
      if (containerRef.current) {
        // Fade out entirely by 50% scroll
        const opacity = Math.max(0, 1 - state.scrollProgress * 2);
        containerRef.current.style.opacity = opacity.toString();
        containerRef.current.style.transform = `translateY(-${state.scrollProgress * 100}px)`;
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const btn = buttonRef.current;
    const txt = textRef.current;

    if (!btn || !txt) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.6,
        ease: "power2.out",
      });
      gsap.to(txt, {
        x: x * 0.1,
        y: y * 0.1,
        duration: 0.6,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 1,
        ease: "elastic.out(1, 0.3)",
      });
      gsap.to(txt, {
        x: 0,
        y: 0,
        duration: 1,
        ease: "elastic.out(1, 0.3)",
      });
    };

    btn.addEventListener("mousemove", handleMouseMove);
    btn.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      btn.removeEventListener("mousemove", handleMouseMove);
      btn.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Initial animation
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          stagger: 0.2,
          ease: "power3.out",
          delay: 0.5,
        }
      );
    }
  }, []);

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-4 text-center">
      <div ref={containerRef} className="flex flex-col items-center transition-opacity duration-75">
        {/* Main Title */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase mb-4 text-white drop-shadow-2xl opacity-0">
          SummitSphere
        </h1>
        
        {/* Subtitle */}
        <h2 className="text-xl md:text-3xl font-light tracking-[0.2em] uppercase mb-12 text-gray-200 opacity-0">
          Every Summit Has a Story.
        </h2>
        
        {/* Supporting text */}
        <div className="flex flex-col gap-2 mb-16 text-sm md:text-base font-light tracking-widest uppercase text-gray-400 opacity-0">
          <p>Document every climb.</p>
          <p>Relive every expedition.</p>
          <p>Preserve every memory.</p>
        </div>

        {/* Button */}
        <div className="opacity-0">
          <button
            ref={buttonRef}
            onClick={() => {
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth"
              });
            }}
            className="pointer-events-auto relative overflow-hidden group rounded-full border border-white/20 bg-white/5 backdrop-blur-md px-10 py-5 transition-colors hover:bg-white/10 hover:border-white/40"
          >
            <span
              ref={textRef}
              className="relative z-10 flex items-center gap-3 text-sm tracking-[0.2em] uppercase font-bold text-white"
            >
              Begin Expedition
              <MoveRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
            </span>
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_2s_infinite]" />
          </button>
        </div>
      </div>
    </div>
  );
}
