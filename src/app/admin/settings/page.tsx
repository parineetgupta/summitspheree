"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { getUserProfile, updateUserProfile } from "@/firebase/db";
import { UserProfile } from "@/types";
import { CloudinaryUpload } from "@/components/admin/CloudinaryUpload";
import { Save, User, Camera } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      const data = await getUserProfile(user.uid);
      if (data) {
        setProfile(data);
      } else {
        setProfile({
          userId: user.uid,
          displayName: user.displayName || "",
          username: "",
          bio: "",
          profilePhoto: user.photoURL || "",
          isPublic: true
        });
      }
      setLoading(false);
    };
    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaveStatus("saving");
    try {
      if (profile.id) {
        await updateUserProfile(profile.id, profile);
      } else {
        // Just rely on the updateUserProfile internal logic if we handle creation elsewhere, 
        // or ensure db.ts handles upserting.
        await updateUserProfile(user.uid, profile); 
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (e) {
      setSaveStatus("error");
    }
  };

  const handlePhotoUpload = (url: string) => {
    setProfile(prev => ({ ...prev, profilePhoto: url }));
  };

  if (loading) return <div className="p-8 max-w-4xl mx-auto font-sans tracking-widest uppercase text-sm">Loading Settings...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      
      <div className="mb-12">
        <h2 className="text-sm font-bold text-white mb-2 tracking-widest uppercase">Profile Settings</h2>
        <p className="text-[10px] tracking-widest uppercase text-white/50">Manage your public persona and account details.</p>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 overflow-hidden mb-8">
        <div className="p-8 border-b border-white/10">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Public Profile</h3>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 shrink-0">
              <CloudinaryUpload 
                onUploadSuccess={handlePhotoUpload}
                className="w-32 h-32 rounded-full border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center gap-2 hover:border-white/50 hover:bg-white/10 transition-all cursor-pointer overflow-hidden relative group"
              >
                {profile.profilePhoto ? (
                  <>
                    <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </>
                ) : (
                  <>
                    <User className="w-8 h-8 text-white/30" />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-white/50">Upload</span>
                  </>
                )}
              </CloudinaryUpload>
            </div>

            <div className="flex-1 space-y-6 w-full">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Display Name</label>
                <input 
                  type="text" 
                  value={profile.displayName || ""}
                  onChange={e => setProfile({...profile, displayName: e.target.value})}
                  className="w-full bg-transparent border-b border-white/10 focus:border-white text-lg text-white pb-2 px-0 focus:ring-0 placeholder:text-white/20 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Username</label>
                <div className="flex items-center">
                  <span className="text-white/30 text-lg mr-1 border-b border-white/10 pb-2">@</span>
                  <input 
                    type="text" 
                    value={profile.username || ""}
                    onChange={e => setProfile({...profile, username: e.target.value})}
                    className="w-full bg-transparent border-b border-white/10 focus:border-white text-lg text-white pb-2 px-0 focus:ring-0 placeholder:text-white/20 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Bio</label>
                <textarea 
                  value={profile.bio || ""}
                  onChange={e => setProfile({...profile, bio: e.target.value})}
                  rows={4}
                  placeholder="Tell the world about your mountaineering journey..."
                  className="w-full bg-transparent border border-white/10 rounded-none p-4 text-sm text-white focus:border-white focus:ring-0 resize-none placeholder:text-white/20 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-black">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-1">Profile Visibility</h3>
              <p className="text-[10px] uppercase tracking-widest text-white/50">Make your journey accessible to the public at summitsphere.com/@{profile.username || "username"}</p>
            </div>
            <button 
              onClick={() => setProfile({...profile, isPublic: !profile.isPublic})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.isPublic ? 'bg-white' : 'bg-white/20'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${profile.isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {saveStatus === "saving" && <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 animate-pulse">Saving changes...</span>}
          {saveStatus === "saved" && <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Changes saved securely</span>}
          {saveStatus === "error" && <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Error saving changes</span>}
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className="flex items-center gap-2 bg-white text-black px-6 py-3 font-bold text-[10px] tracking-widest uppercase hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </button>
      </div>

    </div>
  );
}
