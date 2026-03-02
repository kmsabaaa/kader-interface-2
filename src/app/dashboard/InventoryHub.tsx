'use client';

import { useState } from 'react';
import { Camera, MapPin, Eye, EyeOff, Trash2, Edit3, MoreVertical, Plus } from 'lucide-react';
import Image from 'next/image';
import NewListingModal from './NewListingModal';

export default function InventoryHub({ listings }: { listings: any[] }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Mobile-Friendly Header with 'Add New' button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Asset Inventory</h2>
          <p className="text-zinc-500 text-sm">Manage your equipment and locations.</p>
        </div>
        <NewListingModal />
      </div>

      {/* Responsive Grid: 1 col on mobile, 2 on tablet, 3 on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {listings.length === 0 ? (
          <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl bg-zinc-900/20">
            <Camera className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">No assets found in your vault</p>
          </div>
        ) : (
          listings.map((item) => (
            <div key={item.id} className="group bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden hover:border-amber-500/30 transition-all duration-500 shadow-xl">
              {/* Image Section */}
              <div className="h-48 w-full bg-zinc-800 relative overflow-hidden">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700"><Camera className="w-10 h-10" /></div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg backdrop-blur-md border ${
                     item.visibility === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                   }`}>
                     {item.visibility}
                   </span>
                </div>
                <button className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Content Section */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="text-lg font-bold text-white line-clamp-1">{item.title}</h3>
                   <span className="text-amber-500 font-black text-sm">{item.pricePerDay} <span className="text-[10px] text-zinc-500 uppercase">BHD</span></span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6">
                   {item.type === 'LOCATION' ? <MapPin className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                   {item.type}
                </div>

                {/* Responsive Action Bar */}
                <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/5">
                   <button className="flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all border border-white/5">
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                   </button>
                   <button className="flex items-center justify-center gap-2 py-2.5 bg-red-500/5 hover:bg-red-500/10 rounded-xl text-xs font-bold text-red-500 transition-all border border-red-500/10">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                   </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
