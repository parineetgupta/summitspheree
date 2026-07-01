"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { User, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";

export function CinematicNav() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    await signOut(auth);
    setMobileMenuOpen(false);
    router.push("/");
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ease-in-out px-6 md:px-12 flex items-center justify-between ${
          scrolled || mobileMenuOpen ? "h-20 bg-[#050505]/90 backdrop-blur-md border-b border-white/5" : "h-20 md:h-28 bg-transparent"
        }`}
      >
        {/* LEFT: Logo */}
        <div className="flex-1 flex justify-start z-[60]">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="group flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#00D084] transition-colors">
              <div className="w-1.5 h-1.5 bg-white group-hover:bg-[#00D084] rounded-full transition-colors" />
            </div>
            <span className="font-serif italic text-white/90 group-hover:text-white text-lg tracking-wider transition-colors">
              SummitSphere
            </span>
          </Link>
        </div>

        {/* RIGHT: Profile / Auth (Desktop) & Hamburger (Mobile) */}
        <div className="flex-1 flex justify-end items-center gap-4 md:gap-6 z-[60]">
          {/* Desktop Controls */}
          <div className="hidden lg:flex items-center gap-6">
            {!loading && user ? (
              <>
                <Link href="/admin/dashboard" className="text-[10px] tracking-[0.2em] uppercase text-white/60 hover:text-white transition-colors font-semibold">
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
          
          {/* Mobile Hamburger Toggle */}
          <button 
            className="lg:hidden w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-white/40 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4 text-white" />
            ) : (
              <Menu className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-[#050505] backdrop-blur-xl transition-all duration-500 ease-in-out lg:hidden flex flex-col items-center justify-center px-8 ${
          mobileMenuOpen ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center gap-8 w-full max-w-sm">
          {!loading && user ? (
            <>
              <div className="flex flex-col items-center gap-2 mb-8">
                <div className="w-16 h-16 rounded-full border border-white/20 overflow-hidden mb-2">
                  <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <p className="text-white font-serif tracking-widest">{user.displayName || "Explorer"}</p>
              </div>
              <Link 
                href="/admin" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-4 rounded-full border border-white/20 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] font-semibold text-white hover:bg-white/5 transition-colors"
              >
                Access Studio
              </Link>
              <button 
                onClick={handleSignOut}
                className="w-full py-4 rounded-full border border-red-500/30 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Sign Out
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link 
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-4 rounded-full border border-[#00D084]/50 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] font-semibold text-[#00D084] hover:bg-[#00D084]/10 transition-colors"
            >
              Sign In
              <User className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
