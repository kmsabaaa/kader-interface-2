"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, X } from "lucide-react";
import { createNewService } from "./actions";

export default function NewServiceModal() {
  const[isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-500 font-bold rounded-xl px-6 py-3 flex items-center gap-2 transition-all cursor-none"
      >
          <Briefcase className="w-5 h-5" /> Add Service
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-999 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => !loading && setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-none"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-2xl p-6 md:p-8 overflow-hidden cursor-none"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-500" /> Offer a Service
                </h2>
                <button disabled={loading} onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors cursor-none">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                action={async (formData) => {
                  setLoading(true);
                  await createNewService(formData);
                  setLoading(false);
                  setIsOpen(false);
                }}
                className="flex flex-col gap-5 relative z-10"
              >
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Service Title</label>
                  <input name="title" required autoFocus placeholder="e.g. Commercial Drone Piloting" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors cursor-none" />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Details & Deliverables</label>
                  <textarea name="description" required rows={3} placeholder="e.g. Includes up to 4 hours of flight time and raw 4K footage delivery..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors cursor-none resize-none" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Daily Rate (BHD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-amber-500">BD</span>
                    <input name="pricePerDay" type="number" required placeholder="150" className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors cursor-none" />
                  </div>
                </div>

                  <button type="submit" disabled={loading} className="mt-2 w-full bg-amber-500 text-black font-bold rounded-xl px-6 py-3 transition-all hover:bg-amber-400 active:scale-[0.98] disabled:opacity-50">
                  {loading ? "Publishing..." : "Add to My Roster"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}