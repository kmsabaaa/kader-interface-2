"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, MapPin, ArrowRight, ChevronLeft } from "lucide-react";
import { createNewListing } from "./actions";

// UPLOADTHING IMPORTS
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "../api/uploadthing/core";
import "@uploadthing/react/styles.css";

export default function NewListingModal() {
  const[isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); 
  const [listingType, setListingType] = useState<"EQUIPMENT" | "LOCATION">("EQUIPMENT");
  
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const resetModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStep(1);
      setImageUrl(null); 
    }, 300);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-white/5 border border-white/10 hover:border-white/20 text-white font-bold rounded-xl px-6 py-3 flex items-center gap-2 transition-all"
      >
        <Camera className="w-5 h-5" /> List Asset
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-999 flex items-center justify-center px-4 overflow-y-auto pt-20 pb-20">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => !loading && resetModal()}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-2xl p-6 md:p-8 overflow-hidden my-auto"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                {step === 2 ? (
                  <button onClick={() => setStep(1)} className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors text-sm font-bold">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                ) : (
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    Add Physical Asset
                  </h2>
                )}
                <button disabled={loading} onClick={resetModal} className="text-zinc-500 hover:text-white transition-colors ml-auto">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {step === 1 && (
                <div className="relative z-10">
                  <p className="text-zinc-400 mb-6">What type of asset are you listing on Kader?</p>
                  <div className="space-y-3">
                    <button onClick={() => { setListingType("EQUIPMENT"); setStep(2); }} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group text-left">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                          <Camera className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-lg">Cinema Equipment</h4>
                          <p className="text-zinc-400 text-sm">Cameras, lenses, lighting, grip.</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                    </button>

                    <button onClick={() => { setListingType("LOCATION"); setStep(2); }} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group text-left">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-lg">Shooting Location</h4>
                          <p className="text-zinc-400 text-sm">Studios, Helipads, Villas.</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <form 
                  action={async (formData) => {
                    setLoading(true);
                    await createNewListing(formData);
                    setLoading(false);
                    resetModal();
                  }}
                  className="flex flex-col gap-5 relative z-10"
                >
                  <input type="hidden" name="type" value={listingType} />
                  <input type="hidden" name="imageUrl" value={imageUrl || ""} />

                  {/* TYPESCRIPT FIX: ADDED EXACT ENDPOINT STRING "imageUploader" */}
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
                      Upload High-Res Photo
                    </label>
                    
                    {!imageUrl ? (
                      <UploadDropzone<OurFileRouter, "imageUploader">
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          if (res && res.length > 0) {
                            setImageUrl(res[0].url);
                          }
                        }}
                        onUploadError={(error: Error) => {
                          alert(`Cloud Upload Error: ${error.message}`);
                        }}
                        appearance={{
                          container: "border border-dashed border-white/20 bg-black/50 hover:bg-white/5 transition-colors p-8 rounded-xl",
                          label: "text-blue-500 font-bold",
                          allowedContent: "text-zinc-500 text-xs",
                          button: "bg-blue-500 text-white font-bold",
                        }}
                      />
                    ) : (
                      <div className="relative w-full h-48 rounded-xl border border-white/20 overflow-hidden group">
                        <img src={imageUrl} alt="Uploaded" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            type="button" 
                            onClick={() => setImageUrl(null)} 
                            className="bg-red-500 text-white font-bold px-4 py-2 rounded-lg text-sm"
                          >
                            Remove Photo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">
                      {listingType === "EQUIPMENT" ? "Gear Name & Model" : "Location Title"}
                    </label>
                    <input name="title" required placeholder={listingType === "EQUIPMENT" ? "e.g. ARRI Alexa Mini LF" : "e.g. Manama Skyline Helipad"} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">
                      {listingType === "EQUIPMENT" ? "Specs & Included Items" : "Location Rules & Access"}
                    </label>
                    <textarea name="description" required rows={3} placeholder={listingType === "EQUIPMENT" ? "e.g. PL Mount, includes 3 batteries..." : "e.g. 360 views, available from 6AM to 6PM..."} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none" />
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Daily Rate (BHD)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-blue-500">BD</span>
                      <input name="pricePerDay" type="number" required placeholder="150" className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors" />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="mt-2 w-full bg-white text-black font-bold rounded-xl px-6 py-3 transition-all hover:bg-blue-400 active:scale-[0.98] disabled:opacity-50">
                    {loading ? "Publishing..." : "Publish Asset"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}