"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export function MagneticButton({
  children,
  className = "",
  intensity = 40,
  ...props
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    const text = textRef.current;
    if (!button || !text) return;

    const xTo = gsap.quickTo(button, "x", {
      duration: 1,
      ease: "elastic.out(1, 0.3)",
    });
    const yTo = gsap.quickTo(button, "y", {
      duration: 1,
      ease: "elastic.out(1, 0.3)",
    });
    
    const textXTo = gsap.quickTo(text, "x", {
      duration: 1,
      ease: "elastic.out(1, 0.3)",
    });
    const textYTo = gsap.quickTo(text, "y", {
      duration: 1,
      ease: "elastic.out(1, 0.3)",
    });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = button.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);

      xTo(x * (intensity / 100));
      yTo(y * (intensity / 100));
      textXTo(x * (intensity / 200));
      textYTo(y * (intensity / 200));
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
      textXTo(0);
      textYTo(0);
    };

    button.addEventListener("mousemove", handleMouseMove);
    button.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      button.removeEventListener("mousemove", handleMouseMove);
      button.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [intensity]);

  return (
    <button
      ref={buttonRef}
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full px-8 py-4 font-medium tracking-wide transition-colors ${className}`}
      {...props}
    >
      <span ref={textRef} className="relative z-10 pointer-events-none">
        {children}
      </span>
    </button>
  );
}
