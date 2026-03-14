"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { usePrivy } from "@privy-io/react-auth";
import { useChatSheet } from "@/contexts/chat-context";
import { MessageBubble } from "./message-bubble";
import { ThinkingIndicator } from "./thinking-indicator";
import { ToolApprovalCard } from "./tool-approval-card";
import { ToolResultCard } from "./tool-result-card";

interface ChatSheetProps {
  visible: boolean;
}

export function ChatSheet({ visible }: ChatSheetProps) {
  const {
    close,
    prefill,
    clearPrefill,
    dashboardData,
    registerSendMessage,
    setIsStreaming: setCtxStreaming,
    setChatInput,
  } = useChatSheet();
  const { user } = usePrivy();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showSpacer, setShowSpacer] = useState(false);
  const scrollLockRef = useRef(false);

  const name =
    user?.google?.name?.split(" ")[0] ||
    (user?.apple as { firstName?: string } | undefined)?.firstName ||
    undefined;

  const walletAddress = user?.smartWallet?.address ?? user?.wallet?.address;

  const bodyRef = useRef<Record<string, unknown>>({});
  bodyRef.current = {
    walletAddress,
    walletBalanceUsd: dashboardData?.walletBalanceUsd,
    totalSavingsUsd: dashboardData?.totalSavingsUsd,
    userName: name,
    hasPositions: dashboardData?.hasPositions,
  };

  const transport = useMemo(() => {
    const liveBody: Record<string, unknown> = {};
    for (const key of [
      "walletAddress",
      "walletBalanceUsd",
      "totalSavingsUsd",
      "userName",
      "hasPositions",
    ]) {
      Object.defineProperty(liveBody, key, {
        get: () => bodyRef.current[key],
        enumerable: true,
      });
    }
    return new DefaultChatTransport({ api: "/api/chat", body: liveBody });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fix 7: No welcome message — start empty
  const { messages, sendMessage, addToolResult, status } = useChat({
    transport,
  });

  const isBusy = status === "submitted" || status === "streaming";
  const isStreaming = status === "streaming";

  useEffect(() => {
    setCtxStreaming(isBusy);
  }, [isBusy, setCtxStreaming]);

  // Register send for external input bar
  const handleSend = useCallback(
    (text: string) => {
      if (!text.trim() || isBusy) return;
      setShowSpacer(true);
      scrollLockRef.current = true;
      sendMessage({ text });
    },
    [isBusy, sendMessage],
  );

  // Fix 2: Remove spacer + unlock after streaming completes (or on error)
  const prevStatusRef = useRef(status);
  useEffect(() => {
    const wasActive = prevStatusRef.current === "streaming" || prevStatusRef.current === "submitted";

    if (wasActive && status === "ready") {
      scrollLockRef.current = false;

      // Scroll to end of actual content FIRST, then remove spacer
      const el = scrollRef.current;
      if (el) {
        const allMsgs = el.querySelectorAll("[data-role]");
        const lastMsg = allMsgs[allMsgs.length - 1] as HTMLElement | undefined;
        if (lastMsg) {
          const bottom = lastMsg.offsetTop + lastMsg.offsetHeight;
          const target = Math.max(0, bottom - el.clientHeight + 40);
          el.scrollTo({ top: target, behavior: "smooth" });
        }
        // Remove spacer AFTER scroll animation finishes
        setTimeout(() => setShowSpacer(false), 350);
      } else {
        setShowSpacer(false);
      }
    }

    // On error, clean up immediately
    if (wasActive && status === "error") {
      scrollLockRef.current = false;
      setShowSpacer(false);
    }

    prevStatusRef.current = status;
  }, [status]);

  useEffect(() => {
    registerSendMessage(handleSend);
  }, [handleSend, registerSendMessage]);

  useEffect(() => {
    if (prefill) {
      setChatInput(prefill);
      clearPrefill();
    }
  }, [prefill, clearPrefill, setChatInput]);

  // Scroll behavior
  useEffect(() => {
    if (!scrollRef.current || !visible) return;

    if (scrollLockRef.current) {
      // Fix 6: Smooth scroll user message to top
      requestAnimationFrame(() => {
        const el = scrollRef.current;
        if (!el) return;
        const userMsgs = el.querySelectorAll("[data-role='user']");
        const last = userMsgs[userMsgs.length - 1] as HTMLElement | undefined;
        if (last) {
          const containerRect = el.getBoundingClientRect();
          const msgRect = last.getBoundingClientRect();
          const newTop = el.scrollTop + (msgRect.top - containerRect.top);
          el.scrollTo({ top: newTop, behavior: "smooth" });
        }
      });
    } else {
      // Fix 1: Only auto-scroll if user is near bottom (don't override manual scroll)
      const el = scrollRef.current;
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
      if (isNearBottom) {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      }
    }
  }, [messages, visible]);

  return (
    <>
      {/* Backdrop */}
      {visible && (
        <div
          className="fixed inset-0 z-40 bg-ink/10 transition-opacity duration-300"
          onClick={close}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 mx-auto flex h-[85dvh] max-w-lg flex-col rounded-t-2xl border-t border-border bg-cream transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:max-w-xl ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Fix 5: Centered yoyo logo, tappable to close */}
        <div className="flex-none px-5 pt-3 pb-2">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
          <div className="flex justify-center">
            <button
              onClick={close}
              className="font-display text-lg text-ink transition-opacity hover:opacity-60"
            >
              yoyo
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pt-4 pb-20">
          <div className="space-y-4">
            {messages.map((message) => {
              const hasText = message.parts.some(
                (p) => p.type === "text" && p.text.trim(),
              );

              return (
                <div key={message.id} data-role={message.role}>
                  {message.parts.map((part, i) => {
                    if (part.type === "text") {
                      return (
                        <MessageBubble key={i} role={message.role} text={part.text} />
                      );
                    }
                    if (part.type === "reasoning") return null;
                    if (part.type.startsWith("tool-") && "toolCallId" in part) {
                      const tp = part as {
                        type: string;
                        toolCallId: string;
                        state: string;
                        input?: unknown;
                        output?: unknown;
                      };
                      const toolName = tp.type.slice(5);

                      if (["deposit", "withdraw", "swap_and_deposit", "swap"].includes(toolName)) {
                        return (
                          <ToolApprovalCard
                            key={tp.toolCallId}
                            toolName={toolName as "deposit" | "withdraw" | "swap" | "swap_and_deposit"}
                            toolCallId={tp.toolCallId}
                            args={(tp.input as Record<string, string>) || {}}
                            state={tp.state}
                            result={tp.output}
                            addToolResult={addToolResult}
                            dashboardData={dashboardData}
                          />
                        );
                      }

                      if (tp.state === "result" && tp.output) {
                        return (
                          <ToolResultCard key={tp.toolCallId} toolName={toolName} result={tp.output} />
                        );
                      }

                      return null;
                    }
                    return null;
                  })}
                  {message.role === "assistant" && !hasText && isBusy && (
                    <ThinkingIndicator />
                  )}
                </div>
              );
            })}
            {/* Thinking indicator for submitted phase (before assistant message exists) */}
            {status === "submitted" && (
              <div data-role="assistant">
                <ThinkingIndicator />
              </div>
            )}
            {/* Spacer — only during send+stream, removed after */}
            {showSpacer && <div style={{ minHeight: "70vh" }} aria-hidden="true" />}
          </div>
        </div>
      </div>
    </>
  );
}
