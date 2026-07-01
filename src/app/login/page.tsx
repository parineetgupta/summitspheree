"use client";

import { useState, useEffect } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import LoginScene from "@/components/login/LoginScene";
import { useAuth } from "@/features/auth/components/AuthProvider";

export default function Login() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [step, setStep] = useState<"login" | "username">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Redirect automatically if already logged in
  useEffect(() => {
    if (!authLoading && authUser) {
      router.push("/journey");
    }
  }, [authUser, authLoading, router]);

  const handleGoogle = async () => {
    setIsLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data().username) {
        router.push("/journey");
      } else {
        setStep("username");
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Authentication failed.");
      setIsLoading(false);
    }
  };

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const cleanUsername = username.replace(/[@\s]/g, "").toLowerCase();
    
    if (cleanUsername.length < 3) {
      setError("Must be at least 3 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user found.");

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", cleanUsername));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError(`@${cleanUsername} is taken.`);
        setIsLoading(false);
        return;
      }

      await setDoc(doc(db, "users", user.uid), {
        username: cleanUsername,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
      }, { merge: true });

      router.push("/journey");
    } catch (error: any) {
      console.error(error);
      setError("Failed to secure identity.");
      setIsLoading(false);
    }
  };

  const easing = [0.16, 1, 0.3, 1] as const; 
  
  // Stagger variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.8, ease: easing }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 1.2, ease: easing } }
  };

  // Show a cinematic loading state while verifying persistent session
  if (authLoading || authUser) {
    return (
      <main className="relative min-h-screen w-full bg-[#020202] overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <LoginScene />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-6">
          <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
          <p className="text-white/30 uppercase tracking-[0.3em] text-[10px] font-sans font-medium">Restoring Session</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full bg-[#020202] overflow-hidden selection:bg-white/20 selection:text-white">
      
      {/* 3D Background & Journey Card - Right Side on Desktop */}
      <div className="absolute inset-0 lg:left-1/2 lg:w-1/2 w-full h-full z-0 opacity-80 md:opacity-100 flex items-center justify-center pointer-events-none">
        
        {/* The subtle 3D Atlas */}
        <div className="absolute inset-0 z-0">
          <LoginScene />
        </div>

        {/* Soft gradient to blend the 3D scene into the dark left side */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-transparent to-transparent hidden lg:block z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-[#020202] lg:hidden z-10" />

      </div>

      <div className="relative z-30 w-full min-h-screen flex flex-col lg:flex-row pointer-events-none">
        
        {/* Left Side Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 md:p-12 lg:p-16 min-h-screen pointer-events-auto">
          
          <header>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: easing }}
            >
              <Link 
                href="/" 
                className="group inline-flex items-center gap-3 text-white/50 hover:text-white transition-colors relative z-20"
              >
                <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                <span className="uppercase tracking-[0.25em] text-xs font-sans font-medium">
                  SummitSphere
                </span>
              </Link>
            </motion.div>
          </header>

          <div className="flex flex-col max-w-xl my-auto py-6">
            <AnimatePresence mode="wait">
              {step === "login" ? (
                <motion.div
                  key="login"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="flex flex-col"
                >
                  <motion.h1 variants={itemVariants} className="font-sans text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white mb-4 leading-[1.05]">
                    Preserve the Moments<br/>That Shape Your Journey
                  </motion.h1>
                  
                  <motion.p variants={itemVariants} className="font-sans text-[#A0AEC0] text-sm md:text-base font-light tracking-wide leading-relaxed mb-6 max-w-[400px]">
                    Capture memories, document milestones, and build a personal atlas of achievements that grows with every experience.
                  </motion.p>

                  <motion.div variants={itemVariants} className="flex flex-col gap-2.5 mb-8 border-l border-white/10 pl-6 py-1">
                    <p className="text-[10px] md:text-xs tracking-[0.15em] uppercase text-[#64748B]">✦ Capture Memories</p>
                    <p className="text-[10px] md:text-xs tracking-[0.15em] uppercase text-[#64748B]">✦ Track Progress</p>
                    <p className="text-[10px] md:text-xs tracking-[0.15em] uppercase text-[#64748B]">✦ Celebrate Milestones</p>
                  </motion.div>

                  {error && (
                    <motion.p variants={itemVariants} className="text-red-400/80 text-xs font-sans tracking-widest uppercase mb-4">{error}</motion.p>
                  )}

                  <motion.div variants={itemVariants} className="flex flex-col gap-4 items-start">
                    {/* Primary Glassmorphism Button */}
                    <button
                      onClick={handleGoogle}
                      disabled={isLoading}
                      className="group relative overflow-hidden rounded-full border border-white/20 bg-white/5 backdrop-blur-md px-10 py-4 shadow-[0_4px_24px_rgba(0,0,0,0.2)] transition-all duration-500 hover:bg-white/10 hover:border-white/30 hover:shadow-[0_8px_32px_rgba(255,255,255,0.05)] disabled:opacity-50"
                    >
                      <span className="relative z-10 flex items-center gap-3 text-sm tracking-[0.15em] uppercase font-semibold text-white">
                        {isLoading ? "Authenticating..." : "Enter SummitSphere"}
                        {!isLoading && <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />}
                      </span>
                    </button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="username"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="flex flex-col"
                >
                  <motion.h1 variants={itemVariants} className="font-sans text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white mb-4 leading-[1.05]">
                    Claim Your Handle
                  </motion.h1>
                  
                  <motion.p variants={itemVariants} className="font-sans text-[#A0AEC0] text-sm md:text-base font-light tracking-wide leading-relaxed mb-6 max-w-sm">
                    Choose a permanent identity for your expedition archive.
                  </motion.p>

                  <motion.form variants={itemVariants} onSubmit={handleSaveUsername} className="flex flex-col gap-6 w-full max-w-sm">
                    <div className="relative group">
                      <span className="absolute left-0 bottom-4 text-[#64748B] text-xl font-sans">@</span>
                      <input
                        type="text"
                        placeholder="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase())}
                        className="w-full bg-transparent border-b border-white/20 pl-8 pr-4 py-4 text-white text-xl font-sans placeholder:text-[#64748B] focus:outline-none focus:border-white/60 transition-colors"
                        autoFocus
                      />
                    </div>

                    {error && (
                      <p className="text-red-400/80 text-xs font-sans tracking-widest uppercase">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || username.length < 3}
                      className="group relative overflow-hidden rounded-full border border-white/20 bg-white/5 backdrop-blur-md px-10 py-4 shadow-[0_4px_24px_rgba(0,0,0,0.2)] transition-all duration-500 hover:bg-white/10 hover:border-white/30 disabled:opacity-50 w-fit"
                    >
                      <span className="relative z-10 flex items-center gap-3 text-sm tracking-[0.15em] uppercase font-semibold text-white">
                        {isLoading ? "Validating..." : "Confirm Identity"}
                        {!isLoading && <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />}
                      </span>
                    </button>
                  </motion.form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <footer>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, ease: easing, delay: 0.8 }}
              className="flex justify-between items-center text-[#64748B] uppercase tracking-[0.25em] text-[10px] font-sans font-medium"
            >
              <p>Digital Atlas</p>
              <p className="hidden md:block">The summit is only the beginning.</p>
            </motion.div>
          </footer>
        </div>
      </div>
    </main>
  );
}
