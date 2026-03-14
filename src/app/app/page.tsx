"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import type { VaultStatsItem } from "@yo-protocol/core";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useActivities } from "@/hooks/use-activities";
import { useGoals } from "@/hooks/use-goals";
import { useChatSheet } from "@/contexts/chat-context";
import { OverviewScreen } from "@/components/dashboard/overview-screen";
import { DepositSheet } from "@/components/dashboard/deposit-sheet";
import { WithdrawSheet } from "@/components/dashboard/withdraw-sheet";

export default function DashboardPage() {
  const data = useDashboardData();
  const { activities, refetch: refetchActivities } = useActivities();
  const { goals } = useGoals();
  const { registerDashboardData, openSidebar } = useChatSheet();

  useEffect(() => {
    registerDashboardData(data);
  }, [data, registerDashboardData]);

  const [depositVault, setDepositVault] = useState<VaultStatsItem | null>(null);
  const [withdrawVault, setWithdrawVault] = useState<VaultStatsItem | null>(null);

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

  const mappedActivities = useMemo(
    () =>
      activities.map((a) => ({
        type: a.type as "deposit" | "withdraw" | "swap",
        amount: a.amount,
        tokenSymbol: a.tokenSymbol,
        vaultId: a.vaultId ?? undefined,
        txHash: a.txHash ?? undefined,
        createdAt: a.createdAt,
      })),
    [activities],
  );

  const goalsMap = useMemo(
    () =>
      Object.fromEntries(
        goals.map((g) => [
          g.vaultId,
          { name: g.name, targetUsd: parseFloat(g.targetAmount) },
        ]),
      ),
    [goals],
  );

  const withdrawPosition = withdrawVault
    ? data.positions.find((p) => p.vault.id === withdrawVault.id)
    : undefined;

  return (
    <div className="relative">
      {/* Header — settings gear only */}
      <div className="fixed top-0 right-0 left-0 z-30 flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),12px)] pb-2">
        <button
          onClick={openSidebar}
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
      </div>

      {/* The app — one editorial page */}
      <OverviewScreen
        data={data}
        activities={mappedActivities}
        goals={goalsMap}
        onVaultTap={setDepositVault}
        onPositionTap={setWithdrawVault}
        onRefresh={async () => {
          await Promise.all([
            data.refetchPositions(),
            data.refetchBalances(),
            refetchActivities(),
          ]);
        }}
      />

      {/* Sheets */}
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
