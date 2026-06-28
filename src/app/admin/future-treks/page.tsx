"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { getExpeditions, deleteExpedition } from "@/firebase/db";
import { Expedition } from "@/types";
import Link from "next/link";
import { Map, Clock, Calendar, Edit2, Trash2, Plus, Flag } from "lucide-react";

export default function FutureTreks() {
  const { user } = useAuth();
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const data = await getExpeditions(user.uid);
    setExpeditions(data.filter(e => e.status === "future"));
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this plan?")) {
      await deleteExpedition(id);
      loadData();
    }
  };

  const getDaysUntil = (dateStr: string) => {
    if (!dateStr) return null;
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diff = target - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  if (loading) return <div className="p-8 max-w-7xl mx-auto">Loading...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-sm font-bold text-white mb-2 tracking-widest uppercase">Future Treks</h2>
          <p className="text-[10px] tracking-widest uppercase text-white/50">Plan your upcoming expeditions and track countdowns.</p>
        </div>
        <Link 
          href="/admin/editor/new"
          className="flex items-center gap-2 bg-white hover:bg-white/90 text-black px-6 py-3 rounded-none font-bold text-[10px] tracking-widest uppercase transition-colors"
        >
          <Plus className="w-4 h-4" />
          Plan Expedition
        </Link>
      </div>

      {expeditions.length === 0 ? (
        <div className="bg-[#0a0a0a] p-12 border border-white/10 text-center">
          <Flag className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <h3 className="text-xs font-bold text-white mb-1 uppercase tracking-widest">No future treks planned</h3>
          <p className="text-white/40 text-[10px] uppercase tracking-widest">Start planning your next adventure today.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expeditions.map(exp => {
            const daysUntil = getDaysUntil(exp.date);
            return (
              <div key={exp.id} className="bg-[#0a0a0a] border border-white/10 p-6 flex flex-col relative overflow-hidden group hover:border-white/30 transition-colors">
                
                {daysUntil !== null && (
                  <div className="absolute top-0 right-0 bg-white/5 border-b border-l border-white/10 text-white/90 px-4 py-2 font-bold text-[10px] uppercase tracking-widest">
                    {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
                  </div>
                )}

                <div className="flex justify-between items-start mb-8 pr-20">
                  <div>
                    <h3 className="text-sm font-bold text-white line-clamp-1 uppercase tracking-widest">{exp.title || "Untitled Plan"}</h3>
                    <p className="text-[10px] text-white/50 flex items-center gap-1 mt-1 uppercase tracking-widest">
                      <Map className="w-3 h-3" /> {exp.location || "Location TBD"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex items-center gap-3 text-[10px] text-white/50 uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-bold">{exp.date || "Date TBD"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-white/50 uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-bold">{exp.duration ? `${exp.duration} days expected` : "Duration TBD"}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 border ${
                    exp.priority === 'high' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                    exp.priority === 'medium' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                    'border-white/20 text-white/50 bg-white/5'
                  }`}>
                    {exp.priority ? `${exp.priority} Priority` : 'No Priority'}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/editor/${exp.id}`} className="text-white/30 hover:text-white transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDelete(exp.id!)} className="text-white/30 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
