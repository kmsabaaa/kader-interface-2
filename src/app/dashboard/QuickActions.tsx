'use client';

import { Camera, MapPin, Sparkles, Plus } from 'lucide-react';
import { useState } from 'react';
import NewListingModal from './NewListingModal';

export default function QuickActions({ isProvider }: { isProvider: boolean }) {
  if (!isProvider) return null;

  return (
    <div className="mb-12">
      <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
        <Sparkles className="w-3 h-3" /> Quick Workspace Actions
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ACTION: LIST GEAR */}
        <div className="group relative bg-zinc-900/40 border border-white/5 rounded-3xl p-6 hover:border-amber-500/30 transition-all duration-500 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[40px] group-hover:bg-amber-500/10 transition-colors"></div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Camera className="w-7 h-7" />
            </div>
            <div className="grow">
              <h3 className="text-xl font-bold text-white mb-1">List Cinema Gear</h3>
              <p className="text-zinc-500 text-sm">Cameras, lenses, lighting, and audio kits.</p>
            </div>
            <NewListingModal />
          </div>
        </div>

        {/* ACTION: LIST LOCATION */}
        <div className="group relative bg-zinc-900/40 border border-white/5 rounded-3xl p-6 hover:border-emerald-500/30 transition-all duration-500 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] group-hover:bg-emerald-500/10 transition-colors"></div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <MapPin className="w-7 h-7" />
            </div>
            <div className="grow">
              <h3 className="text-xl font-bold text-white mb-1">List a Location</h3>
              <p className="text-zinc-500 text-sm">Studios, villas, rooftops, and urban sets.</p>
            </div>
            <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
