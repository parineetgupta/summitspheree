"use client";

import { useEffect, useState } from "react";
import { Activity, Map, TrendingUp, ArrowUp, Plus } from "lucide-react";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { getExpeditions } from "@/firebase/db";
import { Expedition } from "@/types";
import Link from "next/link";

export default function AdminOverview() {
  const { user } = useAuth();
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      const data = await getExpeditions(user.uid);
      setExpeditions(data);
      setLoading(false);
    };
    loadData();
  }, [user]);

  const completedTreks = expeditions.filter(e => e.status === 'completed');
  const totalDistance = completedTreks.reduce((sum, e) => sum + (Number(e.distance) || 0), 0);
  const totalElevation = completedTreks.reduce((sum, e) => sum + (Number(e.elevation) || 0), 0);
  const highestPeak = completedTreks.reduce((max, e) => Math.max(max, Number(e.elevation) || 0), 0);

  if (loading) return <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans">Loading dashboard...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans">
      
      <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-8 sm:mb-12 gap-4">
        <div>
          <h2 className="text-sm font-bold text-white mb-2 tracking-widest uppercase">Dashboard Overview</h2>
          <p className="text-[10px] tracking-widest uppercase text-white/50">Track your progress and look back at your outdoor accomplishments.</p>
        </div>
        <Link 
          href="/admin/editor/new"
          className="flex items-center gap-2 bg-white hover:bg-white/90 text-black px-6 py-3 rounded-none font-bold text-[10px] tracking-widest uppercase transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Expedition
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        
        {/* Metric 1 */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 flex items-center gap-5">
          <div className="w-12 h-12 bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
            <Activity className="w-5 h-5 text-white/70" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/50 mb-1">Total Treks</p>
            <p className="text-2xl font-light text-white leading-none">
              {completedTreks.length}
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 flex items-center gap-5">
          <div className="w-12 h-12 bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
            <Map className="w-5 h-5 text-white/70" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/50 mb-1">Total Distance</p>
            <p className="text-2xl font-light text-white leading-none">
              {totalDistance.toFixed(1)} <span className="text-sm font-light text-white/40">km</span>
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 flex items-center gap-5">
          <div className="w-12 h-12 bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
            <TrendingUp className="w-5 h-5 text-white/70" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/50 mb-1">Elevation Gained</p>
            <p className="text-2xl font-light text-white leading-none">
              {totalElevation.toLocaleString()} <span className="text-sm font-light text-white/40">m</span>
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 flex items-center gap-5">
          <div className="w-12 h-12 bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
            <ArrowUp className="w-5 h-5 text-white/70" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/50 mb-1">Highest Peak</p>
            <p className="text-2xl font-light text-white leading-none">
              {highestPeak.toLocaleString()} <span className="text-sm font-light text-white/40">m</span>
            </p>
          </div>
        </div>
      </div>

      {/* Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0a0a0a] border border-white/10 h-96 flex flex-col p-8">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-6">Recent Activity</h3>
          {expeditions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-white/30 text-center">
              <Activity className="w-8 h-8 mb-4 opacity-50" />
              <p className="text-xs uppercase tracking-widest">No activity yet</p>
            </div>
          ) : (
            <div className="flex-1 overflow-auto pr-2 space-y-4 custom-scrollbar">
              {expeditions.slice(0, 5).map(exp => (
                <Link key={exp.id} href={`/admin/editor/${exp.id}`} className="block group">
                  <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all">
                    <div className="w-20 h-14 bg-black overflow-hidden shrink-0">
                      {exp.heroImage ? (
                        <img src={exp.heroImage} alt={exp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center border border-white/10"><Map className="w-4 h-4 text-white/20" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate group-hover:text-white/80 transition-colors uppercase tracking-wider">{exp.title || "Untitled"}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{exp.date}</p>
                    </div>
                    <div className="shrink-0">
                      <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 border ${
                        exp.status === 'completed' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 
                        exp.status === 'future' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : 'border-white/20 text-white/50 bg-white/5'
                      }`}>
                        {exp.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="bg-[#0a0a0a] border border-white/10 h-96 flex flex-col items-center justify-center">
          <Map className="w-8 h-8 text-white/10 mb-4" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">3D Terrain Map coming soon</p>
        </div>
      </div>

    </div>
  );
}
