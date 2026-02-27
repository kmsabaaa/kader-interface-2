"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, X } from "lucide-react";
import { updateCreatorProfile } from "./actions";

export default function CreatorProfileModal({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold rounded-xl px-6 py-3 flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25"
      >
        <Users className="w-5 h-5" /> 
        {user?.isCreator ? "Edit Creator Profile" : "Become a Creator"}
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-999 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => !loading && setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-2xl p-6 md:p-8 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" /> Your Master Profile
                </h2>
                <button disabled={loading} onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                action={async (formData) => {
                  setLoading(true);
                  await updateCreatorProfile(formData);
                  setLoading(false);
                  setIsOpen(false);
                }}
                className="flex flex-col gap-5 relative z-10"
              >
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Professional Title</label>
                  <input 
                    name="creatorTitle" 
                    defaultValue={user?.creatorTitle || ""}
                    required 
                    placeholder="e.g. Senior Drone Pilot & DOP" 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors" 
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Showreel URL (Vimeo / YouTube)</label>
                  <input 
                    name="showreelUrl" 
                    type="url"
                    defaultValue={user?.showreelUrl || ""}
                    placeholder="https://vimeo.com/..." 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors" 
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Biography & Gear Owned</label>
                  <textarea 
                    name="creatorBio" 
                    required rows={4}
                    defaultValue={user?.creatorBio || ""}
                    placeholder="Tell producers about your experience, past clients, and the gear you bring to set..." 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors resize-none" 
                  />
                </div>
                
                <button type="submit" disabled={loading} className="mt-2 w-full bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl px-6 py-3 transition-all active:scale-[0.98] disabled:opacity-50">
                  {loading ? "Saving Profile..." : "Update Master Profile"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}