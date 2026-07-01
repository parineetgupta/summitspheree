"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { getExpeditions, getUserProfile, updateUserProfile, createUserProfile } from "@/firebase/db";
import { Expedition, UserProfile } from "@/types";
import { Edit2, X, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Import the minimalist chapters
import { JourneyIntro } from "@/components/journey/JourneyIntro";
import { JourneyStats } from "@/components/journey/JourneyStats";
import { JourneyAscents } from "@/components/journey/JourneyAscents";
import { JourneyAtlas } from "@/components/journey/JourneyAtlas";
import { JourneyAchievements } from "@/components/journey/JourneyAchievements";
import { JourneyQuote } from "@/components/journey/JourneyQuote";

export default function JourneyPage() {
  const { user, username: loggedInUsername, loading } = useAuth();
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    const fetchExpeditions = async () => {
      try {
        const data = await getExpeditions(user.uid);
        
        // Sort by date descending (newest first)
        data.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        setExpeditions(data);
      } catch (error) {
        console.error("Error fetching expeditions:", error);
      }
    };
    
    const fetchProfile = async () => {
      try {
        const profileData = await getUserProfile(user.uid);
        if (profileData) {
          setProfile(profileData);
          setIsPublic(profileData.isPublic);
        }
      } catch (e) {
        console.error("Error loading user profile:", e);
      }
    };

    fetchExpeditions();
    fetchProfile();
  }, [user, loading]);

  const toggleVisibility = async () => {
    if (!user) return;
    const newIsPublic = !isPublic;
    setIsPublic(newIsPublic);
    
    try {
      if (profile && profile.id) {
        await updateUserProfile(profile.id, { isPublic: newIsPublic });
        setProfile({ ...profile, isPublic: newIsPublic });
      } else {
        const newId = await createUserProfile({
          userId: user.uid,
          displayName: user.displayName || "",
          username: loggedInUsername || "",
          bio: "",
          profilePhoto: user.photoURL || "",
          isPublic: newIsPublic
        });
        setProfile({
          id: newId,
          userId: user.uid,
          displayName: user.displayName || "",
          username: loggedInUsername || "",
          bio: "",
          profilePhoto: user.photoURL || "",
          isPublic: newIsPublic,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
    } catch (e) {
      console.error("Failed to toggle journey visibility:", e);
      setIsPublic(!newIsPublic); // Revert on failure
    }
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/${loggedInUsername || ''}` : '';

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

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#050505] text-[#1e3a8a] text-[10px] tracking-[0.4em] uppercase font-semibold">
        Preparing Journey...
      </div>
    );
  }

  return (
    <main className="relative w-full min-h-screen bg-[#050505] text-[#e5e5e5] font-sans selection:bg-[#00D084]/30 overflow-hidden">
      
      {/* Edit Button (Owner Only) */}
      {user && (
        <div className="fixed bottom-12 right-12 z-[90] mix-blend-difference">
          <Link href="/admin">
            <button className="group w-12 h-12 rounded-full bg-transparent border border-white/20 flex items-center justify-center hover:border-white/50 transition-all duration-700 shadow-2xl">
              <Edit2 className="w-4 h-4 text-white/50 group-hover:text-white transition-all duration-700 group-hover:scale-110" />
            </button>
          </Link>
        </div>
      )}

      {/* Interactive Back Button & Visual Marker (Links to Hero Landing Page) */}
      <div className="fixed top-8 left-8 z-[90] mix-blend-difference flex items-center gap-6">
        <Link href="/" className="group cursor-pointer flex items-center gap-2">
          <ArrowLeft className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
          <span className="text-[10px] tracking-[0.4em] text-white/50 group-hover:text-white transition-colors uppercase font-bold">
            Back
          </span>
        </Link>
        {loggedInUsername && (
          <span className="text-[10px] tracking-[0.4em] text-white/30 uppercase font-bold select-none border-l border-white/10 pl-6 hidden md:inline">
            Archive: <span className="text-[#00D084]">@{loggedInUsername}</span>
          </span>
        )}
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* STRICT PAGE ORDER */}
        <JourneyIntro 
          onShareClick={() => setIsShareModalOpen(true)}
          isOwner={true}
          isPublic={isPublic}
          onToggleVisibility={toggleVisibility}
        />
        <JourneyStats expeditions={expeditions} />
        <JourneyAscents expeditions={expeditions} />
        <JourneyAtlas expeditions={expeditions} />
        <JourneyAchievements expeditions={expeditions} />
        <JourneyQuote />
      </div>

      {/* SHARE MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a]/90 border border-white/10 rounded-2xl w-full max-w-md p-8 relative shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-500">
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
