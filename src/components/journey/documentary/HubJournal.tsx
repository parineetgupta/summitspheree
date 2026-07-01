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

export function HubJournal({ expedition, isOwner = false, onUpdate }: { expedition: Expedition, isOwner?: boolean, onUpdate?: (data: Partial<Expedition>) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    journal: expedition.journal || "The climb tested every part of me, but standing above the clouds reminded me why I keep coming back. Every difficult step slowly became a memory I never wanted to lose. Standing above the clouds, I realized the summit wasn't the destination—it was becoming the person who refused to stop climbing."
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Quote fade in
      gsap.from(".journal-quote", {
        y: 20,
        opacity: 0,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".journal-quote",
          start: "top 80%",
        }
      });

      // Journal Card slow fade and slide up
      gsap.from(".journal-card-container", {
        y: 40,
        opacity: 0,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".journal-card-container",
          start: "top 85%",
        }
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

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

  return (
    <section 
      id="journal" 
      ref={containerRef} 
      className="relative w-full bg-[#050505] text-white py-32 md:py-48 flex flex-col items-center border-t border-white/5"
    >
      
      {/* Section 1: Hero Quote */}
      <div className="journal-quote w-full text-center px-4 mb-48">
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif italic text-white/90 font-light tracking-wide leading-relaxed">
          "A Letter to My Future Self"
        </h2>
      </div>

      {/* Section 2: Personal Journal */}
      <div className="journal-card-container relative z-10 w-full max-w-4xl mx-auto px-4 md:px-8 flex flex-col items-center">
        
        <div className="text-center mb-12 relative w-full flex justify-center">
          <p className="text-[10px] tracking-[0.5em] text-[#00D084] uppercase font-semibold">
            Personal Journal
          </p>

          {isOwner && (
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute top-1/2 -translate-y-1/2 right-0 md:right-12 p-3 bg-transparent hover:bg-white/5 rounded-full transition-colors text-white/30 hover:text-[#00D084]"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Frosted Glass Journal Card */}
        <div className="relative w-full max-w-3xl bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 md:p-16 shadow-[0_0_50px_rgba(0,208,132,0.03)] overflow-hidden">
          
          {/* Subtle Paper Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
          
          {/* Soft Emerald Inner Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,208,132,0.05),transparent_50%)] pointer-events-none" />
          
          <div className="relative z-10 text-left">
            <p className="text-lg md:text-xl font-serif italic text-white/80 leading-[2.5] tracking-wide font-light whitespace-pre-wrap">
              {formData.journal}
            </p>

            <div className="mt-16 pt-8 border-t border-white/5 text-left">
              <p className="text-[9px] tracking-[0.2em] uppercase text-white/30 font-sans">
                — Written after completing this expedition
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* EDIT MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-2xl p-8 relative">
            <button 
              onClick={() => setIsEditing(false)}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-2xl font-serif italic mb-8 text-[#00D084]">Edit Journal Entry</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#6b7280] mb-2">Journal Content</label>
                <textarea 
                  value={formData.journal}
                  onChange={e => setFormData({...formData, journal: e.target.value})}
                  rows={8}
                  className="w-full bg-white/5 border border-white/10 px-4 py-4 text-sm focus:outline-none focus:border-[#00D084] transition-colors resize-none text-white/90 leading-loose font-serif italic rounded-lg"
                />
              </div>
            </div>

            <div className="mt-12 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-3 bg-[#00D084] text-black font-bold text-xs uppercase tracking-widest hover:bg-[#00e691] transition-colors rounded-lg disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Seal Journal"}
                <Save className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
