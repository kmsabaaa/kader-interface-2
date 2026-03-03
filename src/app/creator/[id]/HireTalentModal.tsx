"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, X, CheckCircle, Film, AlertCircle, CalendarDays } from "lucide-react";
import { hireTalent } from "./actions";

export default function HireTalentModal({
  creatorId,
  creatorName,
  services,
  projects,
}: {
  creatorId: string;
  creatorName: string;
  services: { id: string; title: string; pricePerDay: number }[];
  projects: { id: string; title: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const selectedServiceData = services.find((s) => s.id === selectedService);

  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 1;
  }, [startDate, endDate]);

  const total = selectedServiceData
    ? selectedServiceData.pricePerDay * rentalDays * 1.1
    : 0;

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          setErrorMessage(null);
          setSuccess(false);
        }}
        className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(245,158,11,0.2)] active:scale-[0.98] transition-all"
      >
        <Mail className="w-5 h-5" /> Hire this Talent
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => !loading && setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-2xl p-6 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] pointer-events-none" />

              {!success ? (
                <>
                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Film className="w-5 h-5 text-amber-500" /> Hire {creatorName}
                    </h2>
                    <button
                      disabled={loading}
                      onClick={() => setIsOpen(false)}
                      className="text-zinc-500 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {errorMessage && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 relative z-10">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-400 font-medium leading-relaxed">
                        {errorMessage}
                      </p>
                    </div>
                  )}

                  <form
                    action={async (formData) => {
                      setLoading(true);
                      setErrorMessage(null);
                      const response = await hireTalent(formData);
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
                    <input type="hidden" name="creatorId" value={creatorId} />

                    {/* SERVICE SELECTION */}
                    <div>
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
                        Select Service
                      </label>
                      {services.length === 0 ? (
                        <p className="text-sm text-zinc-500 bg-zinc-900 border border-white/10 rounded-xl p-4">
                          This creator has not listed any services yet. Contact them directly.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                          {services.map((svc) => (
                            <label
                              key={svc.id}
                              className="flex items-center justify-between gap-3 p-3 rounded-xl border border-white/10 hover:border-amber-500/50 bg-black/50 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="serviceId"
                                  value={svc.id}
                                  required
                                  onChange={() => setSelectedService(svc.id)}
                                  className="accent-amber-500 w-4 h-4"
                                />
                                <span className="text-white font-medium">{svc.title}</span>
                              </div>
                              <span className="text-amber-400 text-sm font-bold shrink-0">
                                {svc.pricePerDay} BHD/day
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* DATE RANGE */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          required
                          min={today}
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors scheme-dark"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
                          End Date
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          required
                          min={startDate || today}
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors scheme-dark"
                        />
                      </div>
                    </div>

                    {/* HIRE WITH ICON */}
                    <div className="flex items-center gap-2 text-zinc-400 text-xs">
                      <CalendarDays className="w-4 h-4 shrink-0 text-amber-500" />
                      <span>
                        {rentalDays} {rentalDays === 1 ? "day" : "days"}
                        {selectedServiceData && (
                          <> — Est. total:{" "}
                            <span className="text-amber-400 font-bold">
                              {total.toFixed(2)} BHD
                            </span>{" "}
                            (incl. 10% fee)
                          </>
                        )}
                      </span>
                    </div>

                    {/* PROJECT SELECTION */}
                    <div>
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
                        Link to Project
                      </label>
                      {projects.length === 0 ? (
                        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                          You have no active projects. <a href="/dashboard?tab=projects" className="underline hover:text-red-300">Create one in Mission Control first.</a>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                          {projects.map((project) => (
                            <label
                              key={project.id}
                              className="flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:border-amber-500/50 bg-black/50 transition-colors cursor-pointer"
                            >
                              <input
                                type="radio"
                                name="projectId"
                                value={project.id}
                                required
                                className="accent-amber-500 w-4 h-4"
                              />
                              <span className="text-white font-medium">{project.title}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading || services.length === 0 || projects.length === 0}
                      className="mt-2 w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold rounded-xl px-6 py-3 transition-all active:scale-[0.98]"
                    >
                      {loading ? "Sending Request..." : "Send Hire Request"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center relative z-10">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Request Sent!</h2>
                  <p className="text-zinc-400">
                    {creatorName} will be notified. Monitor Mission Control for updates.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
