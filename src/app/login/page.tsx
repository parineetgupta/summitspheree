"use client";

import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MoveRight, Loader2, ArrowRight } from "lucide-react";
import LoginScene from "@/components/login/LoginScene";

export default function Login() {
  const [step, setStep] = useState<"login" | "username">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

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

  const easing = [0.16, 1, 0.3, 1] as const; // Premium smooth ease out

  return (
    <main className="relative min-h-screen w-full bg-[#020202] flex flex-col justify-between overflow-hidden p-8 md:p-16 lg:p-24 selection:bg-emerald-900/30">
      <LoginScene />

      <div className="relative z-10 w-full h-full flex flex-col justify-between min-h-[calc(100vh-4rem-2rem)] md:min-h-[calc(100vh-8rem-2rem)] lg:min-h-[calc(100vh-12rem-2rem)]">
        
        {/* Editorial Header */}
        <header>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, ease: easing, delay: 0.5 }}
            className="text-white/40 uppercase tracking-[0.4em] text-xs font-sans"
          >
            SummitSphere
          </motion.h2>
        </header>

        {/* Main Composition */}
        <div className="flex flex-col max-w-3xl mt-auto mb-auto pt-32 pb-32">
          <AnimatePresence mode="wait">
            {step === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40, filter: "blur(10px)" }}
                transition={{ duration: 1.5, ease: easing }}
                className="flex flex-col"
              >
                <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-[#f5f5f5] tracking-tight leading-[1.1] mb-8 font-light">
                  The Expedition<br/>Archive
                </h1>
                
                <p className="font-sans text-[#888888] text-xs md:text-sm tracking-[0.3em] uppercase leading-relaxed mb-20 max-w-md">
                  Every summit leaves a story.<br/>Preserve yours forever.
                </p>

                {error && (
                  <p className="text-red-400/80 text-xs font-sans tracking-widest uppercase mb-8">{error}</p>
                )}

                <button
                  onClick={handleGoogle}
                  disabled={isLoading}
                  className="group relative flex items-center gap-6 text-[#f5f5f5] uppercase tracking-[0.25em] text-xs font-medium w-fit disabled:opacity-50"
                >
                  <span className="relative z-10 group-hover:-translate-y-1 transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                    {isLoading ? "Authenticating..." : "Continue with Google"}
                  </span>
                  
                  {!isLoading && (
                    <MoveRight className="w-4 h-4 text-[#888888] group-hover:text-[#f5f5f5] group-hover:translate-x-2 group-hover:-translate-y-1 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]" />
                  )}
                  
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[300%] bg-emerald-500/0 group-hover:bg-emerald-900/10 blur-2xl transition-colors duration-1000 rounded-full pointer-events-none -z-10" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="username"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40, filter: "blur(10px)" }}
                transition={{ duration: 1.5, ease: easing }}
                className="flex flex-col"
              >
                <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-[#f5f5f5] tracking-tight leading-[1.1] mb-8 font-light">
                  Claim Your<br/>Identity
                </h1>
                
                <p className="font-sans text-[#888888] text-xs md:text-sm tracking-[0.3em] uppercase leading-relaxed mb-16 max-w-md">
                  Choose a permanent handle for your expeditions.
                </p>

                <form onSubmit={handleSaveUsername} className="flex flex-col gap-12 w-full max-w-md">
                  <div className="relative group">
                    <span className="absolute left-0 bottom-4 text-[#555555] text-2xl font-serif">@</span>
                    <input
                      type="text"
                      placeholder="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      className="w-full bg-transparent border-b border-[#333333] pl-10 pr-4 py-4 text-[#f5f5f5] text-2xl font-serif placeholder:text-[#333333] focus:outline-none focus:border-[#888888] transition-colors"
                      autoFocus
                    />
                  </div>

                  {error && (
                    <p className="text-red-400/80 text-xs font-sans tracking-widest uppercase">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || username.length < 3}
                    className="group relative flex items-center gap-6 text-[#f5f5f5] uppercase tracking-[0.25em] text-xs font-medium w-fit disabled:opacity-50"
                  >
                    <span className="relative z-10 group-hover:-translate-y-1 transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                      {isLoading ? "Validating..." : "Confirm Identity"}
                    </span>
                    
                    {!isLoading && (
                      <ArrowRight className="w-4 h-4 text-[#888888] group-hover:text-[#f5f5f5] group-hover:translate-x-2 group-hover:-translate-y-1 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]" />
                    )}
                    
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[300%] bg-emerald-500/0 group-hover:bg-emerald-900/10 blur-2xl transition-colors duration-1000 rounded-full pointer-events-none -z-10" />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Editorial Footer */}
        <footer>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, ease: easing, delay: 1 }}
            className="flex justify-between items-center text-white/20 uppercase tracking-[0.4em] text-[10px] font-sans"
          >
            <p>Digital Museum</p>
            <p>Restricted Access</p>
          </motion.div>
        </footer>
      </div>
    </main>
  );
}
