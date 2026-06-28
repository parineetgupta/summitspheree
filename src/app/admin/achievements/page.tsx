"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { getExpeditions } from "@/firebase/db";
import { Award, Target, Zap, Mountain, Map, ArrowUp } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isUnlocked: boolean;
  progress?: { current: number; target: number };
}

export default function Achievements() {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      const exps = await getExpeditions(user.uid);
      const completed = exps.filter(e => e.status === "completed");
      
      const totalDist = completed.reduce((sum, e) => sum + (Number(e.distance) || 0), 0);
      const totalElev = completed.reduce((sum, e) => sum + (Number(e.elevation) || 0), 0);
      const highest = completed.reduce((max, e) => Math.max(max, Number(e.elevation) || 0), 0);

      const calculatedMilestones: Milestone[] = [
        {
          id: "first_summit",
          title: "First Summit",
          description: "Complete your very first expedition.",
          icon: Mountain,
          isUnlocked: completed.length >= 1,
          progress: { current: completed.length, target: 1 }
        },
        {
          id: "five_peaks",
          title: "High Five",
          description: "Successfully summit 5 mountains.",
          icon: Target,
          isUnlocked: completed.length >= 5,
          progress: { current: completed.length, target: 5 }
        },
        {
          id: "century_hiker",
          title: "Century Hiker",
          description: "Cover 100 kilometers total distance.",
          icon: Map,
          isUnlocked: totalDist >= 100,
          progress: { current: Math.min(totalDist, 100), target: 100 }
        },
        {
          id: "vertical_mile",
          title: "The Vertical Mile",
          description: "Gain over 1,609 meters in total elevation.",
          icon: ArrowUp,
          isUnlocked: totalElev >= 1609,
          progress: { current: Math.min(totalElev, 1609), target: 1609 }
        },
        {
          id: "high_altitude",
          title: "Death Zone Bound",
          description: "Reach an elevation over 5,000 meters.",
          icon: Zap,
          isUnlocked: highest >= 5000,
          progress: { current: Math.min(highest, 5000), target: 5000 }
        }
      ];

      setMilestones(calculatedMilestones);
      setLoading(false);
    };
    loadData();
  }, [user]);

  if (loading) return <div className="p-8 max-w-7xl mx-auto">Loading achievements...</div>;

  const unlockedCount = milestones.filter(m => m.isUnlocked).length;

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h2 className="text-sm font-bold text-white mb-2 tracking-widest uppercase">Achievements</h2>
          <p className="text-[10px] tracking-widest uppercase text-white/50">Your milestones and outdoor progression.</p>
        </div>
        <div className="bg-[#0a0a0a] text-white/50 px-4 py-2 border border-white/10 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
          <Award className="w-4 h-4 text-white" />
          {unlockedCount} / {milestones.length} Unlocked
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {milestones.map(m => {
          const Icon = m.icon;
          return (
          <div key={m.id} className={`bg-[#0a0a0a] border p-6 flex flex-col relative overflow-hidden transition-all duration-500 group ${
            m.isUnlocked 
              ? 'border-white/20 hover:border-white/40' 
              : 'border-white/5 opacity-60 grayscale hover:opacity-80'
          }`}>
            
            <div className="flex items-start gap-5 mb-8 relative z-10">
              <div className={`w-14 h-14 border flex items-center justify-center shrink-0 transition-colors ${
                m.isUnlocked ? 'bg-white/10 border-white/20' : 'bg-black border-white/10'
              }`}>
                <Icon className={`w-6 h-6 ${m.isUnlocked ? 'text-white' : 'text-white/30'}`} />
              </div>
              <div>
                <h3 className={`text-sm font-bold uppercase tracking-widest ${m.isUnlocked ? 'text-white' : 'text-white/50'}`}>{m.title}</h3>
                <p className="text-[10px] text-white/50 mt-2 uppercase tracking-widest leading-relaxed">{m.description}</p>
              </div>
            </div>

            {m.progress && (
              <div className="mt-auto relative z-10 pt-4 border-t border-white/10">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-3">
                  <span className={m.isUnlocked ? 'text-white' : 'text-white/30'}>Progress</span>
                  <span className="text-white/50">{m.progress.current.toFixed(0)} / {m.progress.target}</span>
                </div>
                <div className="w-full h-1 bg-white/5 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${m.isUnlocked ? 'bg-white' : 'bg-white/30'}`} 
                    style={{ width: `${Math.min(100, (m.progress.current / m.progress.target) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}
