"use client";

import { VAULT_FRIENDLY_NAMES } from "@/lib/constants";

interface ToolResultCardProps {
  toolName: string;
  result: unknown;
}

export function ToolResultCard({
  toolName,
  result,
}: ToolResultCardProps) {

  const data = typeof result === "string" ? JSON.parse(result) : result;

  if (toolName === "get_vault_rates" && Array.isArray(data)) {
    return (
      <div className="my-2 space-y-1.5 rounded-xl border border-border/60 bg-cream-dark/30 px-4 py-3">
        <span className="label-mono text-[10px]">Current rates</span>
        {data.map((v: any) => (
          <div
            key={v.id}
            className="flex items-center justify-between"
          >
            <span className="font-body text-xs text-ink">
              {VAULT_FRIENDLY_NAMES[v.id] || v.name}
            </span>
            <span className="rounded-md bg-sage/10 px-1.5 py-0.5 font-mono text-[10px] text-sage">
              {v.apy}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (toolName === "get_wallet_balance" && data && !data.error) {
    return (
      <div className="my-2 space-y-1.5 rounded-xl border border-border/60 bg-cream-dark/30 px-4 py-3">
        <span className="label-mono text-[10px]">Wallet balance</span>
        {data.tokens?.map((t: any, i: number) => (
          <div
            key={i}
            className="flex items-center justify-between"
          >
            <span className="font-mono text-xs text-ink">{t.symbol}</span>
            <span className="font-mono text-xs text-ink-light">
              {t.balance}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
