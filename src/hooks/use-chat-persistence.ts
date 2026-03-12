"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { UIMessage } from "ai";

interface PersistenceState {
  initialMessages: UIMessage[];
  chatIdRef: React.RefObject<string | null>;
  isLoaded: boolean;
  hasHistory: boolean;
  saveNewMessages: (messages: UIMessage[]) => void;
}

const WELCOME_ID = "welcome";

const WELCOME_MESSAGE: UIMessage = {
  id: WELCOME_ID,
  role: "assistant" as const,
  parts: [
    {
      type: "text" as const,
      text: "Hey! What are you saving for? I can help you find the best rate.",
    },
  ],
};

export function useChatPersistence(): PersistenceState {
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);
  const chatIdRef = useRef<string | null>(null);
  const savedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/chat/history");
        if (!res.ok) throw new Error("Failed to load history");
        const data = await res.json();

        if (cancelled) return;

        if (data.chatId && data.messages.length > 0) {
          chatIdRef.current = data.chatId;
          setHasHistory(true);
          // Track already-persisted message IDs
          for (const m of data.messages) {
            savedIdsRef.current.add(m.id);
          }
          setInitialMessages(data.messages);
        } else {
          // First visit — show welcome
          setHasHistory(false);
          setInitialMessages([WELCOME_MESSAGE]);
        }
      } catch {
        // On error, still show welcome so the chat is usable
        setInitialMessages([WELCOME_MESSAGE]);
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveNewMessages = useCallback((messages: UIMessage[]) => {
    // Filter out welcome message and already-saved messages
    const unsaved = messages.filter(
      (m) => m.id !== WELCOME_ID && !savedIdsRef.current.has(m.id),
    );
    if (unsaved.length === 0) return;

    // Mark as saved immediately to avoid duplicates
    for (const m of unsaved) {
      savedIdsRef.current.add(m.id);
    }

    const payload = {
      chatId: chatIdRef.current ?? undefined,
      messages: unsaved.map((m) => ({
        id: m.id,
        role: m.role,
        parts: m.parts,
      })),
    };

    fetch("/api/chat/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.chatId) chatIdRef.current = data.chatId;
        }
      })
      .catch(() => {
        // Silently fail — messages still in memory
      });
  }, []);

  return { initialMessages, chatIdRef, isLoaded, hasHistory, saveNewMessages };
}
