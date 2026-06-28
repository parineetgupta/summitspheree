"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ExpeditionMedia } from "@/types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface GalleryItem extends ExpeditionMedia {
  expTitle?: string;
  expLoc?: string;
}

export function JourneyGallery({ galleryMedia }: { galleryMedia: GalleryItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray(".gallery-item");
      items.forEach((item: unknown, i) => {
        const itemEl = item as Element;
        gsap.from(itemEl, {
          y: 100,
          opacity: 0,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [galleryMedia]);

  if (galleryMedia.length === 0) return null;

  return (
    <section ref={containerRef} className="py-40 bg-[#050505] relative z-10 w-full overflow-hidden">
      <div className="text-center mb-32">
        <p className="text-[10px] tracking-[0.5em] text-[#6b7280] uppercase mb-8">Visual Records</p>
        <h2 className="text-5xl md:text-7xl font-serif text-white tracking-tighter font-light italic">The Gallery</h2>
      </div>

      <div className="max-w-[90rem] mx-auto px-8 md:px-16">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {galleryMedia.map((m, idx) => (
            <div key={idx} className="gallery-item relative group overflow-hidden break-inside-avoid bg-[#020202]">
              {m.type === 'image' ? (
                <img src={m.url} alt="Gallery item" className="w-full h-auto object-cover opacity-80 filter grayscale group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" loading="lazy" />
              ) : (
                <video src={m.url} autoPlay muted loop playsInline className="w-full h-auto object-cover opacity-80 filter grayscale group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              )}
              
              {/* Premium Glass Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col justify-end p-8 pointer-events-none">
                <div className="translate-y-8 group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  <p className="text-[9px] tracking-[0.4em] uppercase text-[#00D084] mb-3">{m.expLoc || "Unknown"}</p>
                  <p className="text-3xl font-serif italic text-white leading-tight">{m.expTitle}</p>
                </div>
              </div>
              
              {/* Thin border overlay */}
              <div className="absolute inset-0 border border-white/5 pointer-events-none mix-blend-overlay" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
