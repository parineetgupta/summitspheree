import { create } from "zustand";

interface HeroState {
  scrollProgress: number;
  setScrollProgress: (progress: number) => void;
}

export const useHeroStore = create<HeroState>((set) => ({
  scrollProgress: 0,
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
}));
