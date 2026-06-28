"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { getExpeditions } from "@/firebase/db";
import { Expedition, ExpeditionMedia } from "@/types";
import { Settings } from "lucide-react";
import Link from "next/link";

// Import the cinematic chapters
import { JourneyIntro } from "@/components/journey/JourneyIntro";
import { JourneyStats } from "@/components/journey/JourneyStats";
import { JourneyAscents } from "@/components/journey/JourneyAscents";
import { JourneyAtlas } from "@/components/journey/JourneyAtlas";
import { JourneyGallery } from "@/components/journey/JourneyGallery";
import { JourneyTrophies } from "@/components/journey/JourneyTrophies";
import { JourneyTimeline } from "@/components/journey/JourneyTimeline";
import { JourneyEnding } from "@/components/journey/JourneyEnding";

interface GalleryItem extends ExpeditionMedia {
  expTitle?: string;
  expLoc?: string;
  expDate?: string;
}

export default function JourneyPage() {
  const { user, loading } = useAuth();
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsFetching(false);
      return;
    }
    const fetchExps = async () => {
      try {
        const data = await getExpeditions(user.uid);
        const completed = data.filter(e => e.status === "completed").sort((a, b) => {
          return new Date(a.date || "").getTime() - new Date(b.date || "").getTime(); // Chronological for timeline
        });
        setExpeditions(completed);
      } catch (e) {
        console.error("Failed to fetch expeditions", e);
      } finally {
        setIsFetching(false);
      }
    };
    fetchExps();
  }, [user]);

  // Derived Stats
  const totalSummits = expeditions.length;
  const totalDistance = expeditions.reduce((acc, curr) => acc + (Number(curr.distance) || 0), 0);
  const totalElevation = expeditions.reduce((acc, curr) => acc + (Number(curr.elevation) || 0), 0);

  // Collect media for the gallery
  const galleryMedia: GalleryItem[] = expeditions.flatMap(exp => 
    (exp.media || [])
      .filter(m => m.type === 'image' || m.type === 'video')
      .map(m => ({ 
        ...m, 
        expTitle: exp.title, 
        expDate: exp.date, 
        expLoc: exp.location 
      }))
  ).slice(0, 15); // limit to top 15 for performance

  if (loading || isFetching) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#6b7280] tracking-[0.4em] uppercase text-[9px]">
        Retrieving Archives...
      </div>
    );
  }

  return (
    <main className="relative w-full bg-[#050505] text-[#e5e5e5] font-sans selection:bg-[#00D084]/30 overflow-hidden">
      
      {/* Animated Grain Overlay for Cinematic Texture */}
      <div 
        className="pointer-events-none fixed inset-0 z-[100] opacity-[0.04] mix-blend-overlay" 
        style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png")' }}
      />
      
      {/* Settings Button (Owner Only) */}
      {user && (
        <div className="fixed bottom-12 right-12 z-[90] mix-blend-difference">
          <Link href="/admin">
            <button className="group w-12 h-12 rounded-full bg-transparent border border-white/20 flex items-center justify-center hover:border-white/50 transition-all duration-700 shadow-2xl">
              <Settings className="w-4 h-4 text-white/50 group-hover:text-white transition-all duration-700 group-hover:rotate-90" />
            </button>
          </Link>
        </div>
      )}

      <JourneyIntro />
      <JourneyStats summits={totalSummits} distance={totalDistance} elevation={totalElevation} />
      <JourneyAscents expeditions={[...expeditions].reverse()} /> {/* Reverse to show newest first in ascents */}
      <JourneyAtlas expeditions={expeditions} />
      <JourneyGallery galleryMedia={galleryMedia} />
      <JourneyTrophies expeditions={expeditions} />
      <JourneyTimeline expeditions={expeditions} />
      <JourneyEnding />

    </main>
  );
}
