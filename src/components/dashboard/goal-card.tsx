"use client";

import type { VaultStatsItem } from "@yo-protocol/core";
import { formatUsd, formatApy } from "@/lib/format";
import { VAULT_FRIENDLY_NAMES, VAULT_ACCENTS } from "@/lib/constants";

interface GoalCardProps {
  goal: { name: string; targetUsd: number };
  vault: VaultStatsItem;
  onTap: (vault: VaultStatsItem) => void;
}

export function GoalCard({ goal, vault, onTap }: GoalCardProps) {
  const name = VAULT_FRIENDLY_NAMES[vault.id] || vault.name;
  const apy = formatApy(vault.yield?.["7d"]);
  const accent = VAULT_ACCENTS[vault.id];

  return (
    <button
      onClick={() => onTap(vault)}
      className="w-full rounded-xl border p-4 text-left transition-all duration-300 hover:shadow-[0_2px_16px_rgba(0,0,0,0.06)]"
      style={{
        borderColor: accent?.border || "var(--color-border)",
        backgroundColor: accent?.bg || "transparent",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="label-mono text-[10px]">{name}</span>
          <p className="mt-1 font-display text-xl text-ink">{goal.name}</p>
        </div>
        <div className="text-right">
          <span
            className="inline-block rounded-md px-2 py-0.5 font-mono text-[10px]"
            style={{
              backgroundColor: accent?.bg || "rgba(143,174,130,0.1)",
              color: accent?.color || "var(--color-sage)",
            }}
          >
            {apy}
          </span>
        </div>
      </div>

      {/* Progress bar — empty but visible as a sliver */}
      <div className="mt-3 h-1 rounded-full bg-border/60">
        <div
          className="h-full min-w-[2px] rounded-full transition-all duration-500"
          style={{ width: "0%", backgroundColor: accent?.color || "var(--color-sage)" }}
        />
      </div>

      <div className="mt-1.5 flex items-center justify-between">
        <span
          className="font-body text-[10px] tracking-wide"
          style={{ color: accent?.color || "var(--color-sage)" }}
        >
          Start saving
        </span>
        <span className="font-mono text-[10px] text-ink-light">
          $0 / {formatUsd(goal.targetUsd)}
        </span>
      </div>
    </button>
  );
}
