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
      className="w-full overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
      style={{
        borderColor: accent?.border || "var(--color-border)",
        background: accent
          ? `linear-gradient(to bottom, ${accent.bg}, rgba(255,254,242,0.4))`
          : "transparent",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="font-body text-[10px] tracking-[0.02em] text-ink-light">{name}</span>
          <p className="mt-1 font-display text-xl text-ink">
            {formatUsd(usdValue)}
          </p>
        </div>
        <span
          className="inline-block rounded-md px-2 py-0.5 font-body text-[10px]"
          style={{
            backgroundColor: accent?.bg || "rgba(143,174,130,0.1)",
            color: accent?.color || "var(--color-sage)",
          }}
        >
          {apy}
        </span>
      </div>
      {goal && (
        <>
          <div className="mt-3 h-1.5 rounded-full bg-border/50">
            <div
              className="h-full min-w-[3px] rounded-full transition-all duration-500"
              style={{
                width: `${goal.targetUsd > 0 ? Math.min(100, (usdValue / goal.targetUsd) * 100) : 0}%`,
                backgroundColor: accent?.color || "var(--color-sage)",
              }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="font-display text-[11px] italic text-ink-light">
              {goal.name}
            </span>
            <span className="font-body text-[10px] text-ink-light/60">
              {formatUsd(usdValue)} / {formatUsd(goal.targetUsd)}
            </span>
          </div>
        </>
      )}
    </button>
  );
}
