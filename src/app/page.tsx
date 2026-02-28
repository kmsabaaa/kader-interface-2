"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Search, MapPin, Sparkles, Calendar, ShieldCheck, ArrowRight, Instagram, Twitter, Linkedin } from "lucide-react";
import Link from "next/link";

// 1. Force Hero3D to only load in the browser (Stops the 500 SSR crash)
const Hero3D = dynamic(() => import("./components/Hero3D"), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#030303]" /> 
});

export default function Home() {
  const comp = useRef<HTMLElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !comp.current) return;
    if (typeof window === "undefined") return;

    // 2. Import Lenis dynamically inside useEffect
    const initLenis = async () => {
      const Lenis = (await import("@studio-freight/lenis")).default;
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      });

      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
      
      return lenis;
    };

    let lenisInstance: any;
    let destroyed = false;
    initLenis().then(res => {
      if (destroyed) {
        res.destroy(); // cleanup already ran — destroy immediately
      } else {
        lenisInstance = res;
      }
    });

    gsap.registerPlugin(ScrollTrigger);

    let ctx = gsap.context(() => {
      // Hero Title Animation
      const revealNodes = gsap.utils.toArray(".reveal");
      if (revealNodes.length) {
        gsap.fromTo(
          revealNodes,
          { y: 50, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 1.2, stagger: 0.1, ease: "power3.out" }
        );
      }

      // Bento Box Animation
      const bentoCards = gsap.utils.toArray(".bento-card");
      const bentoGrid = document.querySelector(".bento-grid");
      if (bentoCards.length && bentoGrid) {
        gsap.fromTo(
          bentoCards,
          { y: 100, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
            stagger: 0.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: bentoGrid,
              start: "top 85%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }

      // Horizontal Scroll (Desktop only for performance)
      if (window.innerWidth > 1024) {
        const track = document.querySelector(".horizontal-track") as HTMLElement;
        if (track) {
          gsap.to(track, {
            x: () => -(track.scrollWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: {
              trigger: ".horizontal-wrapper",
              start: "top top",
              end: "+=3000",
              scrub: 1,
              pin: true,
              invalidateOnRefresh: true,
            }
          });
        }
      }
    }, comp);

    return () => {
      destroyed = true;
      ctx.revert();
      if (lenisInstance) lenisInstance.destroy();
    };
  }, [isMounted]);

  // Avoid hydration mismatch by not rendering content until mounted
  if (!isMounted) return <div className="min-h-screen bg-[#030303]" />;

  return (
    <>
      <main ref={comp} className="relative z-10 bg-[#030303] mb-[80vh] shadow-[0_20px_50px_rgba(0,0,0,1)] text-white font-sans selection:bg-amber-500/30 overflow-hidden">
        
        {/* HERO SECTION */}
        <section className="relative h-screen flex flex-col items-center justify-center">
          <Hero3D />
          <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-amber-600/10 blur-[120px] pointer-events-none"></div>
          <div className="absolute top-[40%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>

          <div className="relative z-10 w-full max-w-6xl px-6 flex flex-col items-center text-center mt-[-5vh]">
            <div className="reveal mb-8 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-400 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
              </span>
              AI-Powered Matchmaking is Live
            </div>

            <h1 className="reveal text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[1.1]">
              The Industry Standard for <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
                Video Production.
              </span>
            </h1>
            
            <p className="reveal max-w-2xl text-lg md:text-xl text-zinc-400 mb-12 font-light">
              Kader | كادر instantly connects you with the Middle East's elite talent, cinema-grade equipment, and exclusive locations.
            </p>

            <form 
              action="/search" 
              method="GET"
              className="reveal w-full max-w-4xl bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-2xl shadow-black/50 hover:border-amber-500/30 transition-colors duration-500"
            >
              <div className="flex-1 flex items-center bg-black/40 rounded-xl px-4 py-3 border border-white/5 focus-within:border-amber-500/50">
                <Search className="w-5 h-5 text-zinc-400 mr-3 shrink-0" />
                <input 
                  type="text" 
                  name="q"
                  required
                  placeholder="What do you need? (e.g. ARRI Alexa, Drone Operator)" 
                  className="bg-transparent w-full text-white outline-none text-sm md:text-base" 
                />
              </div>
              <div className="flex gap-2">
                <div className="hidden sm:flex items-center bg-black/40 rounded-xl px-4 py-3 border border-white/5">
                  <MapPin className="w-5 h-5 text-zinc-400 mr-2 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Bahrain" 
                    className="bg-transparent w-24 text-white outline-none text-sm md:text-base" 
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl px-8 py-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/25 w-full md:w-auto"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* BENTO BOX GRID */}
        <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 bg-[#030303]">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">Elite Resources.</h2>
              <p className="text-zinc-400 text-lg max-w-lg">Hand-picked by our AI matching engine for your next masterpiece.</p>
            </div>
            <Link href="/search" className="hidden md:flex items-center gap-2 text-amber-500 hover:text-amber-400 font-medium transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bento-grid grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[300px]">
            <div className="bento-card md:col-span-2 md:row-span-2 group relative rounded-3xl overflow-hidden border border-white/10 bg-zinc-900">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=2056&auto=format&fit=crop')] bg-cover bg-center opacity-50 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-80"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-white mb-3 border border-white/20">Featured Location</span>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">Manama Skyline Helipad</h3>
              </div>
            </div>

            <div className="bento-card group relative rounded-3xl overflow-hidden border border-white/10 bg-zinc-900">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1964&auto=format&fit=crop')] bg-cover bg-center opacity-50 transition-transform duration-700 group-hover:scale-105"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <span className="inline-block px-3 py-1 bg-amber-500/20 rounded-full text-xs font-semibold text-amber-400 mb-2 border border-amber-500/30">Cinema Camera</span>
                <h3 className="text-xl font-bold text-white mb-1">ARRI Alexa Mini LF</h3>
              </div>
            </div>

            <div className="bento-card group relative rounded-3xl overflow-hidden border border-white/10 bg-zinc-900">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1603366615917-1fa6dad5c4fa?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-50 transition-transform duration-700 group-hover:scale-105"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <span className="inline-block px-3 py-1 bg-blue-500/20 rounded-full text-xs font-semibold text-blue-400 mb-2 border border-blue-500/30">Verified Talent</span>
                <h3 className="text-xl font-bold text-white mb-1">Elite Drone Pilot</h3>
              </div>
            </div>
          </div>
        </section>

        {/* HORIZONTAL FILMSTRIP (Only pinned on Desktop) */}
        <section className="horizontal-wrapper relative min-h-screen bg-[#030303]">
          <div className="lg:sticky top-0 h-auto lg:h-screen flex items-center overflow-hidden border-t border-white/5 py-24 lg:py-0">
            <div className="horizontal-track flex flex-col lg:flex-row gap-8 px-6 lg:px-[10vw] w-full lg:w-max">
              <div className="w-full lg:w-[40vw] flex flex-col justify-center pr-0 lg:pr-12">
                <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                  The Anatomy of a <span className="text-amber-500">Masterpiece.</span>
                </h2>
                <p className="text-xl text-zinc-400 font-light">
                  Kader isn't just a marketplace. It is an end-to-end ecosystem engineered to take your production from storyboard to final cut without the friction.
                </p>
              </div>

              <div className="w-full lg:w-[50vw] min-h-[400px] lg:h-[60vh] bg-white/5 border border-white/10 rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden group">
                <Sparkles className="w-16 h-16 text-amber-400 mb-8" />
                <div>
                  <h3 className="text-3xl font-bold mb-4">01. AI Matchmaking</h3>
                  <p className="text-lg text-zinc-400">Our algorithms analyze your project script and budget, matching you with specialized crew and gear.</p>
                </div>
              </div>

              <div className="w-full lg:w-[50vw] min-h-[400px] lg:h-[60vh] bg-white/5 border border-white/10 rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden group">
                <Calendar className="w-16 h-16 text-blue-400 mb-8" />
                <div>
                  <h3 className="text-3xl font-bold mb-4">02. Mission Control</h3>
                  <p className="text-lg text-zinc-400">Generate digital call sheets and track dynamic budgets through a unified dashboard.</p>
                </div>
              </div>

              <div className="w-full lg:w-[50vw] min-h-[400px] lg:h-[60vh] bg-white/5 border border-white/10 rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden group">
                <ShieldCheck className="w-16 h-16 text-emerald-400 mb-8" />
                <div>
                  <h3 className="text-3xl font-bold mb-4">03. Secure Vault</h3>
                  <p className="text-lg text-zinc-400">Every equipment rental is backed by insurance. Payments are held securely in escrow.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* REVEAL FOOTER */}
      <footer className="relative lg:fixed bottom-0 left-0 w-full lg:h-[80vh] z-0 bg-[#000000] flex flex-col justify-between pt-20 pb-10 px-8 lg:px-16 text-white overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 w-full max-w-7xl mx-auto border-b border-white/10 pb-12">
          <div className="flex flex-col gap-4">
            <h4 className="text-amber-500 font-bold mb-2">Ecosystem</h4>
            <Link href="/search?category=equipment" className="text-zinc-400 hover:text-white">Find Equipment</Link>
            <Link href="/search?category=talent" className="text-zinc-400 hover:text-white">Hire Talent</Link>
            <Link href="/search?category=location" className="text-zinc-400 hover:text-white">Scout Locations</Link>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-amber-500 font-bold mb-2">Social</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all"><Linkedin className="w-4 h-4" /></a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center grow py-20 lg:py-0">
          <h1 className="text-[12vw] leading-none font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">
            KADER
          </h1>
        </div>
        
        <div className="flex justify-between items-center text-[10px] text-zinc-600 font-mono uppercase tracking-widest mt-auto">
          <span>© 2026 Kader Tech.</span>
          <span>Designed in Bahrain</span>
        </div>
      </footer>
    </>
  );
}