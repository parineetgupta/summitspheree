"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import HeroScene from "@/components/hero/HeroScene";
import HeroUI from "@/components/hero/HeroUI";
import { useHeroStore } from "@/components/hero/HeroStore";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const setScrollProgress = useHeroStore((state) => state.setScrollProgress);

  useEffect(() => {
    let isRedirecting = false;
    
    // Reset on mount in case of back navigation
    setScrollProgress(0);
    
    const handleScroll = () => {
      // Calculate scroll progress based on the 400vh container
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.max(window.scrollY / scrollHeight, 0), 1);
      
      setScrollProgress(progress);

      if (progress >= 0.99 && !isRedirecting) {
        isRedirecting = true;
        router.push("/login");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [router, setScrollProgress]);

  return (
    <main ref={containerRef} className="relative h-[400vh] w-full bg-[#050505]">
      {/* Sticky wrapper to pin the visual content while scrolling */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <HeroScene />
        <HeroUI />
      </div>
    </main>
  );
}
