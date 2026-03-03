"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => setIsOpen(false), [pathname]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150 && !isOpen) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setIsScrolled(latest > 50);
  });

  if (pathname?.startsWith("/dashboard")) return null;
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <motion.nav
        variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.3, ease: "circOut" }}
        className={`fixed top-0 inset-x-0 w-full z-[10000] transition-all duration-300 ${
          isScrolled || isOpen ? "bg-black/90 backdrop-blur-2xl border-b border-white/10" : "bg-transparent"
        }`}
        style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }} // Safari Layer Fix
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 relative z-[10002]">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-black text-xl">K</div>
            <span className="text-xl font-bold text-white tracking-tighter">Kader</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
            <Link href="/equipment">Equipment</Link>
            <Link href="/talent">Talent</Link>
            <Link href="/locations">Locations</Link>
            <SignedIn>
              <Link href="/dashboard" className="text-amber-500 font-bold tracking-tight border-l border-white/10 pl-8">Mission Control</Link>
            </SignedIn>
            <Link href="/community">Community</Link>
          </div>

          <div className="flex items-center gap-4 relative z-[10002]">
            <SignedIn>
              <Link href="/dashboard" className="hidden md:block text-sm font-bold text-amber-500 hover:text-amber-400 transition-colors mr-2">
                Mission Control
              </Link>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <div className="hidden md:flex gap-4">
                <SignInButton mode="modal"><button className="text-white text-sm">Log in</button></SignInButton>
                <SignUpButton mode="modal"><button className="bg-white text-black px-5 py-2 rounded-full font-bold text-sm">Join</button></SignUpButton>
              </div>
            </SignedOut>

            {/* MOBILE TOGGLE - Enhanced for Safari */}
            <button 
              type="button"
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(!isOpen);
              }} 
              className="md:hidden relative flex items-center justify-center w-12 h-12 -mr-2 text-white bg-white/5 rounded-full border border-white/10 cursor-pointer active:bg-white/10"
              style={{ 
                transform: 'translateZ(0)', 
                WebkitTransform: 'translateZ(0)',
                touchAction: 'manipulation',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* MOBILE OVERLAY */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#030303] z-[9999] flex flex-col p-8 pt-32 h-screen overflow-y-auto"
              style={{ touchAction: 'auto' }}
            >
              <div className="flex flex-col gap-6 mb-12">
                <h2 className="text-2xl font-black tracking-tighter text-white opacity-50">BROWSE</h2>
                <Link href="/equipment" onClick={() => setIsOpen(false)} className="text-4xl font-black tracking-tighter text-white active:opacity-70 transition-opacity">EQUIPMENT</Link>
                <Link href="/talent" onClick={() => setIsOpen(false)} className="text-4xl font-black tracking-tighter text-white active:opacity-70 transition-opacity">TALENT</Link>
                <Link href="/locations" onClick={() => setIsOpen(false)} className="text-4xl font-black tracking-tighter text-white active:opacity-70 transition-opacity">LOCATIONS</Link>
                <Link href="/community" onClick={() => setIsOpen(false)} className="text-4xl font-black tracking-tighter text-white active:opacity-70 transition-opacity">COMMUNITY</Link>
              </div>
              
              <hr className="border-white/10 mb-8" />
              
              <div className="flex flex-col gap-4">
                <SignedIn>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <button className="w-full text-left text-2xl font-black tracking-tighter text-amber-400 active:opacity-70 transition-opacity">MY PROFILE</button>
                  </Link>
                </SignedIn>
                <SignedOut>
                  <div className="flex flex-col gap-4">
                    <SignInButton mode="modal">
                      <button className="w-full text-left text-xl font-bold text-white active:opacity-70 transition-opacity">Log in</button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="w-full bg-white text-black px-5 py-3 rounded-full font-bold text-lg text-center active:opacity-70 transition-opacity">Join</button>
                    </SignUpButton>
                  </div>
                </SignedOut>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
