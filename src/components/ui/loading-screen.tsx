"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface LoadingScreenProps {
  progress: number; // 0–100
  onExit?: () => void;
  skipEntry?: boolean; // skip blur-in entry for seamless auth→data transition
}

export function LoadingScreen({ progress, onExit, skipEntry = false }: LoadingScreenProps) {
  const [exiting, setExiting] = useState(false);
  const onExitRef = useRef(onExit);
  useEffect(() => { onExitRef.current = onExit; });

  useEffect(() => {
    if (progress >= 100 && !exiting) {
      const t1 = setTimeout(() => setExiting(true), 200);
      const t2 = setTimeout(() => onExitRef.current?.(), 200 + 400);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [progress, exiting]); // onExit intentionally excluded — using ref to avoid timer resets

  const wordmarkEntry = skipEntry
    ? { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }
    : { opacity: 0, y: 16, filter: "blur(8px)" };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FFFEF2]"
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Wordmark */}
      <motion.span
        className="font-display text-[4.5rem] tracking-tight text-ink"
        initial={wordmarkEntry}
        animate={
          exiting
            ? { opacity: 1, y: 0, scale: 1.05, filter: "blur(5px)" }
            : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
        }
        transition={
          exiting
            ? { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
            : { type: "spring", stiffness: 80, damping: 20 }
        }
      >
        yoyo
      </motion.span>

      {/* Progress line — pinned to bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-[1px]">
        <div
          className="h-full bg-sage/50 transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}
