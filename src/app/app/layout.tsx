"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
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
          transition={{ duration: 0.6 }}
        >
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="font-display text-[3.5rem] tracking-tight text-ink"
          >
            yoyo
          </motion.span>
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

      {/* Chat panel — always mounted, visibility controlled */}
      <ChatSheet visible={isOpen} />

      {/* Input bar — always visible except sidebar, z-60 above everything */}
      {!sidebarOpen && <ChatInputBar />}
    </div>
  );
}

const morphEase = [0.16, 1, 0.3, 1] as const;

function ChatInputBar() {
  const { open, isOpen, activeSheet, chatInput, setChatInput, sendMessage, isStreaming } = useChatSheet();
  const inputRef = useRef<HTMLInputElement>(null);

  const stepLabel = activeSheet
    ? activeSheet.step === "idle"
      ? activeSheet.type === "deposit" ? "Deposit" : "Withdraw"
      : activeSheet.step === "processing"
        ? "Processing..."
        : activeSheet.step === "success"
          ? "Done!"
          : "Try again"
    : null;

  const stepBg = activeSheet?.step === "error" ? "bg-fail" : "bg-sage";
  const isDisabled = activeSheet?.step === "processing" || activeSheet?.step === "success";

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !activeSheet) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, activeSheet]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim() && !isStreaming) {
      sendMessage(chatInput);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-[max(env(safe-area-inset-bottom),20px)] pt-3">
      <div className="mx-auto max-w-lg lg:max-w-3xl">
        <div className="overflow-hidden rounded-full border border-border/60 bg-cream/80 shadow-[0_2px_16px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-colors duration-300">
          <AnimatePresence mode="wait" initial={false}>
            {activeSheet ? (
              <motion.div
                key="action"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2, ease: morphEase }}
                className="flex w-full items-center justify-between px-5 py-2.5"
              >
                <button
                  onClick={activeSheet.onCancel}
                  disabled={activeSheet.step === "processing"}
                  className="font-body text-sm text-ink-light transition-opacity disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={activeSheet.onConfirm}
                  disabled={isDisabled}
                  className={`rounded-full ${stepBg} px-6 py-2 font-body text-sm text-cream transition-all duration-200 disabled:opacity-70 ${
                    activeSheet.step === "processing" ? "animate-pulse" : ""
                  }`}
                >
                  {stepLabel}
                </button>
              </motion.div>
            ) : isOpen ? (
              <motion.form
                key="chat-input"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2, ease: morphEase }}
                onSubmit={handleChatSubmit}
                className="flex w-full items-center gap-3 px-5 py-3"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent font-body text-sm text-ink outline-none placeholder:text-ink-light/40"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isStreaming}
                  className="rounded-full p-1 transition-opacity duration-200 disabled:opacity-30"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-sage">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </motion.form>
            ) : (
              <motion.button
                key="idle"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2, ease: morphEase }}
                onClick={() => open()}
                className="flex w-full items-center gap-3 px-5 py-3.5"
              >
                <span className="flex-1 text-left font-body text-sm text-ink-light/50">
                  anything...
                </span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-ink-light/30">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
