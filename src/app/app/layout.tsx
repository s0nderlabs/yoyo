"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  if (!ready || !authenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-cream">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-3"
        >
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            <span className="font-display text-2xl text-ink">yoyo</span>
          </motion.div>
          <span className="label-mono text-[10px]">loading</span>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex min-h-dvh flex-col bg-cream"
      >
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto pb-20">{children}</main>

        {/* Fixed bottom chat input bar */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-cream/80 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto max-w-lg">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-cream-dark/60 px-4 py-3 transition-colors duration-300 hover:border-sage/30">
              <span className="flex-1 font-body text-sm text-ink-light/60">
                Ask anything...
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-ink-light/40"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
