"use client";

import type { VaultStatsItem } from "@yo-protocol/core";
import { formatApy } from "@/lib/format";
import { VAULT_FRIENDLY_NAMES } from "@/lib/constants";

interface VaultCardProps {
  vault: VaultStatsItem;
  onTap: (vault: VaultStatsItem) => void;
}

export function VaultCard({ vault, onTap }: VaultCardProps) {
  const name = VAULT_FRIENDLY_NAMES[vault.id] || vault.name;
  const apy = formatApy(vault.yield?.["7d"]);
  const bonus = vault.merklRewardYield
    ? parseFloat(vault.merklRewardYield)
    : 0;

  return (
    <button
      onClick={() => onTap(vault)}
      className="flex-none rounded-lg border border-border p-4 text-left transition-all duration-300 hover:border-sage/40 hover:shadow-[0_2px_12px_rgba(143,174,130,0.08)]"
      style={{ minWidth: "140px" }}
    >
      <span className="label-mono text-[10px]">{name}</span>
      <p className="mt-2 font-display text-2xl text-sage">{apy}</p>
      <p className="mt-1 font-mono text-[10px] text-ink-light">
        {vault.asset.symbol}
      </p>
      {bonus > 0 && (
        <p className="mt-1.5 font-mono text-[9px] text-sage/70">
          +{bonus.toFixed(1)}% rewards
        </p>
      )}
    </button>
  );
}
