"use client";

import type { VaultStatsItem, UserVaultPosition } from "@yo-protocol/core";
import { formatUsd, formatApy, assetsToUsd, getPrice } from "@/lib/format";
import { VAULT_FRIENDLY_NAMES } from "@/lib/constants";

interface PositionCardProps {
  vault: VaultStatsItem;
  position: UserVaultPosition;
  prices: Record<string, number>;
  goal?: { name: string; targetUsd: number };
  onTap: (vault: VaultStatsItem) => void;
}

export function PositionCard({
  vault,
  position,
  prices,
  goal,
  onTap,
}: PositionCardProps) {
  const name = VAULT_FRIENDLY_NAMES[vault.id] || vault.name;
  const price = getPrice(prices, vault.asset.symbol);
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
      {goal && (
        <>
          <div className="mt-3 h-0.5 rounded-full bg-border">
            <div
              className="h-full rounded-full bg-sage transition-all duration-500"
              style={{
                width: `${Math.min(100, (usdValue / goal.targetUsd) * 100)}%`,
              }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="font-mono text-[10px] text-ink-light">
              {goal.name}
            </span>
            <span className="font-mono text-[10px] text-ink-light">
              {formatUsd(usdValue)} / {formatUsd(goal.targetUsd)}
            </span>
          </div>
        </>
      )}
    </button>
  );
}
