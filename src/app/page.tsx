"use client";

import { useEffect, useRef } from "react";
import HeroUI from "@/components/hero/HeroUI";
import { useHeroStore } from "@/components/hero/HeroStore";
import { CinematicBackground } from "@/components/hero/CinematicBackground";
import { CinematicNav } from "@/components/navigation/CinematicNav";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const setScrollProgress = useHeroStore((state) => state.setScrollProgress);

  useEffect(() => {
    // Reset on mount in case of back navigation
    setScrollProgress(0);
  }, [setScrollProgress]);

  return (
    <main ref={containerRef} className="relative h-screen w-full overflow-hidden bg-[#050505]">
      <CinematicNav />
      <CinematicBackground />
      <HeroUI />
    </main>
  );
}
