"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { Expedition } from "@/types";
import { Pencil } from "lucide-react";

export function HubHero({ expedition, isOwner = false }: { expedition: Expedition, isOwner?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const coverImage = expedition.heroImage || (expedition.media?.find(m => m.type === 'image')?.url) || "";

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-element", {
        y: 30,
        opacity: 0,
        duration: 2,
        stagger: 0.3,
        ease: "power3.out",
        delay: 0.5 // Wait for the black screen transition to clear
      });
      
      // Subtle scale animation on the background image
      gsap.to(".hero-bg", {
        scale: 1.05,
        duration: 20,
        ease: "none",
        repeat: -1,
        yoyo: true
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <section ref={containerRef} id="hub-hero" className="relative h-screen w-full overflow-hidden bg-[#050505] flex items-center justify-center">
      {/* Background Image */}
      {coverImage && (
        <div className="absolute inset-0 w-full h-full">
          <img 
            src={coverImage} 
            alt="Hero Background" 
            className="hero-bg absolute inset-0 w-full h-full object-cover opacity-60 filter grayscale" 
          />
          {/* Dark Premium Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-[#050505]/40" />
        </div>
      )}

      {/* Owner Edit Button */}
      {isOwner && (
        <button className="absolute top-24 right-8 z-50 p-4 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-full transition-colors text-white/50 hover:text-[#00D084]">
          <Pencil className="w-5 h-5" />
        </button>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 mt-20">
        <h1 className="hero-element text-5xl md:text-8xl lg:text-9xl font-serif italic text-white tracking-tighter font-light mb-8 uppercase">
          {expedition.mountain || expedition.title}
        </h1>
        
        <p className="hero-element text-[10px] md:text-xs tracking-[0.4em] uppercase text-[#00D084] font-semibold mb-2">
          {expedition.location}
        </p>
        
        <p className="hero-element text-sm font-serif italic text-white/70 mb-12">
          Completed on: <br className="md:hidden" />
          <span className="text-white ml-2">{formatDate(expedition.date)}</span>
        </p>
        
        <div className="hero-element max-w-2xl text-center">
          <p className="text-[#a3a3a3] text-sm leading-relaxed font-light tracking-wide whitespace-pre-wrap">
            {expedition.journal?.slice(0, 150)}{expedition.journal?.length > 150 ? '...' : ''}
          </p>
        </div>
      </div>
    </section>
  );
}
