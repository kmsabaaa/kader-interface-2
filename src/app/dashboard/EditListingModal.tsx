"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, X, Save } from "lucide-react";
import { updateListing } from "./actions";

interface EditListingModalProps {
  listing: {
    id: string;
    title: string;
    description: string | null;
    pricePerDay: number;
  };
}

export default function EditListingModal({ listing }: EditListingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all border border-white/5"
      >
        <Edit3 className="w-3.5 h-3.5" /> Edit
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !loading && setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-2xl p-6 md:p-8 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] pointer-events-none" />

              <div className="flex justify-between items-center mb-6 relative z-10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-500" /> Edit Asset
                </h2>
                <button
                  disabled={loading}
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                action={async (formData) => {
                  setLoading(true);
                  try {
                    await updateListing(listing.id, formData);
                    setIsOpen(false);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="flex flex-col gap-5 relative z-10"
              >
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">
                    Asset Name
                  </label>
                  <input
                    name="title"
                    required
                    defaultValue={listing.title}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={listing.description || ""}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">
                    Daily Rate (BHD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-amber-500">
                      BD
                    </span>
                    <input
                      name="pricePerDay"
                      type="number"
                      required
                      defaultValue={listing.pricePerDay.toString()}
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full bg-white text-black font-bold rounded-xl px-6 py-3 transition-all hover:bg-amber-400 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-amber-500 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Changes
                    </>
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
