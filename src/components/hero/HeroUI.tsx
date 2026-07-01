"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { MoveRight } from "lucide-react";
import { useHeroStore } from "./HeroStore";
import { useRouter } from "next/navigation";

export default function HeroUI() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle scroll-based fade out directly on the DOM node to prevent React re-renders
  useEffect(() => {
    const unsubscribe = useHeroStore.subscribe((state) => {
      if (containerRef.current) {
        const opacity = Math.max(0, 1 - state.scrollProgress * 2);
        containerRef.current.style.opacity = opacity.toString();
        containerRef.current.style.transform = `translateY(-${state.scrollProgress * 150}px)`;
      }
    });
    return unsubscribe;
  }, []);

  // Magnetic button effect
  useEffect(() => {
    const btn = buttonRef.current;
    const txt = textRef.current;

    if (!btn || !txt) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * 0.2,
        y: y * 0.2,
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

  // Initial cinematic animation sequence
  useEffect(() => {
    if (containerRef.current) {
      const tl = gsap.timeline({ delay: 0.2 });

      tl.fromTo(
        ".hero-element",
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: "power2.out",
        }
      ).fromTo(
        ".hero-button",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
        },
        "-=0.4"
      );
    }
  }, []);

  return (
    // True vertical centering (50% viewport height)
    <div className="absolute inset-0 z-10 min-h-screen flex flex-col items-center justify-center pointer-events-none px-4 text-center">
      {/* 100% viewport width constraint on mobile, 60% on desktop */}
      <div ref={containerRef} className="relative flex flex-col items-center w-full">

        {/* Main Title */}
        <h1
          className="hero-element text-center text-[9vw] sm:text-5xl md:text-6xl lg:text-[6rem] 2xl:text-[7rem] font-serif font-medium tracking-widest text-white drop-shadow-lg opacity-0 leading-tight whitespace-nowrap pl-[0.1em]"
          style={{ marginBottom: '56px' }}
        >
          SUMMITSPHERE
        </h1>
          
        {/* Subtitle */}
        <h2
          className="hero-element text-xl sm:text-2xl md:text-4xl font-serif italic text-white/60 drop-shadow-md opacity-0"
          style={{ marginBottom: '24px' }}
        >
          Every summit becomes a story.
        </h2>

        {/* Description / Sub-Subtitle */}
        <p
          className="hero-element text-xs sm:text-sm md:text-base tracking-wide font-sans text-white/50 opacity-0 px-4"
          style={{ marginBottom: '24px' }}
        >
          A private archive of mountains, memories and milestones.
        </p>

        {/* Navigation / Chapters */}
        <p
          className="hero-element text-[8px] sm:text-[9px] md:text-[10px] tracking-[2px] md:tracking-[4px] uppercase font-semibold text-[#00D084] opacity-0 flex flex-wrap justify-center gap-y-2 px-2"
          style={{ marginBottom: '0px' }}
        >
          ✦ CHAPTERS &nbsp;•&nbsp; ATLAS &nbsp;•&nbsp; EXPEDITIONS &nbsp;•&nbsp; MEMORIES ✦
        </p>

        {/* Primary CTA Button */}
        <div className="hero-button opacity-0 mt-8">
          <button
            ref={buttonRef}
            onClick={() => router.push("/login")}
            className="pointer-events-auto relative overflow-hidden group rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-12 py-5 transition-all duration-500 hover:bg-white/20 hover:border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:-translate-y-1"
          >
            <span
              ref={textRef}
              className="relative z-10 flex items-center gap-4 text-[11px] tracking-[0.2em] uppercase font-bold text-white transition-colors"
            >
              Begin Your Journey
              <MoveRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-2" />
            </span>
            {/* Subtle inner shine */}
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-[#00D084]/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_2s_infinite]" />
          </button>
        </div>

        {/* Secondary Text Link */}
        <div className="hero-button opacity-0 mt-8">
          <a href="/journey" className="text-[10px] font-sans tracking-[0.2em] uppercase text-[#B8B8B8] hover:text-[#00D084] transition-colors border-b border-transparent hover:border-[#00D084] pb-1">
            Explore Expeditions
          </a>
        </div>
      </div>
    </div>
  );
}
