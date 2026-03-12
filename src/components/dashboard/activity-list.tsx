"use client";

import { VAULT_FRIENDLY_NAMES } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format";

export interface ActivityItem {
  type: "deposit" | "withdraw" | "swap";
  amount: string;
  tokenSymbol: string;
  vaultId?: string;
  txHash?: string;
  createdAt: string;
}

function activityDescription(item: ActivityItem): string {
  const vaultName = item.vaultId
    ? VAULT_FRIENDLY_NAMES[item.vaultId] || item.vaultId
    : item.tokenSymbol;
  switch (item.type) {
    case "deposit":
      return `Saved to ${vaultName}`;
    case "withdraw":
      return `Withdrew from ${vaultName}`;
    case "swap":
      return `Swapped ${item.tokenSymbol}`;
  }
}

const ICON_PATHS: Record<ActivityItem["type"], string> = {
  deposit: "M12 5v14M5 12l7 7 7-7",
  withdraw: "M12 19V5M19 12l-7-7-7 7",
  swap: "M7 10l-3 3 3 3M17 14l3-3-3-3M6 13h12",
};

interface ActivityListProps {
  activities: ActivityItem[];
}

export function ActivityList({ activities }: ActivityListProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-lg border border-border p-5">
        <p className="font-body text-sm text-ink-light">
          No activity yet. Your transactions will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border">
      {activities.map((item, i) => {
        const iconPath = ICON_PATHS[item.type];
        const iconBg =
          item.type === "deposit" ? "bg-sage/10" : "bg-ink/[0.04]";
        const iconColor =
          item.type === "deposit" ? "text-sage" : "text-ink-light";

        const inner = (
          <>
            <div
              className={`flex h-8 w-8 flex-none items-center justify-center rounded-full ${iconBg}`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                className={iconColor}
              >
                <path
                  d={iconPath}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-body text-sm text-ink">
                {activityDescription(item)}
              </p>
              <p className="font-mono text-[10px] text-ink-light">
                {formatRelativeTime(item.createdAt)}
              </p>
            </div>
            <span className="flex-none font-mono text-xs text-ink">
              {item.amount} {item.tokenSymbol}
            </span>
          </>
        );

        const rowClass = `flex items-center gap-3 px-4 py-3 transition-colors duration-200 ${
          item.txHash ? "hover:bg-cream-dark/40" : ""
        }${i < activities.length - 1 ? " border-b border-border/40" : ""}`;

        return item.txHash ? (
          <a
            key={item.txHash}
            href={`https://basescan.org/tx/${item.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className={rowClass}
          >
            {inner}
          </a>
        ) : (
          <div key={i} className={rowClass}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
