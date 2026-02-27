"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, X, CheckCircle, Film, AlertCircle } from "lucide-react";
import { requestBooking } from "./actions";
import Link from "next/link";

export default function BookingWidget({ 
  projects, 
  listingId, 
  pricePerDay, 
  userId 
}: { 
  projects: any[], 
  listingId: string, 
  pricePerDay: number, 
  userId: string | null 
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  // LIVE MATH ENGINE: Instantly recalculates when dates change
  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 1;
  }, [startDate, endDate]);

  const subtotal = pricePerDay * rentalDays;
  const serviceFee = subtotal * 0.1; // 10% Kader Fee
  const total = subtotal + serviceFee;

  const handleOpenModal = () => {
    if (!startDate || !endDate) {
      alert("Please select your Pick-Up and Drop-Off dates first.");
      return;
    }
    setIsOpen(true);
    setErrorMessage(null);
    setSuccess(false);
  };

  return (
    <div className="sticky top-32 bg-zinc-900/50 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <div className="flex items-end gap-2 mb-6">
        <span className="text-4xl font-black text-white">{pricePerDay}</span>
        <span className="text-zinc-400 font-medium mb-1">BHD <span className="text-sm font-normal">/ day</span></span>
      </div>

      {/* LIVE DATE PICKERS */}
      <div className="border border-white/10 rounded-xl overflow-hidden mb-6 flex flex-col bg-black/50">
        <div className="flex border-b border-white/10">
          <div className="flex-1 p-3 border-r border-white/10 focus-within:bg-white/5 transition-colors">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Pick Up</label>
            <input 
              type="date" 
              min={today}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-white focus:outline-none cursor-none scheme-dark" 
            />
          </div>
          <div className="flex-1 p-3 focus-within:bg-white/5 transition-colors">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Drop Off</label>
            <input 
              type="date" 
              min={startDate || today}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-white focus:outline-none cursor-none scheme-dark" 
            />
          </div>
        </div>
      </div>

      {/* ACTION BUTTON */}
      {userId ? (
        <button 
          onClick={handleOpenModal}
          className="w-full bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-lg rounded-xl px-6 py-4 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/25 mb-6 cursor-none flex items-center justify-center gap-2"
        >
          <CalendarDays className="w-5 h-5" /> Request to Book
        </button>
      ) : (
        <Link href="/">
          <button className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-xl px-6 py-4 transition-all mb-6 cursor-none block text-center">
            Log in to Book
          </button>
        </Link>
      )}

      {/* LIVE RECEIPT MATH */}
      <div className="space-y-3 text-sm border-b border-white/10 pb-6 mb-6">
        <div className="flex justify-between text-zinc-400">
          <span>{pricePerDay} BHD x {rentalDays} {rentalDays === 1 ? 'day' : 'days'}</span>
          <span className="text-white font-medium">{subtotal.toFixed(2)} BHD</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span className="underline decoration-white/20 underline-offset-4">Kader Escrow Fee</span>
          <span className="text-white font-medium">{serviceFee.toFixed(2)} BHD</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-lg font-bold text-white">
        <span>Total Estimated</span>
        <span className="text-amber-400">{total.toFixed(2)} BHD</span>
      </div>

      {/* THE CINEMATIC MODAL (Hidden until button is clicked) */}
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
                      <Film className="w-5 h-5 text-amber-500" /> Link to Production
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
                    {/* HIDDEN INPUTS TO PASS THE LIVE DATES TO THE BACKEND */}
                    <input type="hidden" name="listingId" value={listingId} />
                    <input type="hidden" name="startDate" value={startDate} />
                    <input type="hidden" name="endDate" value={endDate} />

                    <div>
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Select Active Project</label>
                      {projects.length === 0 ? (
                        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                          You have no active projects. Create one in Mission Control first.
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
                      {loading ? "Verifying Math & Dates..." : `Commit ${total.toFixed(2)} BHD`}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center relative z-10">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Request Sent!</h2>
                  <p className="text-zinc-400">The owner will review your dates.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}