"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, X, CheckCircle, Film, AlertCircle } from "lucide-react";
import { requestBooking } from "./actions";

export default function BookModal({ projects, listingId }: { projects: any[], listingId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get today's date in YYYY-MM-DD format to prevent booking in the past
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <button 
        onClick={() => {
          setIsOpen(true);
          setErrorMessage(null);
          setSuccess(false);
        }}
        className="w-full bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-lg rounded-xl px-6 py-4 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/25 mb-6 cursor-none flex items-center justify-center gap-2"
      >
        <CalendarDays className="w-5 h-5" /> Request to Book
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-999 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-none"
              onClick={() => !loading && setIsOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-2xl p-6 overflow-hidden cursor-none"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] pointer-events-none"></div>
              
              {!success ? (
                <>
                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Film className="w-5 h-5 text-amber-500" /> Add to Call Sheet
                    </h2>
                    <button disabled={loading} onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors cursor-none">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {errorMessage && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 relative z-10">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-400 font-medium leading-relaxed">{errorMessage}</p>
                    </div>
                  )}

                  <form 
                    action={async (formData) => {
                      setLoading(true);
                      setErrorMessage(null);
                      
                      const response = await requestBooking(formData);
                      
                      if (response?.error) {
                        setErrorMessage(response.error);
                        setLoading(false);
                      } else {
                        setSuccess(true);
                        setLoading(false);
                        setTimeout(() => setIsOpen(false), 2000); 
                      }
                    }}
                    className="flex flex-col gap-5 relative z-10"
                  >
                    <input type="hidden" name="listingId" value={listingId} />

                    {/* NEW: Timeline Inputs */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Pick-up Date</label>
                        <input type="date" name="startDate" required min={today} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors cursor-none scheme-dark" />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Drop-off Date</label>
                        <input type="date" name="endDate" required min={today} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors cursor-none scheme-dark" />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Select Production</label>
                      {projects.length === 0 ? (
                        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                          You don't have any active projects. Please go to Mission Control to create one first.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                          {projects.map((project) => (
                            <label key={project.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:border-amber-500/50 bg-black/50 transition-colors">
                              <input type="radio" name="projectId" value={project.id} required className="accent-amber-500 w-4 h-4 cursor-none" />
                              <span className="text-white font-medium">{project.title}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading || projects.length === 0}
                      className="mt-4 w-full bg-white text-black font-bold rounded-xl px-6 py-3 transition-all hover:bg-amber-400 active:scale-[0.98] disabled:opacity-50 cursor-none"
                    >
                      {loading ? "Calculating Timeline..." : "Confirm Request"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center relative z-10">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Dates Secured!</h2>
                  <p className="text-zinc-400">Request sent to owner. Monitor Mission Control for approval.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}