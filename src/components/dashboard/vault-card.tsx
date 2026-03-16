"use client";

import type { VaultStatsItem } from "@yo-protocol/core";
import { formatApy } from "@/lib/format";
import { VAULT_FRIENDLY_NAMES, VAULT_ACCENTS, VAULT_LOGOS } from "@/lib/constants";

interface VaultCardProps {
  vault: VaultStatsItem;
  onTap: (vault: VaultStatsItem) => void;
}

export function VaultCard({ vault, onTap }: VaultCardProps) {
  const name = VAULT_FRIENDLY_NAMES[vault.id] || vault.name;
  const apy = formatApy(vault.yield?.["7d"]);
  const accent = VAULT_ACCENTS[vault.id];
  const bonus = vault.merklRewardYield
    ? parseFloat(vault.merklRewardYield)
    : 0;

  return (
    <button
      onClick={() => onTap(vault)}
      className="group relative min-w-[150px] flex-none overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] lg:min-w-0"
      style={{
        borderColor: accent?.border || "var(--color-border)",
        background: accent
          ? `linear-gradient(to bottom, ${accent.bg}, rgba(255,254,242,0.6))`
          : "transparent",
      }}
    >
      {/* Monochrome embossed token logo */}
      {VAULT_LOGOS[vault.id] && (
        <img
          src={VAULT_LOGOS[vault.id]}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-2 -bottom-2 h-20 w-20 select-none rounded-full"
          style={{ opacity: 0.06 }}
        />
      )}
      {/* Accent bottom line */}
      <div
        className="absolute right-0 bottom-0 left-0 h-[2px]"
        style={{ backgroundColor: accent?.color || "var(--color-sage)", opacity: 0.2 }}
      />
      <span className="relative font-body text-[10px] tracking-[0.02em] text-ink-light">{name}</span>
      <p
        className="relative mt-2 font-display text-2xl"
        style={{ color: accent?.color || "var(--color-sage)" }}
      >
        {apy}
      </p>
      <p className="relative mt-1 font-body text-[10px] text-ink-light/60">
        {vault.asset.symbol}
      </p>
      {bonus > 0 && (
        <p
          className="relative mt-1.5 font-body text-[9px]"
          style={{ color: accent?.color || "var(--color-sage)", opacity: 0.7 }}
        >
          +{bonus.toFixed(1)}% rewards
        </p>
      )}
    </button>
  );
}
