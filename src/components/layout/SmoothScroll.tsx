"use client";

import { useEffect } from "react";
import { ReactLenis } from "@studio-freight/react-lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    function update(time: number) {
      // Lenis raf is handled by ReactLenis, but we must update ScrollTrigger
      // ScrollTrigger needs to be aware of the smooth scroll position
      ScrollTrigger.update();
    }
    gsap.ticker.add(update);
    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.05, smoothWheel: true }}>
      {children as any}
    </ReactLenis>
  );
}
