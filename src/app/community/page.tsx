"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Users, MessagesSquare, Trophy, ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";

export default function CommunityPage() {
  const comp = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Cinematic cascade reveal
      gsap.fromTo(
        ".reveal",
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, stagger: 0.15, ease: "power4.out" }
      );
      
      // Infinite floating animation for the feature cards
      gsap.to(".float-card", {
        y: -15,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.2
      });
    }, comp);

    return () => ctx.revert();
  },[]);

  return (
    <div ref={comp} className="min-h-screen bg-[#030303] text-white font-sans flex flex-col items-center justify-center pt-28 pb-24 overflow-hidden relative cursor-none selection:bg-amber-500/30">
      
      {/* Background Cinematic Lighting */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] bg-amber-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        
        {/* Status Badge */}
        <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-sm font-bold tracking-wider mb-8 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
          </span>
          In Active Development
        </div>

        {/* Hero Typography */}
        <h1 className="reveal text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[1.1]">
          The Middle East's <br/>
          <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-200 to-amber-600">
            Creative Network.
          </span>
        </h1>
        
        <p className="reveal text-xl text-zinc-400 font-light mb-16 max-w-2xl mx-auto">
          We are building the ultimate digital hub for filmmakers in the GCC. Share knowledge, collaborate on projects, and elevate your craft.
        </p>

        {/* Feature Preview Cards */}
        <div className="reveal grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 text-left">
          
          <div className="float-card bg-zinc-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <MessagesSquare className="w-10 h-10 text-amber-500 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3">Industry Forums</h3>
            <p className="text-zinc-400 text-sm">Discuss the latest cinema cameras, lighting techniques, and post-production workflows with local experts.</p>
          </div>

          <div className="float-card bg-zinc-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <PlayCircle className="w-10 h-10 text-blue-500 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3">Masterclasses</h3>
            <p className="text-zinc-400 text-sm">Exclusive tutorials, webinars, and live Q&A sessions hosted by award-winning GCC directors and DOPs.</p>
          </div>

          <div className="float-card bg-zinc-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Trophy className="w-10 h-10 text-emerald-500 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3">Collaboration</h3>
            <p className="text-zinc-400 text-sm">Find passionate crew members to collaborate on passion projects, short films, and festival submissions.</p>
          </div>

        </div>

        {/* Call to Action */}
        <div className="reveal">
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white text-black font-bold text-lg rounded-xl px-8 py-4 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.2)] cursor-none">
            Go to Mission Control <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-zinc-500 text-sm mt-6">Active platform users will receive early beta access.</p>
        </div>

      </div>
    </div>
  );
}