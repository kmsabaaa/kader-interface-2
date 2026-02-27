'use client';

import { useActionState } from 'react';
import { MapPin, Sun, Zap, VolumeX, ShieldCheck, Save, FileText, AlertCircle, CheckCircle } from "lucide-react";

interface LocationProfile {
  address?: string | null;
  typeOfLocation?: string | null;
  sqftArea?: string | null;
  sunDirection?: string | null;
  powerSupply?: string | null;
  soundConditions?: string | null;
  lightingConditions?: string | null;
  parkingLink?: string | null;
  permitStatus?: string | null;
  restrictions?: string | null;
}

interface Props {
  listing: { id: string; title: string };
  profile: LocationProfile | null;
  saveAction: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
}

export default function ScoutReportForm({ listing, profile, saveAction }: Props) {
  const [state, formAction, isPending] = useActionState(
    saveAction as any,
    { success: undefined, error: undefined }
  );

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans pt-20 pb-24 selection:bg-emerald-500/30">
      <div className="max-w-200 mx-auto px-6">
        
        <div className="mb-10 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-bold tracking-wider mb-4">
              <FileText className="w-4 h-4" /> Kader Tech Scout Report
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white">{listing.title}</h1>
            <p className="text-zinc-400 mt-2">Location ID: <span className="font-mono text-xs">{listing.id}</span></p>
          </div>
        </div>

        {/* Error Alert */}
        {state.error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-400">Error Saving Report</p>
              <p className="text-red-300 text-sm">{state.error}</p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {state.success && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex gap-3 items-start animate-in fade-in slide-in-from-top">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-400">Scout Report Saved</p>
              <p className="text-emerald-300 text-sm">Your technical assessment is now live for producers.</p>
            </div>
          </div>
        )}

        <form action={formAction} className="space-y-10">
          
          {/* SECTION 1: Logistics */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-emerald-400">
              <MapPin className="w-5 h-5" /> Basic Logistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Address / Area</label>
                <input name="address" defaultValue={profile?.address || ""} placeholder="e.g. Block 338, Bahrain Bay" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 transition-colors outline-none" disabled={isPending} />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Type of Location</label>
                <input name="typeOfLocation" defaultValue={profile?.typeOfLocation || ""} placeholder="e.g. Modern Corporate Office" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 transition-colors outline-none" disabled={isPending} />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Size & Capacity</label>
                <input name="sqftArea" defaultValue={profile?.sqftArea || ""} placeholder="e.g. Fits 30 crew, high ceilings" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 transition-colors outline-none" disabled={isPending} />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Parking Link (Google Maps)</label>
                <input name="parkingLink" defaultValue={profile?.parkingLink || ""} placeholder="https://maps.app.goo.gl/..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 transition-colors outline-none" disabled={isPending} />
              </div>
            </div>
          </div>

          {/* SECTION 2: Technicals */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-amber-400">
              <Zap className="w-5 h-5" /> Technical Assessment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Sun className="w-3 h-3"/> Sun Direction</label>
                <input name="sunDirection" defaultValue={profile?.sunDirection || ""} placeholder="e.g. Direct East sunlight at 8 AM" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 transition-colors outline-none" disabled={isPending} />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Zap className="w-3 h-3"/> Power Supply</label>
                <input name="powerSupply" defaultValue={profile?.powerSupply || ""} placeholder="e.g. Standard 13A UK plugs only" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 transition-colors outline-none" disabled={isPending} />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1"><VolumeX className="w-3 h-3"/> Sound Conditions</label>
                <input name="soundConditions" defaultValue={profile?.soundConditions || ""} placeholder="e.g. Heavy AC hum, un-switchable. Next to main highway." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 transition-colors outline-none" disabled={isPending} />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Available Practical Lighting</label>
                <input name="lightingConditions" defaultValue={profile?.lightingConditions || ""} placeholder="e.g. Warm 3200k LEDs embedded in ceiling" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 transition-colors outline-none" disabled={isPending} />
              </div>
            </div>
          </div>

          {/* SECTION 3: Legal */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-blue-400">
              <ShieldCheck className="w-5 h-5" /> Permissions & Rules
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Permit Status</label>
                <select name="permitStatus" defaultValue={profile?.permitStatus || "Pending"} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 transition-colors outline-none appearance-none" disabled={isPending}>
                  <option value="Not Required">Not Required</option>
                  <option value="Pending">Pending Assessment</option>
                  <option value="Acquired">Acquired / Verified</option>
                  <option value="Requires Government Clearance">Requires Government Clearance</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Restrictions & Notes</label>
                <textarea name="restrictions" defaultValue={profile?.restrictions || ""} rows={4} placeholder="e.g. No smoke machines. Floor must be protected from heavy stands. Wrap strictly by 10 PM." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 transition-colors outline-none resize-none" disabled={isPending} />
              </div>
            </div>
          </div>

          {/* Fixed Submit Footer */}
          <div className="sticky bottom-10 bg-black/80 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-4 flex justify-between items-center shadow-[0_0_50px_rgba(16,185,129,0.15)]">
            <p className="text-zinc-400 text-sm hidden md:block">Saving pushes data live to the Producer's view.</p>
            <button type="submit" disabled={isPending} className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-600 disabled:cursor-not-allowed text-black disabled:text-zinc-400 font-bold rounded-xl px-8 py-3 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
              {isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-emerald-400 rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Save Scout Report
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
