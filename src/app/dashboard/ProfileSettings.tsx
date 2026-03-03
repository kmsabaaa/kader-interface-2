'use client';

import { useState } from 'react';
import { updateCreatorProfile } from './actions';
import { User, Instagram, Linkedin, Globe, MapPin, Video, Save } from 'lucide-react';

export default function ProfileSettings({ user, isProvider }: { user: any; isProvider: boolean }) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{isProvider ? "Creator Identity" : "Account Profile"}</h2>
            <p className="text-zinc-500 text-sm font-medium">
              {isProvider
                ? "Control how you appear to directors and producers."
                : "Manage your profile and account preferences."}
            </p>
          </div>
        </div>

        <form 
          action={async (formData) => {
            setLoading(true);
            await updateCreatorProfile(formData);
            setLoading(false);
            alert("Profile updated successfully!");
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Professional Title</label>
              <div className="relative">
                <input 
                  name="creatorTitle" 
                  defaultValue={user?.creatorTitle || ""} 
                  placeholder="e.g. Cinematic DOP"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 transition-colors outline-none text-sm font-medium"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Base Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
                <input 
                  name="location" 
                  defaultValue={user?.location || ""} 
                  placeholder="e.g. Manama, Bahrain"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:border-amber-500/50 transition-colors outline-none text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Cinematic Showreel (Vimeo/YouTube)</label>
            <div className="relative">
              <Video className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
              <input 
                name="showreelUrl" 
                type="url"
                defaultValue={user?.showreelUrl || ""} 
                placeholder="https://..."
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:border-amber-500/50 transition-colors outline-none text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">The Director's Bio</label>
            <textarea 
              name="creatorBio" 
              rows={4}
              defaultValue={user?.creatorBio || ""} 
              placeholder="Tell your story..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 transition-colors outline-none text-sm font-medium resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
             <div>
               <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Instagram</label>
               <input name="instagram" defaultValue={user?.instagram || ""} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs" />
             </div>
             <div>
               <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">LinkedIn</label>
               <input name="linkedin" defaultValue={user?.linkedin || ""} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs" />
             </div>
             <div>
               <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Personal Website</label>
               <input name="website" defaultValue={user?.website || ""} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs" />
             </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-amber-400 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Syncing..." : <><Save className="w-5 h-5" /> Update Master Profile</>}
          </button>
        </form>
      </div>
    </div>
  );
}
