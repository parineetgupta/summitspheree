"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { getExpeditionById, createExpedition, updateExpedition } from "@/firebase/db";
import { Expedition, ExpeditionMedia } from "@/types";
import { CloudinaryUpload } from "@/components/admin/CloudinaryUpload";
import { 
  ArrowLeft, Clock, Map, Image as ImageIcon, 
  Trash2, CheckCircle2, Navigation, Save, Video, Mountain, FileText, Wind, Search, LayoutGrid, Type, Globe, Lock
} from "lucide-react";
import Link from "next/link";
import { debounce } from "lodash";

const DEFAULT_EXPEDITION: Partial<Expedition> = {
  title: "",
  mountain: "",
  location: "",
  date: new Date().toISOString().split('T')[0],
  elevation: 0,
  distance: 0,
  duration: 0,
  conditions: "",
  journal: "",
  equipment: "",
  favoriteMoment: "",
  biggestChallenge: "",
  achievement: "",
  tags: [],
  heroImage: "",
  media: [],
  status: "draft",
  visibility: "private"
};

type TabId = 'basic' | 'media' | 'journal' | 'route' | 'weather' | 'equipment' | 'highlights';

export default function ExpeditionEditor({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const isNew = resolvedParams.id === "new";
  const { user } = useAuth();
  const router = useRouter();
  
  const [data, setData] = useState<Partial<Expedition>>(DEFAULT_EXPEDITION);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const [activeTab, setActiveTab] = useState<TabId>('basic');

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      if (!isNew) {
        const fetched = await getExpeditionById(resolvedParams.id);
        if (fetched && fetched.userId === user.uid) {
          setData(fetched);
        } else {
          router.push("/admin");
        }
      }
      setIsLoading(false);
    };
    loadData();
  }, [resolvedParams.id, isNew, user, router]);

  const debouncedSave = useCallback(
    debounce(async (saveData: Partial<Expedition>) => {
      setSaveStatus("saving");
      try {
        if (!isNew || saveData.id) {
          await updateExpedition(saveData.id || resolvedParams.id, saveData);
          setSaveStatus("saved");
        }
      } catch (err) {
        console.error("Autosave failed", err);
        setSaveStatus("error");
      }
    }, 1500),
    [isNew, resolvedParams.id]
  );

  const handleChange = (field: keyof Expedition, value: any) => {
    const updated = { ...data, [field]: value };
    setData(updated);
    if (!isNew || data.id) debouncedSave(updated);
  };

  const handleMediaUpload = (url: string, type: "image" | "video") => {
    const newMedia: ExpeditionMedia = { id: Date.now().toString(), url, type, title: "", caption: "" };
    const updatedMedia = [...(data.media || []), newMedia];
    const updatedHero = (!data.heroImage && type === 'image') ? url : data.heroImage;
    const updated = { ...data, media: updatedMedia, heroImage: updatedHero };
    setData(updated);
    if (!isNew || data.id) debouncedSave(updated);
  };

  const removeMedia = (mediaId: string) => {
    const updatedMedia = (data.media || []).filter(m => m.id !== mediaId);
    const updated = { ...data, media: updatedMedia };
    setData(updated);
    if (!isNew || data.id) debouncedSave(updated);
  };

  const updateMediaMeta = (mediaId: string, field: 'title' | 'caption', value: string) => {
    const updatedMedia = (data.media || []).map(m => m.id === mediaId ? { ...m, [field]: value } : m);
    const updated = { ...data, media: updatedMedia };
    setData(updated);
    if (!isNew || data.id) debouncedSave(updated);
  };

  const handleManualSave = async (status: "draft" | "completed" | "future") => {
    if (!user) return;
    setSaveStatus("saving");
    try {
      const payload = { ...data, userId: user.uid, status };
      if (isNew && !data.id) {
        const newId = await createExpedition(payload as any);
        setData({ ...payload, id: newId });
        router.push(`/admin/editor/${newId}`);
      } else {
        await updateExpedition(data.id || resolvedParams.id, payload);
        setSaveStatus("saved");
      }
    } catch (e) {
      setSaveStatus("error");
    }
  };

  if (isLoading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans tracking-widest uppercase text-sm">Initializing Studio...</div>;

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white overflow-hidden flex flex-col font-sans selection:bg-white/30 selection:text-white">
      
      {/* Top Navbar */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 shrink-0 bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-white/50 hover:text-white transition-colors flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Exit Studio</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <h1 className="text-sm font-bold tracking-widest uppercase text-white/90">
            {data.title || "Untitled Expedition"}
          </h1>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar: Tabs */}
        <div className="w-64 border-r border-white/10 flex flex-col shrink-0 bg-[#0a0a0a]">
          <div className="p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">Workspace</p>
            <nav className="space-y-1">
              {[
                { id: 'basic', label: 'Basic Info', icon: Mountain },
                { id: 'media', label: 'Media Studio', icon: LayoutGrid },
                { id: 'journal', label: 'Journal', icon: FileText },
                { id: 'route', label: 'Route Data', icon: Map },
                { id: 'weather', label: 'Weather', icon: Wind },
                { id: 'equipment', label: 'Equipment', icon: Search },
                { id: 'highlights', label: 'Highlights', icon: Type }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as TabId)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeTab === t.id 
                      ? 'bg-white/10 text-white shadow-inner shadow-white/5' 
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <t.icon className={`w-4 h-4 ${activeTab === t.id ? 'text-white' : 'text-white/30'}`} />
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Center Canvas: Active Tab Content */}
        <div className="flex-1 overflow-y-auto bg-[#050505] p-12 custom-scrollbar relative">
          <div className="max-w-4xl mx-auto space-y-12 pb-32">
            
            {activeTab === 'basic' && (
              <div className="space-y-10 animate-fade-in">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Expedition Title</label>
                  <input 
                    type="text" 
                    value={data.title || ""} 
                    onChange={e => handleChange("title", e.target.value)}
                    placeholder="Enter a cinematic title..." 
                    className="w-full bg-transparent border-b border-white/10 focus:border-white text-4xl font-light text-white pb-4 px-0 focus:ring-0 placeholder:text-white/20 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-12">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Mountain</label>
                    <input type="text" value={data.mountain || ""} onChange={e => handleChange("mountain", e.target.value)} placeholder="e.g., Matterhorn" className="w-full bg-transparent border-b border-white/10 focus:border-white text-lg text-white pb-2 px-0 focus:ring-0 placeholder:text-white/20 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Location / Range</label>
                    <input type="text" value={data.location || ""} onChange={e => handleChange("location", e.target.value)} placeholder="e.g., Pennine Alps, Switzerland" className="w-full bg-transparent border-b border-white/10 focus:border-white text-lg text-white pb-2 px-0 focus:ring-0 placeholder:text-white/20 transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-12">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Summit Date</label>
                    <input type="date" value={data.date || ""} onChange={e => handleChange("date", e.target.value)} className="w-full bg-transparent border-b border-white/10 focus:border-white text-lg text-white pb-2 px-0 focus:ring-0 transition-colors dark-calendar-icon" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Duration (Days)</label>
                    <input type="number" value={data.duration || 0} onChange={e => handleChange("duration", Number(e.target.value))} className="w-full bg-transparent border-b border-white/10 focus:border-white text-lg text-white pb-2 px-0 focus:ring-0 transition-colors" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="space-y-12 animate-fade-in">
                
                {/* Large Dropzone */}
                <CloudinaryUpload 
                  onUploadSuccess={handleMediaUpload}
                  className="w-full h-48 border border-dashed border-white/20 rounded-xl bg-white/5 flex flex-col items-center justify-center gap-4 hover:bg-white/10 hover:border-white/40 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <ImageIcon className="w-5 h-5 text-white/70" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium tracking-wide text-white">Drag & drop media here</p>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 mt-2">High-res JPEG, PNG, MP4</p>
                  </div>
                </CloudinaryUpload>

                {/* Media Grid */}
                {data.media && data.media.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Cinematic Assets ({data.media.length})</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {data.media.map(m => (
                        <div key={m.id} className="group relative bg-[#0a0a0a] rounded-xl border border-white/5 overflow-hidden transition-all hover:border-white/20">
                          
                          {/* Image/Video Preview */}
                          <div className="aspect-[16/10] relative overflow-hidden bg-black">
                            {m.type === 'image' ? (
                              <img src={m.url} alt="Media" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                              <div className="relative w-full h-full">
                                <video src={m.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur flex items-center justify-center border border-white/20"><Video className="w-5 h-5 text-white" /></div>
                                </div>
                              </div>
                            )}
                            
                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                              <div className="flex justify-between items-start">
                                {data.heroImage === m.url ? (
                                  <span className="bg-white text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm">Cover Image</span>
                                ) : m.type === 'image' ? (
                                  <button onClick={() => handleChange("heroImage", m.url)} className="bg-black/50 backdrop-blur text-white border border-white/20 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm hover:bg-white hover:text-black transition-colors">Set Cover</button>
                                ) : <div/>}
                                
                                <button onClick={() => removeMedia(m.id)} className="w-8 h-8 rounded-full bg-red-500/80 backdrop-blur text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Metadata Editors */}
                          <div className="p-4 space-y-3">
                            <input 
                              type="text" 
                              value={m.title || ""} 
                              onChange={(e) => updateMediaMeta(m.id, 'title', e.target.value)}
                              placeholder="Title (e.g. Dawn at Camp 3)" 
                              className="w-full bg-transparent border-b border-white/5 focus:border-white/30 text-sm text-white px-0 py-1 focus:ring-0 placeholder:text-white/20 transition-colors"
                            />
                            <input 
                              type="text" 
                              value={m.caption || ""} 
                              onChange={(e) => updateMediaMeta(m.id, 'caption', e.target.value)}
                              placeholder="Optional caption..." 
                              className="w-full bg-transparent border-b border-white/5 focus:border-white/30 text-xs text-white/60 px-0 py-1 focus:ring-0 placeholder:text-white/20 transition-colors"
                            />
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'journal' && (
              <div className="animate-fade-in h-full flex flex-col">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-8 text-center">The Documentary Journal</label>
                <textarea 
                  value={data.journal || ""}
                  onChange={(e) => handleChange("journal", e.target.value)}
                  placeholder="Begin writing your story..." 
                  className="w-full flex-1 min-h-[60vh] bg-transparent border-none text-xl text-white/90 leading-loose focus:ring-0 resize-none placeholder:text-white/10 font-serif custom-scrollbar"
                  spellCheck="false"
                />
              </div>
            )}

            {activeTab === 'route' && (
              <div className="space-y-12 animate-fade-in">
                <div className="grid grid-cols-2 gap-12">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Total Distance (KM)</label>
                    <input type="number" value={data.distance || 0} onChange={e => handleChange("distance", Number(e.target.value))} className="w-full bg-transparent border-b border-white/10 focus:border-white text-3xl font-light text-white pb-2 px-0 focus:ring-0 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Elevation Gained (M)</label>
                    <input type="number" value={data.elevation || 0} onChange={e => handleChange("elevation", Number(e.target.value))} className="w-full bg-transparent border-b border-white/10 focus:border-white text-3xl font-light text-white pb-2 px-0 focus:ring-0 transition-colors" />
                  </div>
                </div>
                <div className="p-8 border border-dashed border-white/10 rounded-xl flex items-center justify-center h-64 bg-white/5">
                  <div className="text-center">
                    <Navigation className="w-6 h-6 text-white/20 mx-auto mb-3" />
                    <p className="text-sm text-white/40 font-medium tracking-wide">GPX Map Import coming soon</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'weather' && (
              <div className="animate-fade-in space-y-8">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">Weather & Conditions</label>
                <textarea 
                  value={data.conditions || ""}
                  onChange={(e) => handleChange("conditions", e.target.value)}
                  placeholder="Detail the weather conditions (e.g. Whiteout at the summit, minus 20 degrees, high winds...)" 
                  className="w-full min-h-[300px] bg-transparent border border-white/10 rounded-xl p-6 text-lg text-white/80 leading-relaxed focus:ring-1 focus:ring-white/30 resize-none placeholder:text-white/20"
                />
              </div>
            )}

            {activeTab === 'equipment' && (
              <div className="animate-fade-in space-y-8">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">Key Equipment Log</label>
                <textarea 
                  value={data.equipment || ""}
                  onChange={(e) => handleChange("equipment", e.target.value)}
                  placeholder="List the essential gear that made this ascent possible..." 
                  className="w-full min-h-[300px] bg-transparent border border-white/10 rounded-xl p-6 text-lg text-white/80 leading-relaxed focus:ring-1 focus:ring-white/30 resize-none placeholder:text-white/20"
                />
              </div>
            )}

            {activeTab === 'highlights' && (
              <div className="animate-fade-in space-y-10">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Favorite Moment</label>
                  <textarea value={data.favoriteMoment || ""} onChange={(e) => handleChange("favoriteMoment", e.target.value)} rows={3} className="w-full bg-transparent border border-white/10 rounded-xl p-4 text-white focus:ring-1 focus:ring-white/30 resize-none placeholder:text-white/20" placeholder="e.g. Reaching the ridge line at sunrise..." />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Biggest Challenge</label>
                  <textarea value={data.biggestChallenge || ""} onChange={(e) => handleChange("biggestChallenge", e.target.value)} rows={3} className="w-full bg-transparent border border-white/10 rounded-xl p-4 text-white focus:ring-1 focus:ring-white/30 resize-none placeholder:text-white/20" placeholder="e.g. The final 300m push through deep snow..." />
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Sidebar: Publish Controls */}
        <div className="w-80 border-l border-white/10 shrink-0 bg-[#0a0a0a] flex flex-col justify-between">
          <div className="p-8 space-y-10">
            
            {/* Status & Sync */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">Sync Status</p>
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-lg border border-white/10">
                {saveStatus === "saving" && <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                {saveStatus === "saved" && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                {saveStatus === "error" && <div className="w-2 h-2 rounded-full bg-red-500" />}
                <span className="text-xs font-bold uppercase tracking-widest text-white/70">
                  {saveStatus === "saving" ? "Saving to cloud..." : saveStatus === "saved" ? "Saved securely" : "Save failed"}
                </span>
              </div>
            </div>

            {/* Visibility */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">Visibility</p>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleChange("visibility", "public")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold tracking-widest uppercase transition-all ${data.visibility === 'public' ? 'bg-white text-black' : 'bg-transparent border border-white/20 text-white/50 hover:text-white'}`}
                >
                  <Globe className="w-3 h-3" /> Public
                </button>
                <button 
                  onClick={() => handleChange("visibility", "private")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold tracking-widest uppercase transition-all ${data.visibility === 'private' ? 'bg-white text-black' : 'bg-transparent border border-white/20 text-white/50 hover:text-white'}`}
                >
                  <Lock className="w-3 h-3" /> Private
                </button>
              </div>
            </div>

          </div>

          <div className="p-8 space-y-4 border-t border-white/10 bg-black/50">
            <button 
              onClick={() => handleManualSave("draft")}
              className="w-full py-4 text-xs font-bold uppercase tracking-widest text-white border border-white/20 rounded-lg hover:bg-white hover:text-black transition-all duration-300"
            >
              Save as Draft
            </button>
            <button 
              onClick={() => handleManualSave("completed")}
              className="w-full py-4 text-xs font-bold uppercase tracking-widest bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-all duration-300 shadow-[0_0_20px_rgba(5,150,105,0.3)]"
            >
              Publish
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
