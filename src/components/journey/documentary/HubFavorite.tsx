"use client";

import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Expedition } from "@/types";
import Link from "next/link";
import { Pencil, X, Save } from "lucide-react";
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function HubFavorite({ expedition, isOwner = false, onUpdate }: { expedition: Expedition, isOwner?: boolean, onUpdate?: (data: Partial<Expedition>) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    favoriteMoment: expedition.favoriteMoment || ""
  });
  const [isSaving, setIsSaving] = useState(false);
  
  const images = expedition.media?.filter(m => m.type === 'image') || [];
  
  // Find best photo by ID, or fallback to the first image.
  let bestPhoto = images.find(m => m.id === expedition.bestPhotoId);
  if (!bestPhoto && images.length > 0) {
    bestPhoto = images[0];
  }

  useEffect(() => {
    import("@/firebase/db").then((m) => {
      m.getUsernameByUserId(expedition.userId).then((uname) => {
        if (uname) setUsername(uname);
      });
    });
  }, [expedition.userId]);

  const handleSave = async () => {
    if (!expedition.id) return;
    setIsSaving(true);
    try {
      const { updateExpedition } = await import("@/firebase/db");
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

  useEffect(() => {
    if (!bestPhoto) return;

    const ctx = gsap.context(() => {
      gsap.from(".favorite-text", {
        y: 40,
        opacity: 0,
        duration: 1.5,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        }
      });
      
      gsap.fromTo(".favorite-img",
        { yPercent: -15 },
        { 
          yPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: ".favorite-img-container",
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [bestPhoto]);

  if (!bestPhoto) return null;

  const archiveHref = username ? `/${username}` : "/journey";

  return (
    <section id="favorite-memory" ref={containerRef} className="py-32 bg-[#050505] relative z-10 w-full text-white border-t border-white/5">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        
        <div className="text-center mb-24 favorite-text">
          <p className="text-[10px] tracking-[0.4em] text-[#00D084] uppercase mb-4 font-semibold flex items-center justify-center gap-3">
            <span className="text-[#00D084]">⭐</span> Favorite Memory
          </p>
          <h2 className="text-4xl md:text-6xl font-serif italic font-light tracking-tighter">
            The Defining Moment
          </h2>
          {isOwner && (
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute top-0 right-0 p-3 bg-transparent hover:bg-white/5 rounded-full transition-colors text-white/30 hover:text-[#00D084]"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="favorite-img-container w-full h-[70vh] md:h-screen relative overflow-hidden mb-16 border border-white/5">
          <img 
            src={bestPhoto.url} 
            alt="Favorite Memory" 
            className="favorite-img absolute inset-0 w-full h-[130%] -top-[15%] object-cover opacity-90"
          />
          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#050505]/40" />
        </div>

        <div className="max-w-3xl mx-auto text-center favorite-text">
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#6b7280]">
              {expedition.location}
            </span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#6b7280]">
              {new Date(expedition.date || Date.now()).getFullYear()}
            </span>
          </div>

          <h3 className="text-2xl md:text-4xl font-serif italic text-white/90 leading-relaxed font-light tracking-wide whitespace-pre-wrap">
            "{expedition.favoriteMoment || bestPhoto.caption || bestPhoto.title || "A single breath suspended in time, where the mountain and the soul became one."}"
          </h3>
          <Link href={archiveHref}>
            <button className="mt-16 px-8 py-3 border border-[#00D084]/50 rounded-full text-[9px] tracking-[0.4em] uppercase font-bold text-[#00D084] hover:bg-[#00D084] hover:text-black transition-all duration-700 shadow-[0_0_15px_rgba(0,208,132,0.2)] hover:shadow-[0_0_30px_rgba(0,208,132,0.4)]">
              Return to Archives
            </button>
          </Link>
        </div>

      </div>

      {/* EDIT MODAL */}
      {isEditing && isOwner && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 text-left">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-2xl p-8 relative">
            <button 
              onClick={() => setIsEditing(false)}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-2xl font-serif italic mb-8 text-[#00D084]">Edit Favorite Memory</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#6b7280] mb-2">Favorite Moment</label>
                <textarea 
                  value={formData.favoriteMoment}
                  onChange={e => setFormData({...formData, favoriteMoment: e.target.value})}
                  rows={4}
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
                {isSaving ? "Saving..." : "Save Memory"}
                <Save className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
