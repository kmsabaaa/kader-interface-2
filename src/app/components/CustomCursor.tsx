"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true); // Default to true to prevent SSR issues

  useEffect(() => {
    // 1. Check if device is mobile - if so, stop everything
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || ('ontouchstart' in window);
      setIsMobile(mobile);
    };
    
    checkMobile();
    if (window.innerWidth < 768) return;

    const handleFirstMove = () => setIsVisible(true);

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(!!(target.closest("button") || target.closest("a") || target.tagName === "INPUT"));
    };

    window.addEventListener("mousemove", handleFirstMove, { once: true });
    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  // Never render on mobile or before the first move
  if (isMobile || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      <motion.div
        className="absolute w-3 h-3 bg-amber-400 rounded-full z-50"
        style={{ left: mousePosition.x, top: mousePosition.y, x: "-50%", y: "-50%" }}
        animate={{ scale: isHovering ? 0 : 1 }}
        transition={{ type: "tween", ease: "circOut", duration: 0.1 }}
      />
      <motion.div
        className="absolute w-10 h-10 border border-amber-500/50 rounded-full backdrop-blur-[1px]"
        style={{ left: mousePosition.x, top: mousePosition.y, x: "-50%", y: "-50%" }}
        animate={{ 
          scale: isHovering ? 2 : 1,
          backgroundColor: isHovering ? "rgba(245, 158, 11, 0.1)" : "rgba(0,0,0,0)" 
        }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
      />
    </div>
  );
}