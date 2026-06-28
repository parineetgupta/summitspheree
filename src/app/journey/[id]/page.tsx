"use client";

import { useEffect, useRef, useState, use } from "react";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { getExpeditionById, getExpeditions } from "@/firebase/db";
import { Expedition } from "@/types";
import Link from "next/link";
import { ArrowLeft, Play } from "lucide-react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

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

export default function ReliveJourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user, loading } = useAuth();
  
  const [expedition, setExpedition] = useState<Expedition | null>(null);
  const [allExpeditions, setAllExpeditions] = useState<Expedition[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  const containerRef = useRef<HTMLElement>(null);
  const photosRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setIsFetching(false);
      return;
    }
    const loadData = async () => {
      try {
        const [current, all] = await Promise.all([
          getExpeditionById(resolvedParams.id),
          getExpeditions(user.uid)
        ]);
        if (current && current.userId === user.uid) {
          setExpedition(current);
        }
        setAllExpeditions(all.filter(e => e.status === "completed"));
      } catch (e) {
        console.error(e);
      } finally {
        setIsFetching(false);
      }
    };
    loadData();
  }, [resolvedParams.id, user]);

  useEffect(() => {
    if (isFetching || loading || !expedition) return;

    const ctx = gsap.context(() => {
      
      // 1. Intro Line extends
      gsap.fromTo(".intro-line", 
        { height: "0vh" },
        { height: "100vh", ease: "none", scrollTrigger: { trigger: ".sec-intro", start: "top top", end: "bottom center", scrub: true } }
      );

      // 2. Data Section Animations
      const tlData = gsap.timeline({
        scrollTrigger: {
          trigger: ".sec-data",
          start: "top 70%",
          end: "top 20%",
          scrub: true
        }
      });
      tlData.from(".data-title", { y: 50, opacity: 0, duration: 1 })
            .from(".data-stats", { y: 50, opacity: 0, duration: 1, stagger: 0.1 }, "-=0.5")
            .from(".data-image", { scale: 0.9, opacity: 0, duration: 2 }, "-=1");

      // 3. Photo Memories Crossfade (Automatic Slideshow)
      const photos = gsap.utils.toArray(".memory-photo") as HTMLElement[];
      if (photos.length > 1) {
        // Initialize state
        gsap.set(photos, { opacity: 0, scale: 1.05 });
        gsap.set(photos[0], { opacity: 1, scale: 1 });

        const tlMemories = gsap.timeline({ repeat: -1 });
        
        photos.forEach((photo: any, i) => {
          const nextPhoto = photos[(i + 1) % photos.length] as HTMLElement;
          
          tlMemories
            // Current photo pans/scales slowly for 4 seconds
            .to(photo, { scale: 1.02, duration: 4, ease: "none" })
            // Next photo fades in for the last 1.5 seconds of the current photo
            .to(nextPhoto, { opacity: 1, scale: 1, duration: 1.5, ease: "power2.inOut" }, "-=1.5")
            // Reset current photo once it's completely covered
            .set(photo, { opacity: 0, scale: 1.05 });
        });
      }

      // 4. Journal Fade
      gsap.from(".journal-text", {
        y: 100,
        opacity: 0,
        scrollTrigger: {
          trigger: ".sec-journal",
          start: "top 80%",
          end: "top 40%",
          scrub: true
        }
      });

      // 5. Global Timeline Line
      gsap.fromTo(".global-timeline", 
        { height: "0%" },
        { height: "100%", ease: "none", scrollTrigger: { trigger: containerRef.current, start: "top top", end: "bottom bottom", scrub: true } }
      );

    }, containerRef);

    return () => ctx.revert();
  }, [isFetching, loading, expedition, allExpeditions]);

  if (loading || isFetching) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white/50 tracking-[0.3em] uppercase text-[10px]">Loading Manuscript...</div>;
  }

  if (!expedition) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white/50">Expedition not found.</div>;
  }

  // Filter just images for the photo transition section
  const photos = expedition.media?.filter(m => m.type === 'image') || [];
  // Use hero image if no photos array, or add it to the front if it exists
  const memoryPhotos = photos.length > 0 ? photos.map(p => p.url) : (expedition.heroImage ? [expedition.heroImage] : []);

  return (
    <main ref={containerRef} className="relative w-full bg-[#050505] text-[#e5e5e5] font-sans selection:bg-emerald-900/30">
      
      {/* Animated Grain */}
      <div className="pointer-events-none fixed inset-0 z-[100] opacity-[0.03]" style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png")' }}></div>
      
      {/* Soft Emerald Radial Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-emerald-900/5 blur-[200px] pointer-events-none z-0" />

      {/* Back Button */}
      <div className="fixed top-12 left-12 z-[90]">
        <Link href="/journey">
          <button className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-md">
            <ArrowLeft className="w-4 h-4 text-white/70" />
            <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-white/70">Timeline</span>
          </button>
        </Link>
      </div>

      {/* Global Sidebar Timeline */}
      <div className="fixed left-12 top-1/2 -translate-y-1/2 h-[60vh] flex flex-col items-center justify-between z-50 hidden xl:flex">
        <div className="absolute top-0 bottom-0 w-px bg-white/5" />
        <div className="global-timeline absolute top-0 w-px bg-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.5)] origin-top" />
        
        {allExpeditions.map((exp, idx) => {
          const isActive = exp.id === resolvedParams.id;
          return (
            <div key={exp.id} className="relative group w-full flex justify-center cursor-pointer">
              <Link href={`/journey/${exp.id}`}>
                <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isActive ? 'bg-emerald-500 scale-150 shadow-[0_0_15px_rgba(16,185,129,0.8)]' : 'bg-white/20 hover:bg-white/50'}`} />
              </Link>
              <span className={`absolute left-6 text-[8px] tracking-[0.2em] uppercase transition-opacity whitespace-nowrap ${isActive ? 'opacity-100 text-emerald-400' : 'opacity-0 group-hover:opacity-50 text-white'}`}>
                {exp.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* SECTION 1: Intro */}
      <section className="sec-intro h-screen flex flex-col items-center justify-center relative z-10 px-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full border border-emerald-500/30 bg-emerald-900/20 flex items-center justify-center mb-8">
            <Play className="w-5 h-5 text-emerald-400 ml-1" />
          </div>
          <p className="text-[10px] tracking-[0.5em] uppercase text-emerald-400/80 mb-8 font-bold">Relive The Journey</p>
          <h1 className="text-5xl md:text-8xl font-serif italic text-white font-light tracking-tight leading-tight mb-8">
            Every summit <br/> has a story.
          </h1>
          <p className="text-xs font-serif italic text-[#6b7280] tracking-widest">Scroll to revisit the expedition.</p>
        </div>
        <div className="intro-line absolute top-[75%] w-px bg-gradient-to-b from-white/20 to-transparent" />
      </section>

      {/* SECTION 2: Expedition Data */}
      <section className="sec-data min-h-screen py-32 relative z-10 max-w-7xl mx-auto px-8 lg:pl-32 flex items-center">
        <div className="flex flex-col lg:flex-row gap-24 items-center w-full">
          
          <div className="w-full lg:w-5/12 space-y-16">
            <div className="data-title">
              <p className="text-[10px] tracking-[0.4em] uppercase text-[#6b7280] mb-6">{formatMonthYear(expedition.date || "")}</p>
              <h2 className="text-6xl md:text-8xl font-serif italic text-white tracking-tighter leading-[0.9]">{expedition.title}</h2>
            </div>
            
            <div className="data-stats grid grid-cols-2 gap-y-12 gap-x-8">
              <div>
                <p className="text-[8px] tracking-[0.3em] text-[#4b5563] mb-2">ELEVATION</p>
                <p className="text-lg font-serif italic text-[#d1d5db]">{expedition.elevation ? `${expedition.elevation}m` : '--'}</p>
              </div>
              <div>
                <p className="text-[8px] tracking-[0.3em] text-[#4b5563] mb-2">DISTANCE</p>
                <p className="text-lg font-serif italic text-[#d1d5db]">{expedition.distance ? `${expedition.distance}km` : '--'}</p>
              </div>
              <div>
                <p className="text-[8px] tracking-[0.3em] text-[#4b5563] mb-2">DURATION</p>
                <p className="text-lg font-serif italic text-[#d1d5db]">{expedition.duration ? `${expedition.duration} days` : '--'}</p>
              </div>
              <div>
                <p className="text-[8px] tracking-[0.3em] text-[#4b5563] mb-2">DIFFICULTY</p>
                <p className="text-lg font-serif italic text-[#d1d5db]">{expedition.difficulty || 'Moderate'}</p>
              </div>
              <div>
                <p className="text-[8px] tracking-[0.3em] text-[#4b5563] mb-2">REGION</p>
                <p className="text-lg font-serif italic text-[#d1d5db] line-clamp-1">{expedition.location || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-[8px] tracking-[0.3em] text-[#4b5563] mb-2">WEATHER</p>
                <p className="text-lg font-serif italic text-[#d1d5db] line-clamp-1">{expedition.conditions ? 'Recorded' : 'N/A'}</p>
              </div>
            </div>

            {expedition.tags && expedition.tags.length > 0 && (
              <div className="data-stats flex flex-wrap gap-3">
                {expedition.tags.map((tag, i) => (
                  <span key={i} className="px-4 py-2 border border-white/10 rounded-full text-[9px] tracking-widest uppercase text-white/50">{tag}</span>
                ))}
              </div>
            )}
          </div>

          <div className="w-full lg:w-7/12 data-image">
            <div className="aspect-[4/5] bg-[#030303] border border-[#111111] overflow-hidden relative group p-2 liquid-glass-border">
              {expedition.heroImage ? (
                <img src={expedition.heroImage} alt={expedition.title} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-1000" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-[#4b5563] font-serif italic text-xl opacity-50">No visual records</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Photo Memories (Pinned Crossfade) */}
      {memoryPhotos.length > 0 && (
        <section className="sec-memories h-screen relative z-10">
          <div ref={photosRef} className="memory-container w-full h-full relative overflow-hidden flex items-center justify-center">
            {memoryPhotos.map((url, i) => (
              <div key={i} className="memory-photo absolute inset-0 w-full h-full flex items-center justify-center bg-[#050505]">
                <img src={url} alt={`Memory ${i+1}`} className="w-full h-full object-cover opacity-60" />
                {/* Vignette Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_100%)] opacity-80" />
              </div>
            ))}
            
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 text-center mix-blend-difference">
              <p className="text-[10px] tracking-[0.5em] uppercase text-white/50">Visual Records</p>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: Journal */}
      {expedition.journal && (
        <section className="sec-journal min-h-screen flex items-center justify-center py-40 relative z-10 px-8">
          <div className="max-w-[700px] mx-auto journal-text">
            <p className="text-[10px] tracking-[0.5em] uppercase text-emerald-500/80 mb-16 text-center font-bold">The Journal</p>
            <div className="text-xl md:text-3xl font-serif text-white/90 leading-[2] tracking-wide whitespace-pre-wrap">
              {expedition.journal}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 5: Ending */}
      <section className="h-screen flex flex-col items-center justify-center relative z-10 overflow-hidden">
        <div className="text-center">
          <h2 className="text-6xl md:text-9xl font-serif italic text-white font-light tracking-tighter mb-12">Keep Climbing.</h2>
          <p className="text-sm font-serif italic text-[#6b7280] tracking-widest mb-16">Every summit becomes tomorrow's memory.</p>
          <div className="w-px h-32 bg-gradient-to-b from-white/20 to-transparent mx-auto" />
        </div>
      </section>

    </main>
  );
}
