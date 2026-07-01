"use client";

import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Expedition } from "@/types";
import { updateExpedition } from "@/firebase/db";
import { Pencil, X, Save } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function HubOverview({ expedition, isOwner = false, onUpdate }: { expedition: Expedition, isOwner?: boolean, onUpdate?: (data: Partial<Expedition>) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elevationRef = useRef<HTMLSpanElement>(null);
  const memoriesRef = useRef<HTMLSpanElement>(null);
  const videosRef = useRef<HTMLSpanElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    conditions: expedition.conditions || "Snowfall",
    temperature: expedition.temperature || "-2°C",
  });
  const [isSaving, setIsSaving] = useState(false);

  const imagesCount = (expedition.media || []).filter(m => m.type === 'image').length;
  const videosCount = (expedition.media || []).filter(m => m.type === 'video').length;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Very slow fade-in animation for intelligence elements
      gsap.from(".intel-item", {
        y: 20,
        opacity: 0,
        duration: 2,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        }
      });

      // Subtle count-up animations for bottom statistics
      const setupCounter = (ref: React.RefObject<HTMLSpanElement | null>, targetValue: number, suffix: string = "") => {
        if (!ref.current) return;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: targetValue,
          duration: 3,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".intel-stats",
            start: "top 85%",
          },
          onUpdate: () => {
            if (ref.current) {
              const formatted = Math.round(obj.val).toLocaleString();
              ref.current.innerText = formatted + suffix;
            }
          }
        });
      };

      setupCounter(elevationRef, expedition.elevation, " m");
      setupCounter(memoriesRef, imagesCount);
      setupCounter(videosRef, videosCount);

    }, containerRef);
    return () => ctx.revert();
  }, [expedition, imagesCount, videosCount]);

  const handleSave = async () => {
    if (!expedition.id) return;
    setIsSaving(true);
    try {
      await updateExpedition(expedition.id, formData);
      if (onUpdate) onUpdate(formData);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const cards = [
    { label: "Date", value: formatDate(expedition.date) },
    { label: "Location", value: expedition.location || "Unknown" },
    { label: "Elevation", value: `${(expedition.elevation || 0).toLocaleString()} m` },
    { label: "Distance", value: `${expedition.distance || 0} km` },
    { label: "Duration", value: `${expedition.duration || 0} Days` },
    { label: "Difficulty", value: expedition.difficulty || "Extreme" },
    { label: "Weather", value: `${expedition.temperature || "-2°C"} • ${expedition.conditions || "Snowfall"}` },
  ];

  return (
    <section 
      id="overview" 
      ref={containerRef} 
      className="relative w-full min-h-[85vh] bg-[#050505] text-white py-32 flex flex-col items-center justify-center border-t border-white/5"
    >
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="intel-item text-center mb-24 relative">
          <p className="text-[10px] tracking-[0.5em] text-[#00D084] uppercase mb-6 font-semibold">
            Expedition Dossier
          </p>
          <h2 className="text-5xl md:text-7xl font-serif italic font-light tracking-tighter mb-4">
            {expedition.mountain || expedition.title || "Expedition"}
          </h2>
          <p className="text-sm md:text-base text-[#6b7280] tracking-[0.2em] uppercase font-light">
            A Journey Beyond the Clouds
          </p>

          {isOwner && (
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute top-0 right-0 p-3 bg-transparent hover:bg-white/5 rounded-full transition-all text-white/30 hover:text-[#00D084]"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 7 Intelligence Cards Grid */}
        <div className="flex flex-wrap justify-center gap-4 mb-24 max-w-5xl mx-auto">
          {cards.map((card, i) => (
            <div 
              key={i} 
              className="intel-item group relative bg-white/5 backdrop-blur-md border border-white/10 p-6 transition-colors duration-700 hover:border-[#00D084]/50 hover:bg-white/10 flex-grow basis-[200px] max-w-[280px]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#00D084]/0 to-[#00D084]/0 group-hover:to-[#00D084]/5 transition-colors duration-700" />
              <div className="relative z-10 text-center">
                <p className="text-[9px] tracking-[0.3em] uppercase text-[#6b7280] mb-3 transition-colors duration-500 group-hover:text-[#00D084]/80">
                  {card.label}
                </p>
                <p className="text-xl md:text-2xl font-serif italic text-white/90 font-light">
                  {card.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Centered Horizontal Divider */}
        <div className="intel-item w-full max-w-4xl mx-auto h-[1px] bg-white/10 mb-24" />

        {/* Bottom Statistics */}
        <div className="intel-stats intel-item flex flex-col md:flex-row items-center justify-center gap-16 md:gap-32 text-center">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#6b7280] mb-4">
              🏔 Highest Point
            </p>
            <p className="text-4xl md:text-5xl font-serif italic text-white font-light">
              <span ref={elevationRef}>0</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#6b7280] mb-4">
              📸 Memories
            </p>
            <p className="text-4xl md:text-5xl font-serif italic text-white font-light">
              <span ref={memoriesRef}>0</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#6b7280] mb-4">
              🎥 Videos
            </p>
            <p className="text-4xl md:text-5xl font-serif italic text-white font-light">
              <span ref={videosRef}>0</span>
            </p>
          </div>
        </div>

      </div>

      {/* EDIT MODAL (Simplified) */}
      {isEditing && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-none w-full max-w-md p-8 relative">
            <button 
              onClick={() => setIsEditing(false)}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-2xl font-serif italic mb-8 text-[#00D084]">Edit Intelligence</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#6b7280] mb-2">Weather Conditions</label>
                <input 
                  type="text" 
                  value={formData.conditions}
                  onChange={e => setFormData({...formData, conditions: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-[#00D084] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#6b7280] mb-2">Temperature</label>
                <input 
                  type="text" 
                  value={formData.temperature}
                  onChange={e => setFormData({...formData, temperature: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-[#00D084] transition-colors"
                />
              </div>
            </div>

            <div className="mt-12 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-3 bg-[#00D084] text-black font-bold text-xs uppercase tracking-widest hover:bg-[#00e691] transition-colors disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Data"}
                <Save className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
