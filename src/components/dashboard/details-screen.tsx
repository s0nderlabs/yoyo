"use client";

import { motion } from "framer-motion";
import type { VaultStatsItem } from "@yo-protocol/core";
import type { DashboardData } from "@/hooks/use-dashboard-data";
import { formatUsd } from "@/lib/format";
import { VaultCard } from "./vault-card";
import { PositionCard } from "./position-card";
import { ActivityList, type ActivityItem } from "./activity-list";
import { SkeletonText, SkeletonCard, SkeletonRow } from "./skeleton";

interface DetailsScreenProps {
  data: DashboardData;
  activities?: ActivityItem[];
  goals?: Record<string, { name: string; targetUsd: number }>;
  onVaultTap: (vault: VaultStatsItem) => void;
  onPositionTap: (vault: VaultStatsItem) => void;
}

export function DetailsScreen({
  data,
  activities,
  goals,
  onVaultTap,
  onPositionTap,
}: DetailsScreenProps) {
  return (
    <div className="min-h-[calc(100dvh-5rem)] px-6 pt-16 pb-8 sm:px-10">
      <div className="mx-auto w-full max-w-lg space-y-10">
        {/* YOUR ACCOUNTS */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="label-mono">Your Accounts</span>
          <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
            <div className="bg-cream p-4">
              <span className="label-mono text-[10px]">Balance</span>
              {data.userLoading ? (
                <div className="mt-1">
                  <SkeletonText width="w-16" height="h-7" />
                </div>
              ) : (
                <p className="mt-1 font-display text-2xl text-ink">
                  {formatUsd(data.walletBalanceUsd)}
                </p>
              )}
            </div>
            <div className="bg-cream p-4">
              <span className="label-mono text-[10px]">Savings</span>
              {data.userLoading ? (
                <div className="mt-1">
                  <SkeletonText width="w-16" height="h-7" />
                </div>
              ) : (
                <p className="mt-1 font-display text-2xl text-ink">
                  {formatUsd(data.totalSavingsUsd)}
                </p>
              )}
            </div>
          </div>
        </motion.section>

        {/* SAVINGS */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <span className="label-mono">Savings</span>
          <div className="mt-4 space-y-3">
            {data.userLoading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : data.hasPositions ? (
              data.positions.map((p) => (
                <PositionCard
                  key={`${p.vault.id}-${p.vault.chain.id}`}
                  vault={p.vault}
                  position={p.position}
                  prices={data.prices}
                  goal={goals?.[p.vault.id]}
                  onTap={onPositionTap}
                />
              ))
            ) : (
              <div className="rounded-lg border border-border p-5">
                <p className="font-body text-sm text-ink-light">
                  No savings goals yet. Start a conversation below to set one
                  up.
                </p>
              </div>
            )}
          </div>
        </motion.section>

        {/* YIELDS */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.2,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <span className="label-mono">Yields Available</span>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {data.vaultsLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              data.baseVaults.map((vault) => (
                <VaultCard
                  key={`${vault.id}-${vault.chain.id}`}
                  vault={vault}
                  onTap={onVaultTap}
                />
              ))
            )}
          </div>
        </motion.section>

        {/* RECENT ACTIVITY */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <span className="label-mono">Recent Activity</span>
          <div className="mt-4">
            <ActivityList activities={activities ?? []} />
          </div>
        </motion.section>
      </div>
    </div>
  );
}
