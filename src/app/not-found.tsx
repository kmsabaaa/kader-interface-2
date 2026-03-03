export const dynamic = "force-dynamic";

import type { Metadata } from 'next'
import Link from 'next/link'
import { Film, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: '404 | Kader Ecosystem',
  description: 'The requested resource could not be found.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#030303] text-white antialiased selection:bg-amber-500/30 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Cinematic Glitch Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 text-center flex flex-col items-center max-w-2xl px-6">
        <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
          <Film className="w-10 h-10 text-zinc-500 opacity-50" />
        </div>
        
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">
          404
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Cut! Dead End.</h2>
        
        <p className="text-zinc-400 text-lg mb-10">
          The resource, location, or talent profile you are looking for has been moved, deleted, or never existed in the Kader database.
        </p>

        <Link href="/search" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl px-8 py-4 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/25">
          <ArrowLeft className="w-5 h-5" /> Return to Marketplace
        </Link>
      </div>
    </div>
  )
}
