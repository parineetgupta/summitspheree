"use client";

import React, { useState } from "react";
import { ExpeditionMedia } from "@/types";
import { X, Play, Image as ImageIcon, Video as VideoIcon, Plus, Trash2 } from "lucide-react";

export function HubVisuals({ media, isOwner = false, onUpdate }: { media: ExpeditionMedia[], isOwner?: boolean, onUpdate?: (media: ExpeditionMedia[]) => void }) {
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');
  
  const images = media.filter(m => m.type === 'image');
  const videos = media.filter(m => m.type === 'video');

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const [isAddingMedia, setIsAddingMedia] = useState(false);
  const [newMediaForm, setNewMediaForm] = useState<{ url: string; title: string }>({ url: "", title: "" });

  const handleAddMedia = (type: "image" | "video") => {
    if (!newMediaForm.url || !onUpdate) return;
    const newMedia: ExpeditionMedia = {
      id: Math.random().toString(36).substring(7),
      type,
      url: newMediaForm.url,
      title: newMediaForm.title || "Untitled"
    };
    onUpdate([...media, newMedia]);
    setNewMediaForm({ url: "", title: "" });
    setIsAddingMedia(false);
  };

  const handleDeleteMedia = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdate) return;
    onUpdate(media.filter(m => m.id !== id));
  };

  if (media.length === 0 && !isOwner) return null;

  return (
    <section id="visuals" className="py-32 bg-[#050505] relative z-10 w-full text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-[10px] tracking-[0.4em] text-[#00D084] uppercase mb-4 font-semibold">
            The Archive
          </p>
          <h2 className="text-4xl md:text-6xl font-serif italic font-light tracking-tighter mb-12">
            Visuals
          </h2>

          {/* Premium Segmented Control */}
          <div className="inline-flex items-center p-1 bg-[#111] rounded-full border border-white/10">
            <button
              onClick={() => setActiveTab('images')}
              className={`flex items-center gap-2 px-8 py-3 rounded-full text-xs font-semibold tracking-widest uppercase transition-all duration-500 ${
                activeTab === 'images' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-[#6b7280] hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Images
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-2 px-8 py-3 rounded-full text-xs font-semibold tracking-widest uppercase transition-all duration-500 ${
                activeTab === 'videos' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-[#6b7280] hover:text-white'
              }`}
            >
              <VideoIcon className="w-4 h-4" />
              Videos
            </button>
          </div>

          {/* Owner Upload Button */}
          {isOwner && (
            <div className="mt-8">
              <button 
                onClick={() => setIsAddingMedia(true)}
                className="inline-flex items-center gap-2 px-6 py-2 border border-[#00D084]/50 text-[#00D084] hover:bg-[#00D084] hover:text-black rounded-full text-[10px] tracking-widest uppercase transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Media
              </button>
            </div>
          )}
        </div>

        {/* Content Area with simple opacity transition */}
        <div className="relative min-h-[50vh]">
          
          {/* IMAGES GRID */}
          <div className={`transition-opacity duration-700 ${activeTab === 'images' ? 'opacity-100 z-10' : 'opacity-0 absolute inset-0 pointer-events-none -z-10'}`}>
            {images.length > 0 ? (
              <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                {images.map((img, idx) => (
                  <div 
                    key={idx} 
                    className="relative break-inside-avoid group cursor-pointer overflow-hidden border border-white/5 bg-[#111]"
                    onClick={() => setLightboxIndex(idx)}
                  >
                    <img 
                      src={img.url} 
                      alt={`Gallery ${idx}`} 
                      className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                      <p className="text-white font-serif italic text-lg">{img.title || "Untamed Wilderness"}</p>
                      <p className="text-[9px] tracking-[0.2em] uppercase text-[#00D084] mt-2">View Photo</p>
                    </div>
                    {isOwner && (
                      <button 
                        onClick={(e) => handleDeleteMedia(img.id, e)}
                        className="absolute top-4 right-4 p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full py-24 flex flex-col items-center justify-center border border-white/5 bg-[#0a0a0a]">
                <p className="text-[#6b7280] text-xs tracking-widest uppercase mb-4">No images uploaded yet.</p>
              </div>
            )}
          </div>

          {/* VIDEOS GRID */}
          <div className={`transition-opacity duration-700 ${activeTab === 'videos' ? 'opacity-100 z-10' : 'opacity-0 absolute inset-0 pointer-events-none -z-10'}`}>
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {videos.map((vid, idx) => (
                  <div 
                    key={idx} 
                    className="group relative aspect-video bg-[#111] border border-white/10 cursor-pointer overflow-hidden flex items-center justify-center"
                    onClick={() => setActiveVideo(vid.url)}
                  >
                    <div className="absolute inset-0 bg-[#0a0a0a] z-0" />
                    <div className="relative z-10 w-16 h-16 rounded-full border border-white/20 flex items-center justify-center bg-black/40 group-hover:bg-white group-hover:text-black transition-all duration-700">
                      <Play className="w-6 h-6 ml-1 transition-colors" />
                    </div>
                    <div className="absolute bottom-6 left-6 z-10">
                      <p className="text-sm font-serif italic text-white/90">{vid.title || `Cinematic Cut 0${idx + 1}`}</p>
                    </div>
                    {isOwner && (
                      <button 
                        onClick={(e) => handleDeleteMedia(vid.id, e)}
                        className="absolute top-4 right-4 p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full py-24 flex flex-col items-center justify-center border border-white/5 bg-[#0a0a0a]">
                <p className="text-[#6b7280] text-xs tracking-widest uppercase mb-4">No videos uploaded yet.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12 backdrop-blur-sm">
          <button 
            onClick={() => setLightboxIndex(null)}
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[101]"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src={images[lightboxIndex].url} 
              alt="Fullscreen view" 
              className="max-w-full max-h-full object-contain shadow-2xl border border-white/10"
            />
          </div>
          <div className="absolute bottom-8 text-center w-full pointer-events-none">
            <p className="font-serif italic text-white/70 text-lg">
              {images[lightboxIndex].caption || `Capture 0${lightboxIndex + 1}`}
            </p>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-md">
          <button 
            onClick={() => setActiveVideo(null)}
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[101]"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="w-full max-w-6xl aspect-video bg-black relative px-4">
            <video 
              src={activeVideo} 
              controls 
              autoPlay 
              className="w-full h-full outline-none"
            />
          </div>
        </div>
      )}

      {/* Add Media Modal */}
      {isAddingMedia && isOwner && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md p-8 relative">
            <button 
              onClick={() => setIsAddingMedia(false)}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-serif italic mb-8 text-[#00D084]">Add Media</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#6b7280] mb-2">Media URL</label>
                <input 
                  type="text" 
                  value={newMediaForm.url}
                  onChange={e => setNewMediaForm({...newMediaForm, url: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-[#00D084] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#6b7280] mb-2">Title / Caption</label>
                <input 
                  type="text" 
                  value={newMediaForm.title}
                  onChange={e => setNewMediaForm({...newMediaForm, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-[#00D084] transition-colors"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button 
                onClick={() => handleAddMedia('image')}
                className="flex-1 py-3 border border-white/20 text-white hover:bg-white hover:text-black transition-colors text-[10px] tracking-widest uppercase font-bold"
              >
                Add Image
              </button>
              <button 
                onClick={() => handleAddMedia('video')}
                className="flex-1 py-3 border border-[#00D084]/50 text-[#00D084] hover:bg-[#00D084] hover:text-black transition-colors text-[10px] tracking-widest uppercase font-bold"
              >
                Add Video
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
