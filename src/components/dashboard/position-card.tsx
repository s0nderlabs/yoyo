"use client";

import type { VaultStatsItem, UserVaultPosition } from "@yo-protocol/core";
import { formatUsd, formatApy, assetsToUsd, getPrice } from "@/lib/format";
import { VAULT_FRIENDLY_NAMES, VAULT_ACCENTS } from "@/lib/constants";

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
          <p className="mt-1 font-display text-xl text-ink">
            {formatUsd(usdValue)}
          </p>
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
      {goal && (
        <>
          <div className="mt-3 h-1 rounded-full bg-border/60">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${goal.targetUsd > 0 ? Math.min(100, (usdValue / goal.targetUsd) * 100) : 0}%`,
                backgroundColor: accent?.color || "var(--color-sage)",
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
