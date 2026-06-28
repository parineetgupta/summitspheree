"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Expedition } from "@/types";
import { TrophyRoom } from "../3d/TrophyRoom";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function JourneyTrophies({ expeditions }: { expeditions: Expedition[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Derived calculations for trophies
  let highestSummit = { elevation: 0, name: "None" };
  let longestWalk = { distance: 0, name: "None" };
  let totalElevation = 0;
  const uniqueLocations = Array.from(new Set(expeditions.map(e => e.location).filter(Boolean)));

  expeditions.forEach(exp => {
    const el = Number(exp.elevation) || 0;
    const dist = Number(exp.distance) || 0;
    totalElevation += el;
    if (el > highestSummit.elevation) highestSummit = { elevation: el, name: exp.title || "Untitled" };
    if (dist > longestWalk.distance) longestWalk = { distance: dist, name: exp.title || "Untitled" };
  });

  const trophiesData = React.useMemo(() => [
    { id: "highest", title: "Highest Summit", value: highestSummit.elevation, unit: "m", subtitle: highestSummit.name },
    { id: "longest", title: "Longest Expedition", value: longestWalk.distance, unit: "km", subtitle: longestWalk.name },
    { id: "elevation", title: "Greatest Elevation", value: totalElevation, unit: "m", subtitle: "Cumulative Gain" },
    { id: "explorer", title: "Explorer Award", value: uniqueLocations.length, unit: "", subtitle: "Regions Explored" },
    { id: "trail", title: "Trail Master", value: expeditions.length, unit: "", subtitle: "Summits Reached" },
    { id: "pioneer", title: "Pioneer Badge", value: expeditions.length > 5 ? 1 : 0, unit: "", subtitle: expeditions.length > 5 ? "Elite Class" : "In Progress" },
  ], [highestSummit.elevation, highestSummit.name, longestWalk.distance, longestWalk.name, totalElevation, uniqueLocations.length, expeditions.length]);

  const roomRef = useRef<{ setLightIntensity: (val: number) => void }>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Light sweep / SpotLight fade-in
      const lightObj = { intensity: 0 };
      gsap.to(lightObj, {
        intensity: 5,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 50%",
        },
        onUpdate: () => {
          if (roomRef.current) {
            roomRef.current.setLightIntensity(lightObj.intensity);
          }
        }
      });

      // Fade and slide up the text elements overlaying the 3D crystals
      gsap.from(".trophy-text-block", {
        y: 50,
        opacity: 0,
        stagger: 0.15,
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%",
        }
      });
      
      const setupCounter = (selector: string, target: number) => {
        const el = document.querySelector(selector) as HTMLElement;
        if (!el) return;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 3,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 50%",
          },
          onUpdate: () => {
            el.innerText = Math.round(obj.val).toString();
          }
        });
      };

      trophiesData.forEach((t, index) => {
        setupCounter(`.count-val-${index}`, t.value);
      });

    }, containerRef);

    return () => ctx.revert();
  }, [trophiesData]);

  if (expeditions.length === 0) return null;

  return (
    <section ref={containerRef} className="min-h-screen py-40 bg-[#050505] relative z-10 w-full overflow-hidden flex flex-col justify-center">
      
      {/* 3D Exhibition Room (Background) */}
      <TrophyRoom ref={roomRef} trophies={trophiesData} />

      {/* HTML Overlay Content */}
      <div className="relative z-10 pointer-events-none flex flex-col items-center h-full">
        <div className="text-center mb-16">
          <p className="text-[10px] tracking-[0.5em] text-[#6b7280] uppercase mb-8">Hall of Fame</p>
          <h2 className="text-5xl md:text-7xl font-serif text-white tracking-tighter font-light italic">The Trophies</h2>
        </div>

        {/* 
          Grid aligns perfectly with the 3D WebGL cameras columns 
          We use a very specific aspect ratio and padding to match the R3F projection
        */}
        <div className="w-full max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-y-64 gap-x-8 pt-[35vh]">
          {trophiesData.map((trophy, index) => (
            <div key={trophy.id} className="trophy-text-block flex flex-col items-center text-center">
              <p className="text-[9px] tracking-[0.4em] uppercase text-[#00D084] mb-4">{trophy.title}</p>
              <div className="flex items-baseline gap-1 mb-2">
                <h4 className={`count-val-${index} text-4xl font-serif text-white font-light tracking-tighter`}>0</h4>
                {trophy.unit && <span className="text-sm font-serif italic text-[#4b5563]">{trophy.unit}</span>}
              </div>
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#6b7280]">{trophy.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
