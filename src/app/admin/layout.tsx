"use client";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";
import { FiLogOut } from "react-icons/fi";
import { auth } from "@/firebase/config";
import { signOut } from "firebase/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-black text-white font-sans overflow-hidden selection:bg-white/30 selection:text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-black border-b border-white/10 flex items-center justify-between px-8 shrink-0 relative z-10">
            <h1 className="text-sm font-bold tracking-widest uppercase text-white/90">Studio Overview</h1>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-white/90 leading-tight">Parineet</p>
                  <p className="text-[10px] text-white/40 tracking-widest uppercase leading-tight">parineetgupta4@gmail.com</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden border border-white/20">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Parineet" alt="Avatar" className="w-full h-full object-cover opacity-80" />
                </div>
              </div>
              
              <div className="h-4 w-px bg-white/10" />
              
              <button 
                onClick={() => signOut(auth)}
                className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/50 hover:text-white transition-colors"
              >
                Sign Out
                <FiLogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto bg-black relative">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
