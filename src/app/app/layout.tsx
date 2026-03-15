"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatProvider, useChatSheet } from "@/contexts/chat-context";
import { ChatSheet } from "@/components/chat/chat-sheet";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { VoiceWaveform } from "@/components/chat/voice-waveform";
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
  const {
    isRecording, isTranscribing, setIsTranscribing,
    error: voiceError, analyserNode,
    startRecording, stopRecording, cancelRecording, clearError,
  } = useVoiceRecorder();

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
    if (isOpen && !activeSheet && !isRecording) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, activeSheet, isRecording]);

  // Auto-clear voice errors after 3s
  useEffect(() => {
    if (voiceError) {
      const t = setTimeout(clearError, 3000);
      return () => clearTimeout(t);
    }
  }, [voiceError, clearError]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim() && !isStreaming) {
      sendMessage(chatInput);
    }
  };

  const handleMicTap = async () => {
    if (isRecording) {
      const blob = await stopRecording();
      if (!blob) return; // too short or cancelled
      setIsTranscribing(true);
      try {
        const formData = new FormData();
        formData.append("audio", blob, `voice.${blob.type.includes("mp4") ? "mp4" : "webm"}`);
        const res = await fetch("/api/voice/transcribe", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Transcription failed");
        const { text } = await res.json();
        if (text?.trim()) {
          sendMessage(text.trim());
          // Open chat panel AFTER sending — panel slides up with content already flowing
          if (!isOpen) open();
        }
      } catch {
        // Silently fail — user can type instead
      } finally {
        setIsTranscribing(false);
      }
    } else {
      // Start recording — don't open chat panel yet
      startRecording();
    }
  };

  const showMic = isOpen && !activeSheet && !isStreaming && !chatInput.trim();
  const showIdleMic = !isOpen && !activeSheet;

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
            ) : isRecording ? (
              <motion.div
                key="recording"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2, ease: morphEase }}
                className="flex w-full items-center gap-3 px-5 py-3"
              >
                <button
                  onClick={cancelRecording}
                  className="rounded-full p-1 text-ink-light/60 transition-opacity hover:text-ink"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                <div className="flex-1">
                  <VoiceWaveform analyserNode={analyserNode} isRecording={isRecording} />
                </div>
                <button
                  onClick={handleMicTap}
                  className="rounded-full bg-sage p-1.5 text-cream transition-transform duration-200 active:scale-90"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </motion.div>
            ) : isTranscribing ? (
              <motion.div
                key="transcribing"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2, ease: morphEase }}
                className="flex w-full items-center justify-center px-5 py-3"
              >
                <span className="animate-pulse font-body text-sm text-sage">
                  Transcribing...
                </span>
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
                    placeholder={voiceError ? "Mic unavailable — type instead" : "Ask anything..."}
                    className="flex-1 bg-transparent font-body text-sm text-ink outline-none placeholder:text-ink-light/40"
                  />
                  <AnimatePresence mode="wait" initial={false}>
                    {chatInput.trim() ? (
                      <motion.button
                        key="send"
                        type="submit"
                        disabled={isStreaming}
                        initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.6, rotate: 90 }}
                        transition={{ duration: 0.15, ease: morphEase }}
                        className="rounded-full p-1 transition-opacity duration-200 disabled:opacity-30"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-sage">
                          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.button>
                    ) : (
                      <motion.button
                        key="mic"
                        type="button"
                        onClick={handleMicTap}
                        disabled={isStreaming}
                        initial={{ opacity: 0, scale: 0.6, rotate: 90 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.6, rotate: -90 }}
                        transition={{ duration: 0.15, ease: morphEase }}
                        className="rounded-full p-1 transition-opacity duration-200 disabled:opacity-30"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-sage">
                          <path d="M8 1a2.5 2.5 0 00-2.5 2.5v4a2.5 2.5 0 005 0v-4A2.5 2.5 0 008 1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 7.5a4 4 0 01-8 0M8 12.5v2M6.5 14.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.form>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2, ease: morphEase }}
                className="flex w-full items-center gap-3 px-5 py-3.5"
              >
                <button
                  onClick={() => open()}
                  className="flex-1 text-left font-body text-sm text-ink-light/50"
                >
                  anything...
                </button>
                <button
                  onClick={handleMicTap}
                  className="rounded-full p-1 transition-opacity duration-200"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-ink-light/30">
                    <path d="M8 1a2.5 2.5 0 00-2.5 2.5v4a2.5 2.5 0 005 0v-4A2.5 2.5 0 008 1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 7.5a4 4 0 01-8 0M8 12.5v2M6.5 14.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
