"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface RevealTextProps {
  text: string;
  className?: string;
  delay?: number;
  as?: React.ElementType;
}

export function RevealText({
  text,
  className = "",
  delay = 0,
  as: Component = "p",
}: RevealTextProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Split text into words for animation
    const words = container.querySelectorAll(".reveal-word");
    
    // Set initial state
    gsap.set(words, {
      y: "120%",
      opacity: 0,
      rotateZ: 5,
    });

    const ctx = gsap.context(() => {
      gsap.to(words, {
        scrollTrigger: {
          trigger: container,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        y: "0%",
        opacity: 1,
        rotateZ: 0,
        duration: 0.8,
        stagger: 0.04,
        ease: "power3.out",
        delay: delay,
      });
    });

    return () => ctx.revert();
  }, [delay]);

  // Pre-process text to wrap words
  const renderWords = () => {
    return text.split(" ").map((word, index) => (
      <span key={index} className="inline-block overflow-hidden pb-1">
        <span className="reveal-word inline-block origin-bottom-left">
          {word}&nbsp;
        </span>
      </span>
    ));
  };

  const ComponentType = Component as any;

  return (
    <ComponentType ref={containerRef} className={`${className} flex flex-wrap`}>
      {renderWords()}
    </ComponentType>
  );
}
