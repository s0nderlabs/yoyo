"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatProvider, useChatSheet } from "@/contexts/chat-context";
import { ChatSheet } from "@/components/chat/chat-sheet";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import {
  SettingsSidebar,
  ScreenStackWrapper,
} from "@/components/dashboard/settings-sidebar";

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
      <AppShell>{children}</AppShell>
    </ChatProvider>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  const { isOpen, sidebarOpen, openSidebar, closeSidebar } = useChatSheet();
  const data = useDashboardData();

  // Lock body scroll when chat sheet or sidebar is open
  useEffect(() => {
    if (isOpen || sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, sidebarOpen]);

  return (
    <div className="relative min-h-dvh bg-[#1E1C19]">
      {/* Sidebar — dark full-screen bg, BEHIND the card */}
      <SettingsSidebar
        open={sidebarOpen}
        onClose={closeSidebar}
        walletBalanceUsd={data.walletBalanceUsd}
      />

      {/* Main content — floating card ON TOP, slides right to reveal sidebar */}
      <ScreenStackWrapper open={sidebarOpen} onOpen={openSidebar} onClose={closeSidebar}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex min-h-dvh flex-col bg-cream"
        >
          <main className="flex-1 overflow-y-auto pb-20">{children}</main>
        </motion.div>
      </ScreenStackWrapper>

      {/* Chat input bar — outside ScreenStackWrapper so fixed positioning works */}
      <AnimatePresence>
        {!isOpen && !sidebarOpen && <ChatInputBar />}
      </AnimatePresence>

      {/* Chat sheet — full overlay, above everything */}
      <AnimatePresence>
        {isOpen && <ChatSheet />}
      </AnimatePresence>
    </div>
  );
}

function ChatInputBar() {
  const { open } = useChatSheet();

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(env(safe-area-inset-bottom),20px)] pt-3"
    >
      <div className="mx-auto max-w-lg lg:max-w-3xl">
        <button
          onClick={() => open()}
          className="flex w-full items-center gap-3 rounded-full border border-border/60 bg-cream/80 px-5 py-3.5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-colors duration-300 hover:border-sage/30"
        >
          <span className="flex-1 text-left font-body text-sm text-ink-light/50">
            anything...
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="text-ink-light/30"
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
    </motion.div>
  );
}
