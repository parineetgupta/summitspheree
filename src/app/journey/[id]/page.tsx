"use client";

import { useEffect, useRef, useState, use } from "react";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { getExpeditionById, getUserProfile } from "@/firebase/db";
import { Expedition } from "@/types";
import Link from "next/link";
import { Play, Volume2, VolumeX, Share2, Check, Edit2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { HubHero } from "@/components/journey/documentary/HubHero";
import { HubOverview } from "@/components/journey/documentary/HubOverview";
import { HubJournal } from "@/components/journey/documentary/HubJournal";
import { HubVisuals } from "@/components/journey/documentary/HubVisuals";
import { HubFavorite } from "@/components/journey/documentary/HubFavorite";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "UNKNOWN DATE";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
  } catch (e) {
    return dateStr.toUpperCase();
  }
};

type ViewState = 'lobby' | 'intro' | 'documentary';

export default function ReliveJourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [expedition, setExpedition] = useState<Expedition | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [authorUsername, setAuthorUsername] = useState<string>("");
  
  const [viewState, setViewState] = useState<ViewState>('lobby');
  const [copied, setCopied] = useState(false);
  
  // Refs for animations
  const blackScreenRef = useRef<HTMLDivElement>(null);
  const introContainerRef = useRef<HTMLDivElement>(null);
  const docContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Audio refs
  const ambientAudioRef = useRef<HTMLAudioElement>(null);
  const soundtrackAudioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (loading) return;
    
    const loadData = async () => {
      try {
        const current = await getExpeditionById(resolvedParams.id);
        if (current) {
          setExpedition(current);
          const profile = await getUserProfile(current.userId);
          if (profile && profile.username) {
            setAuthorUsername(profile.username);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsFetching(false);
      }
    };
    loadData();
  }, [resolvedParams.id, loading]);

  const isOwner = user?.uid === expedition?.userId;
  const journeyPageUrl = isOwner ? "/journey" : (authorUsername ? `/${authorUsername}` : "/journey");

  // Intercept browser back button to navigate to the journey page
  useEffect(() => {
    if (!journeyPageUrl) return;

    window.history.pushState({ relive: true }, "", window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      if (!event.state || !event.state.relive) {
        router.push(journeyPageUrl);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [journeyPageUrl, router]);

  // Handle "Play Journey" click manually
  const handlePlay = () => {
    // Start audio immediately on click to bypass browser autoplay restrictions
    if (ambientAudioRef.current) ambientAudioRef.current.play().catch(e => console.error(e));
    if (soundtrackAudioRef.current) soundtrackAudioRef.current.play().catch(e => console.error(e));

    // 1. Fade to black
    gsap.to(blackScreenRef.current, {
      opacity: 1,
      duration: 2,
      ease: "power2.inOut",
      onComplete: () => {
        setViewState('intro');
      }
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Intro Sequence Logic
  useEffect(() => {
    if (viewState === 'intro' && expedition) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onComplete: () => {
            setViewState('documentary');
          }
        });

        // Intro sequence fade-ins
        const texts = gsap.utils.toArray(".intro-sequence-text");
        
        texts.forEach((el: any, index: number) => {
          const isLast = index === texts.length - 1;
          
          tl.to(el, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" })
            .to(el, { 
              opacity: 0, 
              y: -20, 
              duration: 0.6, 
              ease: "power2.in", 
              delay: isLast ? 2 : 0.3 // Hold the final massive title slightly longer
            });
        });

      }, introContainerRef);
      return () => ctx.revert();
    }
  }, [viewState, expedition]);

  // Documentary Scroll Trigger Logic
  useEffect(() => {
    if (viewState === 'documentary' && expedition) {
      // Fade from black back to visible
      gsap.to(blackScreenRef.current, {
        opacity: 0,
        duration: 3,
        ease: "power2.inOut",
      });

      const ctx = gsap.context(() => {

        // Parallax images
        gsap.utils.toArray(".doc-image").forEach((el: any) => {
          gsap.fromTo(el, 
            { yPercent: -15 },
            { 
              yPercent: 15,
              ease: "none",
              scrollTrigger: {
                trigger: el.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true
              }
            }
          );
        });

        // Scroll Progress Bar
        if (progressBarRef.current) {
          gsap.to(progressBarRef.current, {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: document.documentElement,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.1
            }
          });
        }

        // Ensure ScrollTrigger accurately measures the newly rendered elements dynamically
        const observer = new ResizeObserver(() => {
          ScrollTrigger.refresh();
        });
        if (docContainerRef.current) {
          observer.observe(docContainerRef.current);
        }
        
        // Cleanup observer when context reverts
        return () => {
          observer.disconnect();
        };

      }, docContainerRef);
      return () => ctx.revert();
    }
  }, [viewState, expedition]);


  if (loading || isFetching) {
    return <div className="h-screen flex items-center justify-center bg-[#050505] text-[#1e3a8a] tracking-[0.4em] uppercase text-[10px]">Loading Archives...</div>;
  }

  if (!expedition) {
    return <div className="h-screen flex items-center justify-center bg-[#050505] text-white/50">Expedition not found.</div>;
  }

  const coverImage = expedition.heroImage || (expedition.media?.find(m => m.type === 'image')?.url) || "";

  return (
    <main className="relative w-full min-h-screen bg-[#050505] text-[#e5e5e5] font-sans selection:bg-[#00D084]/30">
      
      {/* Go Back Option */}
      <div className="fixed top-8 left-8 z-[200] mix-blend-difference">
        <Link href={journeyPageUrl} className="group cursor-pointer flex items-center gap-2">
          <ArrowLeft className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
          <span className="text-[10px] tracking-[0.4em] text-white/50 group-hover:text-white transition-colors uppercase font-bold">
            Go Back
          </span>
        </Link>
      </div>

      {/* Audio Tags for cinematic immersion */}
      <audio ref={ambientAudioRef} src="/audio/ambient-wind.mp3" loop muted={isMuted} />
      <audio ref={soundtrackAudioRef} src="/audio/epic-trailer.mp3" muted={isMuted} />

      {/* Floating Mute Button (Visible during and after intro) */}
      {viewState !== 'lobby' && (
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="fixed bottom-8 right-8 z-[200] p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      )}

      {/* Persistent Black Screen Overlay for Transitions */}
      <div 
        ref={blackScreenRef} 
        className="fixed inset-0 bg-[#050505] z-50 pointer-events-none opacity-0 flex items-center justify-center"
      >
        {/* Tiny floating dust particles could go here if implemented via CSS or Canvas */}
      </div>

      {/* STATE 1: LOBBY */}
      {viewState === 'lobby' && (
        <section className="h-screen w-full relative overflow-hidden flex flex-col items-center justify-center">
          {/* Background Image with Dark Cinematic Overlay */}
          {coverImage && (
            <img 
              src={coverImage} 
              alt={expedition.title} 
              className="absolute inset-0 w-full h-full object-cover filter grayscale opacity-50" 
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-[#050505]/40" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-4xl px-8">
            <h1 className="text-6xl md:text-9xl font-serif italic text-white font-light tracking-tighter mb-8">
              {expedition.title}
            </h1>
            
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 mb-24">
              <div className="flex flex-col items-center">
                <span className="text-[8px] tracking-[0.4em] uppercase text-[#6b7280] mb-2">Location</span>
                <span className="text-xs font-serif italic text-white/90">{expedition.location}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[8px] tracking-[0.4em] uppercase text-[#6b7280] mb-2">Date</span>
                <span className="text-xs font-serif italic text-white/90">{formatDate(expedition.date || "")}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[8px] tracking-[0.4em] uppercase text-[#6b7280] mb-2">Elevation</span>
                <span className="text-xs font-serif italic text-white/90">{expedition.elevation}m</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[8px] tracking-[0.4em] uppercase text-[#6b7280] mb-2">Distance</span>
                <span className="text-xs font-serif italic text-white/90">{expedition.distance}km</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[8px] tracking-[0.4em] uppercase text-[#6b7280] mb-2">Duration</span>
                <span className="text-xs font-serif italic text-white/90">{expedition.duration} Days</span>
              </div>
            </div>

            <button 
              onClick={handlePlay}
              className="group flex items-center gap-4 px-8 py-4 border border-white/20 rounded-full hover:bg-white hover:text-black transition-all duration-700 mt-8"
            >
              <Play className="w-4 h-4 text-[#00D084] group-hover:text-black transition-colors" />
              <span className="text-[10px] tracking-[0.4em] uppercase font-bold">Play Journey</span>
            </button>

            {isOwner && (
              <button 
                onClick={handleShare}
                className="group flex items-center gap-3 mt-4 text-[#6b7280] hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#00D084]" /> : <Share2 className="w-3.5 h-3.5" />}
                <span className="text-[9px] tracking-[0.3em] uppercase">
                  {copied ? "Link Copied" : "Share Journey"}
                </span>
              </button>
            )}
          </div>
        </section>
      )}

      {/* STATE 2: CINEMATIC INTRO */}
      {viewState === 'intro' && (
        <section ref={introContainerRef} className="h-screen w-full fixed inset-0 z-[60] flex items-center justify-center px-8 pointer-events-none">
          <div className="relative w-full h-full flex items-center justify-center">
            
            <div className="intro-sequence-text absolute text-center opacity-0 translate-y-[20px]">
              <p className="text-[10px] tracking-[0.5em] text-[#6b7280] uppercase mb-4">Location</p>
              <p className="text-3xl font-serif italic text-white">{expedition.location}</p>
            </div>

            <div className="intro-sequence-text absolute text-center opacity-0 translate-y-[20px]">
              <p className="text-[10px] tracking-[0.5em] text-[#6b7280] uppercase mb-4">Date</p>
              <p className="text-3xl font-serif italic text-white">{formatDate(expedition.date || "")}</p>
            </div>

            <div className="intro-sequence-text absolute text-center opacity-0 translate-y-[20px]">
              <p className="text-[10px] tracking-[0.5em] text-[#6b7280] uppercase mb-4">Altitude</p>
              <p className="text-3xl font-serif italic text-white">{expedition.elevation} m</p>
            </div>

            <div className="intro-sequence-text absolute text-center opacity-0 translate-y-[20px]">
              <p className="text-[10px] tracking-[0.5em] text-[#6b7280] uppercase mb-4">Distance</p>
              <p className="text-3xl font-serif italic text-white">{expedition.distance} km</p>
            </div>

            <div className="intro-sequence-text absolute text-center opacity-0 translate-y-[20px]">
              <p className="text-[10px] tracking-[0.5em] text-[#6b7280] uppercase mb-4">Duration</p>
              <p className="text-3xl font-serif italic text-white">{expedition.duration} Days</p>
            </div>

            <div className="intro-sequence-text absolute text-center opacity-0 translate-y-[20px]">
              <p className="text-[10px] tracking-[0.5em] text-[#6b7280] uppercase mb-4">Weather</p>
              <p className="text-3xl font-serif italic text-white">{expedition.conditions || 'Calm'}</p>
            </div>

            <div className="intro-sequence-text absolute text-center opacity-0 translate-y-[20px]">
              <h2 className="text-6xl md:text-9xl font-serif italic text-white tracking-tighter font-light">
                {expedition.title}
              </h2>
            </div>

          </div>
        </section>
      )}

      {/* STATE 3: DOCUMENTARY */}
      {viewState === 'documentary' && (
          <div ref={docContainerRef} className="w-full bg-[#050505]">
            
            {/* 1. Hub Hero */}
            <HubHero expedition={expedition} isOwner={false} />

            {/* 2. Sticky Navigation */}
            <nav className="sticky top-0 z-[100] w-full bg-[#050505]/80 backdrop-blur-md border-y border-white/5 flex flex-col items-center justify-center overflow-x-auto no-scrollbar relative">
              <div className="flex items-center gap-8 md:gap-12 px-8 py-4">
                {["overview", "journal", "visuals", "favorite-memory"].map((tab) => (
                  <a 
                    key={tab}
                    href={`#${tab}`}
                    className="text-[9px] tracking-[0.3em] uppercase text-[#6b7280] hover:text-[#00D084] transition-colors whitespace-nowrap"
                  >
                    {tab.replace('-', ' ')}
                  </a>
                ))}
              </div>
              {/* Scroll Progress Bar */}
              <div className="w-full h-[1px] bg-white/5 absolute bottom-0 left-0">
                <div 
                  ref={progressBarRef}
                  className="h-full bg-[#00D084] origin-left shadow-[0_0_10px_rgba(0,208,132,0.5)]" 
                  style={{ transform: 'scaleX(0)' }}
                />
              </div>
            </nav>

            {/* 3. Modules */}
            <HubOverview 
              expedition={expedition} 
              isOwner={false}
              onUpdate={(data) => setExpedition({ ...expedition, ...data })}
            />
            <HubJournal 
              expedition={expedition} 
              isOwner={false}
              onUpdate={(data) => setExpedition({ ...expedition, ...data })}
            />
            <HubVisuals 
              media={expedition.media || []} 
              isOwner={false}
              onUpdate={(media) => setExpedition({ ...expedition, media })}
            />
            <HubFavorite 
              expedition={expedition} 
              isOwner={false}
              onUpdate={(data) => setExpedition({ ...expedition, ...data })}
            />

          </div>
      )}

      {/* Edit Button (Owner Only) */}
      {isOwner && (
        <div className="fixed bottom-24 right-8 z-[200] mix-blend-difference">
          <Link href="/admin">
            <button className="group w-12 h-12 rounded-full bg-transparent border border-white/20 flex items-center justify-center hover:border-white/50 transition-all duration-700 shadow-2xl">
              <Edit2 className="w-4 h-4 text-white/50 group-hover:text-white transition-all duration-700 group-hover:scale-110" />
            </button>
          </Link>
        </div>
      )}

    </main>
  );
}
