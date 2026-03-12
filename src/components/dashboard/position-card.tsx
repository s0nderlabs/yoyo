"use client";

import type { VaultStatsItem, UserVaultPosition } from "@yo-protocol/core";
import { formatUsd, formatApy, assetsToUsd } from "@/lib/format";
import { VAULT_FRIENDLY_NAMES } from "@/lib/constants";

interface PositionCardProps {
  vault: VaultStatsItem;
  position: UserVaultPosition;
  prices: Record<string, number>;
  onTap: (vault: VaultStatsItem) => void;
}

export function PositionCard({
  vault,
  position,
  prices,
  onTap,
}: PositionCardProps) {
  const name = VAULT_FRIENDLY_NAMES[vault.id] || vault.name;
  const price = prices[vault.asset.symbol.toLowerCase()];
  const usdValue = assetsToUsd(position.assets, vault.asset.decimals, price);
  const apy = formatApy(vault.yield?.["7d"]);

  return (
    <button
      onClick={() => onTap(vault)}
      className="w-full rounded-lg border border-border p-4 text-left transition-all duration-300 hover:border-sage/40"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="label-mono text-[10px]">{name}</span>
          <p className="mt-1 font-display text-xl text-ink">
            {formatUsd(usdValue)}
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block rounded-md bg-sage/10 px-2 py-0.5 font-mono text-[10px] text-sage">
            {apy}
          </span>
        </div>
      </div>
    </button>
  );
}
