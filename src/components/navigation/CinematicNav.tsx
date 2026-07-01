"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";

export function CinematicNav() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ease-in-out px-6 md:px-12 flex items-center justify-between ${
        scrolled ? "h-20 bg-[#050505]/80 backdrop-blur-md border-b border-white/5" : "h-28 bg-transparent"
      }`}
    >
      {/* LEFT: Logo */}
      <div className="flex-1 flex justify-start">
        <Link href="/" className="group flex items-center gap-2">
          <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#00D084] transition-colors">
            <div className="w-1.5 h-1.5 bg-white group-hover:bg-[#00D084] rounded-full transition-colors" />
          </div>
          <span className="font-serif italic text-white/90 group-hover:text-white text-lg tracking-wider transition-colors">
            SummitSphere
          </span>
        </Link>
      </div>

      {/* CENTER: Navigation Links (Removed per user request) */}
      <div className="hidden md:flex flex-1 justify-center items-center gap-8">
      </div>

      {/* RIGHT: Profile / Auth */}
      <div className="flex-1 flex justify-end items-center gap-6">
        {!loading && user ? (
          <>
            <Link href="/admin/dashboard" className="hidden md:block text-[10px] tracking-[0.2em] uppercase text-white/60 hover:text-white transition-colors font-semibold">
              Studio
            </Link>
            <button 
              onClick={handleSignOut}
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-[#00D084] hover:bg-[#00D084]/10 transition-all group"
            >
              <LogOut className="w-4 h-4 text-white/60 group-hover:text-[#00D084] transition-colors" />
            </button>
          </>
        ) : (
          <Link href="/login">
            <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-white/40 transition-all group">
              <User className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
}
