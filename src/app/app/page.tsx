"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import type { VaultStatsItem } from "@yo-protocol/core";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useChatSheet } from "@/contexts/chat-context";
import { OverviewScreen } from "@/components/dashboard/overview-screen";
import { DetailsScreen } from "@/components/dashboard/details-screen";
import { SettingsSidebar } from "@/components/dashboard/settings-sidebar";
import { DepositSheet } from "@/components/dashboard/deposit-sheet";
import { WithdrawSheet } from "@/components/dashboard/withdraw-sheet";

export default function DashboardPage() {
  const data = useDashboardData();
  const { registerDashboardData } = useChatSheet();

  // Register dashboard data ref for chat context
  useEffect(() => {
    registerDashboardData(data);
  }, [data, registerDashboardData]);

  const [activeScreen, setActiveScreen] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [depositVault, setDepositVault] = useState<VaultStatsItem | null>(null);
  const [withdrawVault, setWithdrawVault] = useState<VaultStatsItem | null>(
    null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const width = scrollRef.current.offsetWidth;
    setActiveScreen(scrollLeft > width * 0.5 ? 1 : 0);
  };

  const handleDepositSuccess = () => {
    setDepositVault(null);
    data.refetchPositions();
    data.refetchBalances();
  };

  const handleWithdrawSuccess = () => {
    setWithdrawVault(null);
    data.refetchPositions();
    data.refetchBalances();
  };

  const withdrawPosition = withdrawVault
    ? data.positions.find((p) => p.vault.id === withdrawVault.id)
    : undefined;

  return (
    <div className="relative">
      <SettingsSidebar
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        walletBalanceUsd={data.walletBalanceUsd}
      />

      {/* Header chrome */}
      <div className="fixed top-0 right-0 left-0 z-30 flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),12px)] pb-2">
        <button
          onClick={() => setSettingsOpen(true)}
          className="rounded-full p-2 transition-colors duration-200 hover:bg-ink/[0.04]"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="text-ink-light"
          >
            <path
              d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M16.2 12.5a1.4 1.4 0 00.3 1.5l.05.05a1.7 1.7 0 11-2.4 2.4l-.05-.05a1.4 1.4 0 00-1.5-.3 1.4 1.4 0 00-.85 1.28v.15a1.7 1.7 0 01-3.4 0v-.08a1.4 1.4 0 00-.92-1.28 1.4 1.4 0 00-1.5.3l-.05.05a1.7 1.7 0 11-2.4-2.4l.05-.05a1.4 1.4 0 00.3-1.5 1.4 1.4 0 00-1.28-.85h-.15a1.7 1.7 0 010-3.4h.08a1.4 1.4 0 001.28-.92 1.4 1.4 0 00-.3-1.5l-.05-.05a1.7 1.7 0 112.4-2.4l.05.05a1.4 1.4 0 001.5.3h.07a1.4 1.4 0 00.85-1.28v-.15a1.7 1.7 0 013.4 0v.08a1.4 1.4 0 00.85 1.28 1.4 1.4 0 001.5-.3l.05-.05a1.7 1.7 0 112.4 2.4l-.05.05a1.4 1.4 0 00-.3 1.5v.07a1.4 1.4 0 001.28.85h.15a1.7 1.7 0 010 3.4h-.08a1.4 1.4 0 00-1.28.85z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </button>

        <div className="flex gap-1.5">
          <div
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
              activeScreen === 0 ? "bg-ink" : "bg-border"
            }`}
          />
          <div
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
              activeScreen === 1 ? "bg-ink" : "bg-border"
            }`}
          />
        </div>
      </div>

      {/* Swipeable screens */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="w-full flex-none snap-center">
          <OverviewScreen data={data} />
        </div>
        <div className="w-full flex-none snap-center">
          <DetailsScreen
            data={data}
            onVaultTap={setDepositVault}
            onPositionTap={setWithdrawVault}
          />
        </div>
      </div>

      {/* Sheets with exit animations */}
      <AnimatePresence>
        {depositVault && (
          <DepositSheet
            key="deposit"
            vault={depositVault}
            prices={data.prices}
            onClose={() => setDepositVault(null)}
            onSuccess={handleDepositSuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {withdrawVault && withdrawPosition && (
          <WithdrawSheet
            key="withdraw"
            vault={withdrawVault}
            position={withdrawPosition.position}
            prices={data.prices}
            onClose={() => setWithdrawVault(null)}
            onSuccess={handleWithdrawSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
