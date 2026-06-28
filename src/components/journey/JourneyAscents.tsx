"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Expedition } from "@/types";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const formatMonthYear = (dateStr: string) => {
  if (!dateStr) return "UNKNOWN DATE";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
  } catch (e) {
    return dateStr.toUpperCase();
  }
};

const romanize = (num: number) => {
  const lookup: { [key: string]: number } = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
  let roman = '';
  for (let i in lookup ) {
    while ( num >= lookup[i] ) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman || "0";
};

export function JourneyAscents({ expeditions }: { expeditions: Expedition[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const ascents = gsap.utils.toArray(".ascent-chapter");
      
      ascents.forEach((ascent: unknown) => {
        const ascentEl = ascent as Element;
        // Fade up the text block
        const textBlock = ascentEl.querySelector(".ascent-text");
        if (textBlock) {
          gsap.from(textBlock, {
            y: 100,
            opacity: 0,
            duration: 1.5,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ascent,
              start: "top 75%",
            }
          });
        }

        // Parallax the image mask
        const imgBlock = ascent.querySelector(".ascent-media");
        const img = ascent.querySelector(".ascent-img");
        if (imgBlock && img) {
          gsap.from(imgBlock, {
            clipPath: "inset(100% 0% 0% 0%)",
            duration: 1.5,
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: ascent,
              start: "top 75%",
            }
          });
          
          gsap.fromTo(img, 
            { yPercent: -15, scale: 1.1 },
            { yPercent: 15, scale: 1.1, ease: "none", scrollTrigger: { trigger: ascent, start: "top bottom", end: "bottom top", scrub: true } }
          );
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [expeditions]);

  return (
    <section ref={containerRef} className="py-40 bg-[#050505] relative z-10 w-full overflow-hidden">
      <div className="max-w-[90rem] mx-auto px-8 md:px-16 flex flex-col gap-64">
        {expeditions.map((exp, index) => {
          const isLeft = index % 2 === 0;
          return (
            <article key={exp.id} className={`ascent-chapter flex flex-col ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-16 lg:gap-32 w-full`}>
              
              {/* Text Content */}
              <div className={`ascent-text w-full lg:w-5/12 flex flex-col ${isLeft ? 'items-start text-left' : 'items-end text-right'}`}>
                <p className="text-[10px] tracking-[0.4em] uppercase text-[#6b7280] mb-4">
                  Chapter {romanize(index + 1)}
                </p>
                <h2 className="text-6xl md:text-8xl font-serif text-white tracking-tighter mb-4 font-light italic leading-none">
                  {exp.title}
                </h2>
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#4b5563] mb-16">
                  {formatMonthYear(exp.date || "")}
                </p>
                
                <div className={`grid grid-cols-2 gap-y-12 gap-x-12 w-full max-w-sm ${isLeft ? '' : 'text-right'}`}>
                  <div className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'}`}>
                    <span className="text-[8px] tracking-[0.3em] uppercase text-[#4b5563] mb-2">Elevation</span>
                    <span className="text-xl font-serif text-[#d1d5db] italic">{exp.elevation ? `${exp.elevation}m` : '--'}</span>
                  </div>
                  <div className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'}`}>
                    <span className="text-[8px] tracking-[0.3em] uppercase text-[#4b5563] mb-2">Distance</span>
                    <span className="text-xl font-serif text-[#d1d5db] italic">{exp.distance ? `${exp.distance}km` : '--'}</span>
                  </div>
                  <div className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'}`}>
                    <span className="text-[8px] tracking-[0.3em] uppercase text-[#4b5563] mb-2">Region</span>
                    <span className="text-xl font-serif text-[#d1d5db] italic line-clamp-1">{exp.location || 'Unknown'}</span>
                  </div>
                  <div className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'}`}>
                    <span className="text-[8px] tracking-[0.3em] uppercase text-[#4b5563] mb-2">Duration</span>
                    <span className="text-xl font-serif text-[#d1d5db] italic">{exp.duration ? `${exp.duration} days` : '--'}</span>
                  </div>
                </div>

                <div className="mt-16">
                  <Link href={`/journey/${exp.id}`} className="group flex items-center gap-4">
                    <span className="text-[9px] tracking-[0.3em] uppercase text-white/50 transition-colors duration-500 group-hover:text-white">
                      Relive Expedition
                    </span>
                    <div className={`h-px w-12 bg-white/20 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-24 group-hover:bg-white ${isLeft ? 'origin-left' : 'origin-right'}`} />
                  </Link>
                </div>
              </div>

              {/* Media Gallery / Cover */}
              <div className="ascent-media w-full lg:w-7/12 aspect-[3/4] lg:aspect-[4/5] relative overflow-hidden bg-[#020202]">
                {exp.heroImage ? (
                  <img src={exp.heroImage} alt={exp.title} className="ascent-img absolute inset-0 w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-[2s] ease-out" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center border border-white/5 p-12">
                    <span className="text-2xl font-serif italic text-[#333333]">No visual records.</span>
                  </div>
                )}
                {/* Thin elegant border overlay */}
                <div className="absolute inset-0 border border-white/5 pointer-events-none mix-blend-overlay" />
              </div>

            </article>
          );
        })}
      </div>
    </section>
  );
}
