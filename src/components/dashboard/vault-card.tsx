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

  const logo = VAULT_LOGOS[vault.id];

  return (
    <button
      onClick={() => onTap(vault)}
      className="group relative min-w-[150px] flex-none overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 hover:shadow-[0_2px_16px_rgba(0,0,0,0.06)] lg:min-w-0"
      style={{
        borderColor: accent?.border || "var(--color-border)",
        backgroundColor: accent?.bg || "transparent",
      }}
    >
      {/* Token logo watermark */}
      {logo && (
        <img
          src={logo}
          alt=""
          className="pointer-events-none absolute -right-3 -bottom-3 h-24 w-24 select-none rounded-full opacity-[0.07]"
          aria-hidden="true"
        />
      )}
      <span className="relative label-mono text-[10px]">{name}</span>
      <p
        className="relative mt-2 font-display text-3xl"
        style={{ color: accent?.color || "var(--color-sage)" }}
      >
        {apy}
      </p>
      <p className="relative mt-1 font-body text-[10px] text-ink-light">
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
