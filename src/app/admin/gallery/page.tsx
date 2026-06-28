"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { getExpeditions } from "@/firebase/db";
import { ExpeditionMedia } from "@/types";
import { Image as ImageIcon, Video, Search } from "lucide-react";

interface GalleryItem extends ExpeditionMedia {
  expeditionId: string;
  expeditionTitle: string;
}

export default function Gallery() {
  const { user } = useAuth();
  const [media, setMedia] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      const exps = await getExpeditions(user.uid);
      const allMedia: GalleryItem[] = [];
      exps.forEach(exp => {
        if (exp.media) {
          exp.media.forEach(m => {
            allMedia.push({
              ...m,
              expeditionId: exp.id!,
              expeditionTitle: exp.title || "Untitled"
            });
          });
        }
      });
      setMedia(allMedia);
      setLoading(false);
    };
    loadData();
  }, [user]);

  const filteredMedia = media.filter(m => {
    if (filter !== "all" && m.type !== filter) return false;
    if (searchQuery && !m.expeditionTitle.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className="p-8 max-w-7xl mx-auto">Loading gallery...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h2 className="text-sm font-bold text-white mb-2 tracking-widest uppercase">Media Gallery</h2>
          <p className="text-[10px] tracking-widest uppercase text-white/50">All photos and videos from your expeditions.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Search by expedition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#0a0a0a] border border-white/10 rounded-none text-xs text-white placeholder:text-white/30 focus:ring-0 focus:border-white transition-colors uppercase tracking-widest"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="py-2 px-4 bg-[#0a0a0a] border border-white/10 rounded-none text-[10px] font-bold uppercase tracking-widest text-white focus:ring-0 focus:border-white transition-colors cursor-pointer"
          >
            <option value="all">All Media</option>
            <option value="image">Images Only</option>
            <option value="video">Videos Only</option>
          </select>
        </div>
      </div>

      {media.length === 0 ? (
        <div className="bg-[#0a0a0a] p-12 border border-white/10 text-center">
          <ImageIcon className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <h3 className="text-xs font-bold text-white mb-1 uppercase tracking-widest">No media found</h3>
          <p className="text-white/40 text-[10px] uppercase tracking-widest">Upload assets inside your expeditions to populate the gallery.</p>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {filteredMedia.map(m => (
            <div key={m.id} className="relative group break-inside-avoid overflow-hidden bg-[#0a0a0a] border border-white/10">
              {m.type === 'image' ? (
                <img src={m.url} alt="Gallery item" className="w-full h-auto block object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="relative">
                  <video src={m.url} className="w-full h-auto block object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 bg-black/50 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <p className="text-white font-bold text-xs uppercase tracking-widest line-clamp-1">{m.expeditionTitle}</p>
                <div className="flex items-center gap-2 text-white/50 mt-2 text-[10px] uppercase font-bold tracking-widest">
                  {m.type === 'image' ? <ImageIcon className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                  <span>{m.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
