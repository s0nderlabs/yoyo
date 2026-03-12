"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { usePrivy } from "@privy-io/react-auth";
import { useChatSheet } from "@/contexts/chat-context";
import { MessageBubble } from "./message-bubble";
import { ThinkingIndicator } from "./thinking-indicator";
import { ToolApprovalCard } from "./tool-approval-card";
import { ToolResultCard } from "./tool-result-card";

export function ChatSheet() {
  const { isOpen, close, prefill, clearPrefill, dashboardData } =
    useChatSheet();
  const { user } = usePrivy();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const name =
    user?.google?.name?.split(" ")[0] ||
    (user?.apple as { firstName?: string } | undefined)?.firstName ||
    undefined;

  // Use smart wallet address directly from Privy (not from dashboardData ref)
  const walletAddress = user?.smartWallet?.address ?? user?.wallet?.address;

  // Keep transport body always current via a mutable ref
  const bodyRef = useRef<Record<string, unknown>>({});
  bodyRef.current = {
    walletAddress,
    walletBalanceUsd: dashboardData?.walletBalanceUsd,
    totalSavingsUsd: dashboardData?.totalSavingsUsd,
    userName: name,
    hasPositions: dashboardData?.hasPositions,
  };

  const transport = useMemo(() => {
    // Body object that delegates reads to the ref so it's always fresh
    const liveBody: Record<string, unknown> = {};
    for (const key of Object.keys(bodyRef.current)) {
      Object.defineProperty(liveBody, key, {
        get: () => bodyRef.current[key],
        enumerable: true,
      });
    }
    return new DefaultChatTransport({ api: "/api/chat", body: liveBody });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    messages,
    sendMessage,
    addToolResult,
    status,
  } = useChat({ transport });

  const isStreaming = status === "streaming";

  // Handle prefill
  useEffect(() => {
    if (isOpen && prefill) {
      setInput(prefill);
      clearPrefill();
      // Auto-focus after sheet animation
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [isOpen, prefill, clearPrefill]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when sheet opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [isOpen]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    sendMessage({ text });
    setInput("");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-ink/10"
        onClick={close}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[85dvh] max-w-lg flex-col rounded-t-2xl border-t border-border bg-cream"
      >
        {/* Drag handle + header */}
        <div className="flex-none px-5 pt-3 pb-2">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
          <div className="flex items-center justify-between">
            <span className="font-display text-lg text-ink">yoyo</span>
            <button
              onClick={close}
              className="rounded-full p-1.5 transition-colors duration-200 hover:bg-ink/[0.04]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-ink-light"
              >
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-center font-body text-sm text-ink-light/60">
                Ask me about savings rates, your balance, or tell me what
                you&apos;re saving for.
              </p>
            </div>
          )}
          <div className="space-y-4">
            {messages.map((message) => {
              // Check if this assistant message has any visible text content
              const hasText = message.parts.some(
                (p) => p.type === "text" && p.text.trim(),
              );

              return (
                <div key={message.id}>
                  {message.parts.map((part, i) => {
                    if (part.type === "text") {
                      return (
                        <MessageBubble
                          key={i}
                          role={message.role}
                          text={part.text}
                        />
                      );
                    }
                    // Skip reasoning — don't render as visible indicators
                    if (part.type === "reasoning") return null;
                    // Tool parts — typed as "tool-{toolName}"
                    if (
                      part.type.startsWith("tool-") &&
                      "toolCallId" in part
                    ) {
                      const tp = part as {
                        type: string;
                        toolCallId: string;
                        state: string;
                        input?: unknown;
                        output?: unknown;
                      };
                      const toolName = tp.type.slice(5);

                      if (toolName === "deposit" || toolName === "withdraw") {
                        return (
                          <ToolApprovalCard
                            key={tp.toolCallId}
                            toolName={toolName}
                            toolCallId={tp.toolCallId}
                            args={
                              (tp.input as Record<string, string>) || {}
                            }
                            state={tp.state}
                            result={tp.output}
                            addToolResult={addToolResult}
                            dashboardData={dashboardData}
                          />
                        );
                      }

                      // Only render tool data cards once results are available
                      if (tp.state === "result" && tp.output) {
                        return (
                          <ToolResultCard
                            key={tp.toolCallId}
                            toolName={toolName}
                            result={tp.output}
                          />
                        );
                      }

                      return null;
                    }
                    return null;
                  })}
                  {/* Single thinking indicator: show while assistant has no text yet */}
                  {message.role === "assistant" && !hasText && isStreaming && (
                    <ThinkingIndicator />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Input */}
        <div className="flex-none border-t border-border/60 px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent font-body text-sm text-ink outline-none placeholder:text-ink-light/40"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="rounded-full p-2 transition-colors duration-200 hover:bg-ink/[0.04] disabled:opacity-30"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-sage"
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
          </form>
        </div>
      </motion.div>
    </>
  );
}

