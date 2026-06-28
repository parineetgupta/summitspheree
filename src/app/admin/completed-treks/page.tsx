"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { getExpeditions, deleteExpedition } from "@/firebase/db";
import { Expedition } from "@/types";
import Link from "next/link";
import { Map, Clock, Navigation, MoreVertical, Edit2, Trash2, Search } from "lucide-react";

export default function CompletedTreks() {
  const { user } = useAuth();
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const data = await getExpeditions(user.uid);
    setExpeditions(data.filter(e => e.status === "completed"));
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this expedition?")) {
      await deleteExpedition(id);
      loadData();
    }
  };

  const filtered = expeditions.filter(e => 
    e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.mountain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-8 max-w-7xl mx-auto">Loading...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h2 className="text-sm font-bold text-white mb-2 tracking-widest uppercase">Completed Treks</h2>
          <p className="text-[10px] tracking-widest uppercase text-white/50">Your archive of successful expeditions.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input 
            type="text" 
            placeholder="Search expeditions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0a0a0a] border border-white/10 rounded-none text-xs text-white placeholder:text-white/30 focus:ring-0 focus:border-white transition-colors uppercase tracking-widest"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#0a0a0a] p-12 border border-white/10 text-center">
          <Map className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <h3 className="text-xs font-bold text-white mb-1 uppercase tracking-widest">No completed treks found</h3>
          <p className="text-white/40 text-[10px] uppercase tracking-widest">Publish an expedition from the editor to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(exp => (
            <div key={exp.id} className="bg-[#0a0a0a] border border-white/10 overflow-hidden flex flex-col group hover:border-white/30 transition-colors">
              <div className="aspect-[4/3] bg-black relative overflow-hidden shrink-0 border-b border-white/10">
                {exp.heroImage ? (
                  <img src={exp.heroImage} alt={exp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Map className="w-8 h-8 text-white/10" />
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                  {exp.date}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-white line-clamp-1 uppercase tracking-widest">{exp.title || "Untitled"}</h3>
                    <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">{exp.mountain || "Unknown Mountain"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/editor/${exp.id}`} className="text-white/30 hover:text-white transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDelete(exp.id!)} className="text-white/30 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-white/50">
                    <Navigation className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">{exp.elevation} <span className="text-white/30">m</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-white/50">
                    <Map className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">{exp.distance} <span className="text-white/30">km</span></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
