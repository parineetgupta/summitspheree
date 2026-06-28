"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image, { ImageProps } from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ParallaxImageProps extends Omit<ImageProps, "className"> {
  containerClassName?: string;
  imageClassName?: string;
  speed?: number;
}

export function ParallaxImage({
  containerClassName = "",
  imageClassName = "",
  speed = 1,
  alt,
  ...props
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const image = imageRef.current;

    if (!container || !image) return;

    const ctx = gsap.context(() => {
      gsap.to(image, {
        scrollTrigger: {
          trigger: container,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
        y: (i, target) => -ScrollTrigger.maxScroll(window) * (speed * 0.1),
        ease: "none",
      });
    });

    return () => ctx.revert();
  }, [speed]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${containerClassName}`}
    >
      <div className="absolute inset-0 h-[120%] -top-[10%]">
        <Image
          ref={imageRef}
          className={`object-cover ${imageClassName}`}
          alt={alt || "Parallax image"}
          fill
          {...props}
        />
      </div>
    </div>
  );
}
