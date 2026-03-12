"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatProvider, useChatSheet } from "@/contexts/chat-context";
import { ChatSheet } from "@/components/chat/chat-sheet";

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
    <ChatProvider>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex min-h-dvh flex-col bg-cream"
        >
          <main className="flex-1 overflow-y-auto pb-20">{children}</main>
          <ChatInputBar />
          <AnimatePresence>
            <ChatSheet />
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </ChatProvider>
  );
}

function ChatInputBar() {
  const { open, isOpen } = useChatSheet();

  if (isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(env(safe-area-inset-bottom),20px)] pt-3">
      <div className="mx-auto max-w-lg lg:max-w-3xl">
        <button
          onClick={() => open()}
          className="flex w-full items-center gap-3 rounded-2xl border border-border/80 bg-cream/90 px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-colors duration-300 hover:border-sage/30"
        >
          <span className="flex-1 text-left font-body text-sm text-ink-light/60">
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
        </button>
      </div>
    </div>
  );
}
