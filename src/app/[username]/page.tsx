"use client";

import React, { useEffect, useState, use } from "react";
import { getExpeditions, getUserIdByUsername, getUserProfile, updateUserProfile, createUserProfile } from "@/firebase/db";
import { Expedition, UserProfile } from "@/types";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { Edit2, X, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

// Import the minimalist chapters
import { JourneyIntro } from "@/components/journey/JourneyIntro";
import { JourneyStats } from "@/components/journey/JourneyStats";
import { JourneyAscents } from "@/components/journey/JourneyAscents";
import { JourneyAtlas } from "@/components/journey/JourneyAtlas";
import { JourneyAchievements } from "@/components/journey/JourneyAchievements";
import { JourneyQuote } from "@/components/journey/JourneyQuote";
import { Footer } from "@/components/layout/Footer";

export default function PublicJourneyPage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const { user, username: loggedInUsername, loading: authLoading } = useAuth();
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  const [isPublic, setIsPublic] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await getUserIdByUsername(resolvedParams.username);
        
        if (!userId) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const data = await getExpeditions(userId);
        
        // Sort by date descending (newest first)
        data.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        setExpeditions(data);

        // Fetch profile to check visibility
        const profileData = await getUserProfile(userId);
        if (profileData) {
          setProfile(profileData);
          setIsPublic(profileData.isPublic);
        } else {
          setIsPublic(true);
        }
      } catch (error) {
        console.error("Error fetching public expeditions:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.username]);

  if (loading || authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#050505] text-[#1e3a8a] text-[10px] tracking-[0.4em] uppercase font-semibold">
        Accessing Archives...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="h-screen w-full flex flex-col gap-6 items-center justify-center bg-[#050505] text-white">
        <h1 className="text-4xl font-serif italic font-light tracking-widest text-[#1e3a8a]">404</h1>
        <p className="text-[10px] tracking-[0.4em] uppercase text-white/50">Expedition Archives Not Found</p>
      </div>
    );
  }

  const isOwner = !!(user && loggedInUsername?.toLowerCase() === resolvedParams.username?.toLowerCase());
  const isPrivate = !isPublic && !isOwner;

  if (isPrivate) {
    return (
      <div className="h-screen w-full flex flex-col gap-6 items-center justify-center bg-[#050505] text-white p-4">
        <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-white/40 mb-2">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-xl md:text-2xl font-serif italic font-light tracking-widest text-[#00D084]">Private Archive</h1>
        <p className="text-[10px] tracking-[0.4em] uppercase text-white/50 text-center max-w-xs leading-relaxed">
          This expedition archive is set to private by the explorer.
        </p>
        <Link href="/">
          <button className="px-8 py-3 border border-white/20 rounded-full text-[9px] tracking-[0.4em] uppercase font-bold text-white/60 hover:border-white hover:text-white transition-all duration-700">
            Return Home
          </button>
        </Link>
      </div>
    );
  }

  const toggleVisibility = async () => {
    if (!user || !isOwner) return;
    const newIsPublic = !isPublic;
    setIsPublic(newIsPublic);
    
    try {
      if (profile && profile.id) {
        await updateUserProfile(profile.id, { isPublic: newIsPublic });
        setProfile({ ...profile, isPublic: newIsPublic });
      } else {
        const userId = await getUserIdByUsername(resolvedParams.username);
        if (!userId) return;
        const newId = await createUserProfile({
          userId: userId,
          displayName: resolvedParams.username,
          username: resolvedParams.username,
          bio: "",
          profilePhoto: "",
          isPublic: newIsPublic
        });
        setProfile({
          id: newId,
          userId: userId,
          displayName: resolvedParams.username,
          username: resolvedParams.username,
          bio: "",
          profilePhoto: "",
          isPublic: newIsPublic,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
    } catch (e) {
      console.error("Failed to toggle visibility:", e);
      setIsPublic(!newIsPublic);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/${resolvedParams.username}` : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy link:", e);
    }
  };

  const handleOpenPublicView = () => {
    if (typeof window !== 'undefined') {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <main className="relative w-full min-h-screen bg-[#050505] text-[#e5e5e5] font-sans selection:bg-[#00D084]/30 overflow-hidden">
      
      {/* Cinematic Atmosphere Overlays */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(circle at center, rgba(16,185,129,0.02) 0%, transparent 70%)'
      }} />
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-overlay" style={{
        backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")`
      }} />
      <div className="fixed inset-0 pointer-events-none z-50 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />

      {/* Edit Button (Owner Only) */}
      {isOwner && (
        <div className="fixed bottom-12 right-12 z-[90] mix-blend-difference">
          <Link href="/admin">
            <button className="group w-12 h-12 rounded-full bg-transparent border border-white/20 flex items-center justify-center hover:border-white/50 transition-all duration-700 shadow-2xl">
              <Edit2 className="w-4 h-4 text-white/50 group-hover:text-white transition-all duration-700 group-hover:scale-110" />
            </button>
          </Link>
        </div>
      )}
      
      {/* Visual Marker for Public Archive (Links to Hero Page) */}
      <div className="fixed top-8 left-8 z-[90] mix-blend-difference">
        <Link href="/" className="group cursor-pointer">
          <p className="text-[10px] tracking-[0.4em] text-white/50 group-hover:text-white transition-colors uppercase font-bold">
            Archive: <span className="text-[#00D084]">@{resolvedParams.username}</span>
          </p>
        </Link>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <JourneyIntro 
          onShareClick={() => setIsShareModalOpen(true)}
          isOwner={isOwner}
          isPublic={isPublic}
          onToggleVisibility={toggleVisibility}
        />
        <JourneyStats expeditions={expeditions} />
        <JourneyAscents expeditions={expeditions} />
        <JourneyAtlas expeditions={expeditions} />
        <JourneyAchievements expeditions={expeditions} />
        {/* Onboarding CTA for Visitors */}
        {!isOwner && (
          <div className="w-full pt-0 pb-24 -mt-24 bg-transparent flex flex-col items-center justify-center relative z-20">
            <p className="text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-white/50 font-semibold mb-8 text-center max-w-sm px-4">
              Inspired to start your own adventure archive?
            </p>
            <Link href="/login">
              <button className="px-10 py-4 bg-[#00D084]/10 border border-[#00D084]/30 rounded-full hover:bg-[#00D084] hover:text-black hover:border-[#00D084] transition-all duration-700 group text-[10px] tracking-[0.3em] uppercase font-bold text-[#00D084] flex items-center gap-3">
                Start Your Own Journey
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </button>
            </Link>
          </div>
        )}
        <JourneyQuote />
        <Footer />
      </div>

      {/* SHARE MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a]/90 border border-white/10 rounded-2xl w-full max-w-md p-8 relative shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-500 animate-fade-in">
            {/* Close Button */}
            <button 
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-serif italic text-[#00D084] mb-6 flex items-center gap-2">
              <span>🔗</span> Share Expedition Archive
            </h3>
            
            <p className="text-[10px] tracking-widest uppercase text-white/40 mb-8 leading-relaxed">
              Provide others with read-only access to your personal outdoor archives, metrics, and documentary journals.
            </p>

            <div className="space-y-6">
              {/* Public Journey Link */}
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-[#6b7280] mb-3">Public Journey Link</label>
                <div className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-center relative group">
                  <span className="text-xs text-white/70 truncate flex-1 font-mono tracking-tight pr-2 select-all">
                    {shareUrl}
                  </span>
                </div>
              </div>

              {/* Toggle visibility inside modal */}
              {isOwner && (
                <div className="border-t border-white/5 pt-6 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] uppercase tracking-widest text-[#6b7280] mb-1">Archive Visibility</span>
                    <span className="text-[10px] text-white/50 flex items-center gap-1.5">
                      {isPublic ? (
                        <>
                          <span className="text-[#00D084]">🌍</span> Public Journey
                        </>
                      ) : (
                        <>
                          <span className="text-amber-500">🔒</span> Private Journey
                        </>
                      )}
                    </span>
                  </div>
                  <button 
                    onClick={toggleVisibility}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isPublic ? 'bg-[#00D084]' : 'bg-white/15'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform duration-300 ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-3">
              <button 
                onClick={handleCopyLink}
                className="w-full py-3 bg-[#00D084] hover:bg-[#00e691] text-black font-bold text-[10px] uppercase tracking-widest transition-colors rounded-lg flex items-center justify-center gap-2"
              >
                {copied ? "Link Copied!" : "Copy Link"}
              </button>
              <button 
                onClick={handleOpenPublicView}
                className="w-full py-3 bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors rounded-lg flex items-center justify-center gap-2"
              >
                Open Public View
              </button>
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="w-full py-3 text-white/40 hover:text-white transition-colors text-[10px] uppercase tracking-widest font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
