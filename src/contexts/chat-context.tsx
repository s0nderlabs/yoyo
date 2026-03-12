"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { DashboardData } from "@/hooks/use-dashboard-data";

interface ChatContextType {
  isOpen: boolean;
  open: (prefill?: string) => void;
  close: () => void;
  prefill: string | null;
  clearPrefill: () => void;
  dashboardData: DashboardData | null;
  registerDashboardData: (data: DashboardData) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefill, setPrefill] = useState<string | null>(null);
  const dataRef = useRef<DashboardData | null>(null);

  const open = useCallback((msg?: string) => {
    if (msg) setPrefill(msg);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);
  const clearPrefill = useCallback(() => setPrefill(null), []);

  const registerDashboardData = useCallback((data: DashboardData) => {
    dataRef.current = data;
  }, []);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        open,
        close,
        prefill,
        clearPrefill,
        get dashboardData() {
          return dataRef.current;
        },
        registerDashboardData,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatSheet() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatSheet must be used within ChatProvider");
  return ctx;
}
