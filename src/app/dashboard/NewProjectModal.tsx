"use client";

import { useState } from "react";
import { useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Film, AlertCircle } from "lucide-react";
import { createNewProject } from "./actions";

export default function NewProjectModal() {
  const [isOpen, setIsOpen] = useState(false);
  
  const [state, formAction, isPending] = useActionState(
    createNewProject as any,
    { success: null, error: undefined }
  );
  
  // Close modal on success
  if (state.success && isOpen) {
    setIsOpen(false);
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl px-6 py-3 flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/25"
      >
        <Plus className="w-5 h-5" /> New Project
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-999 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => !isPending && setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-2xl p-6 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-amber-500" /> Init Production
                </h2>
                <button disabled={isPending} onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors disabled:cursor-not-allowed">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {state.error && (
                <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex gap-2 items-start relative z-10">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">{state.error}</p>
                </div>
              )}

              <form 
                action={formAction}
                className="flex flex-col gap-5 relative z-10"
              >
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Project Title</label>
                  <input 
                    name="title" 
                    required 
                    autoFocus
                    disabled={isPending}
                    placeholder="e.g. Bahrain Bay Commercial" 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Estimated Budget (BHD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-amber-500">BD</span>
                    <input 
                      name="budget" 
                      type="number" 
                      required 
                      disabled={isPending}
                      placeholder="5000" 
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isPending}
                  className="mt-2 w-full bg-white hover:bg-amber-300 text-black disabled:bg-zinc-600 disabled:text-zinc-400 font-bold rounded-xl px-6 py-3 transition-all active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-amber-500 rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Deploy Project"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}