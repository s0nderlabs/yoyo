"use client";

import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { motion, AnimatePresence } from "framer-motion";
import type { VaultStatsItem } from "@yo-protocol/core";
import type { DashboardData } from "@/hooks/use-dashboard-data";
import { useChatSheet } from "@/contexts/chat-context";
import { formatUsd, formatApy } from "@/lib/format";
import { VAULT_LOGOS, VAULT_FRIENDLY_NAMES } from "@/lib/constants";
import { OdometerNumber } from "@/components/ui/odometer-number";
import { PositionCard } from "./position-card";
import { VaultCard } from "./vault-card";
import { ActivityList, type ActivityItem } from "./activity-list";

interface OverviewScreenProps {
  data: DashboardData;
  activities?: ActivityItem[];
  goals?: Record<string, { name: string; targetUsd: number }>;
  onVaultTap: (vault: VaultStatsItem) => void;
  onPositionTap: (vault: VaultStatsItem) => void;
  onRefresh?: () => Promise<void>;
}

/* ── Time-aware greeting ──────────────────────────────────── */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 21) return "Good evening";
  return "Hey";
}

/* ── Daily hash for rotating content ─────────────────────── */

function hashOfDay(): number {
  const s = new Date().toDateString();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/* ── Closing line ────────────────────────────────────────── */

function getCloser(hasPositions: boolean, apy: number, totalSavings: number): string {
  if (hasPositions && apy > 0) {
    const daily = formatUsd((totalSavings * apy) / 100 / 365);
    const mult = Math.round(apy / 0.5);
    const doubling = Math.round(72 / apy);
    const templates = [
      `That\u2019s roughly ${daily} every day \u2014 while you sleep.`,
      `That\u2019s ${mult}x what a typical savings account pays.`,
      `At this rate, your money doubles in ~${doubling} years.`,
      `Your money hasn\u2019t taken a single day off.`,
    ];
    return templates[hashOfDay() % templates.length];
  }

  const mult = apy > 0 ? Math.round(apy / 0.5) : 10;
  const templates = [
    `That\u2019s ${mult}x more than the average savings account.`,
    `Your money could be earning while you sleep.`,
    `Same money, better returns. No lock-ups, no fees.`,
    `Most people leave their money sitting idle.`,
  ];
  return templates[hashOfDay() % templates.length];
}

/* ── Vault display labels ────────────────────────────────── */

const VAULT_SHORT: Record<string, string> = {
  yoUSD: "USD",
  yoETH: "ETH",
  yoBTC: "BTC",
  yoEUR: "EUR",
  yoGOLD: "Gold",
  yoUSDT: "USDT",
};

/* ── Animations ──────────────────────────────────────────── */

const ease = [0.16, 1, 0.3, 1] as const;

const greetReveal = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.8, ease },
};

const deckReveal = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay: 0.2, ease },
};

const proseReveal = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay: 0.4, ease },
};

const sectionReveal = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay: 0.6 + i * 0.1, ease },
});

const chipsReveal = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay: 0.8, ease },
};

/* ── Narration text highlighting ──────────────────────────── */

const HIGHLIGHT_TOKENS = ["ETH", "WETH", "USDC", "USDT", "cbBTC", "BTC", "EURC", "EUR", "USD", "Gold"];
const HIGHLIGHT_VAULTS = Object.values(VAULT_FRIENDLY_NAMES);
const HIGHLIGHT_PATTERN = (() => {
  const vaultEscaped = HIGHLIGHT_VAULTS.map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const tokensSorted = [...HIGHLIGHT_TOKENS].sort((a, b) => b.length - a.length);
  return new RegExp(
    `(\\$[\\d,.]+|\\d+\\.\\d{2,}|\\b(?:${vaultEscaped.join("|")})|\\b(?:${tokensSorted.join("|")})\\b)`,
    "gi",
  );
})();

function highlightNarration(text: string): React.ReactNode[] {
  const pattern = new RegExp(HIGHLIGHT_PATTERN.source, HIGHLIGHT_PATTERN.flags);

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const m = match[0];
    const isAmount = /^\$|^\d+\.\d{2,}$/.test(m);
    parts.push(
      <span
        key={match.index}
        className={
          isAmount
            ? "font-display underline decoration-sage/30 decoration-[1.5px] underline-offset-4"
            : "font-display"
        }
      >
        {m}
      </span>,
    );
    lastIndex = pattern.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

/* ── Card grain overlay ──────────────────────────────────── */

function CardGrain() {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[0.03] mix-blend-multiply"
      style={{ backgroundImage: "url(/noise.svg)", backgroundSize: "200px 200px" }}
    />
  );
}

/* ── Wallet icon ─────────────────────────────────────────── */

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="6" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="17" cy="14.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

/* ── Component ────────────────────────────────────────────── */

export function OverviewScreen({
  data,
  activities,
  goals,
  onVaultTap,
  onPositionTap,
  onRefresh,
}: OverviewScreenProps) {
  const { user } = usePrivy();
  const { open } = useChatSheet();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState(0);
  const [activityMode, setActivityMode] = useState<"prose" | "list">("prose");
  const [narration, setNarration] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem("yoyo:narration-cache");
    } catch { return null; }
  });
  const [narrationLoading, setNarrationLoading] = useState(false);

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0 && !refreshing) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, [refreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === 0 || refreshing) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) setPullDistance(Math.min(delta * 0.4, 100));
  }, [refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > 60 && onRefresh) {
      setRefreshing(true);
      try { await onRefresh(); } catch {}
      setRefreshing(false);
    }
    setPullDistance(0);
    touchStartY.current = 0;
  }, [pullDistance, onRefresh]);

  // Cache-aware display values
  const displaySavings = data.userLoading
    ? (data.cache?.totalSavingsUsd ?? null)
    : data.totalSavingsUsd;

  const displayBalance = data.userLoading
    ? (data.cache?.walletBalanceUsd ?? null)
    : data.walletBalanceUsd;

  const displayVaultIds = data.userLoading
    ? (data.cache?.positionVaultIds ?? [])
    : [...new Set(data.positions.map((p) => p.vault.id))];

  // Fetch AI narration when activities exist
  const hasActivities = (activities?.length ?? 0) > 0;
  useEffect(() => {
    if (!hasActivities) return;
    const controller = new AbortController();
    setNarrationLoading(true);
    fetch("/api/activity/narrate", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((d) => {
        const text = d.narration ?? null;
        setNarration(text);
        if (text) try { localStorage.setItem("yoyo:narration-cache", text); } catch {}
      })
      .catch((e) => { if (e.name !== "AbortError") setNarration(null); })
      .finally(() => setNarrationLoading(false));
    return () => controller.abort();
  }, [hasActivities]);

  const name =
    user?.google?.name?.split(" ")[0] ||
    (user?.apple as { firstName?: string } | undefined)?.firstName ||
    "there";

  const bestApy = data.baseVaults.length
    ? data.baseVaults.reduce((best, v) => {
        const apy = parseFloat(v.yield?.["7d"] || "0");
        return apy > best ? apy : best;
      }, 0)
    : 0;

  const closer = useMemo(
    () => getCloser(data.hasPositions || (data.cache?.positionVaultIds?.length ?? 0) > 0, bestApy, data.totalSavingsUsd || data.cache?.totalSavingsUsd || 0),
    [data.hasPositions, data.cache, bestApy, data.totalSavingsUsd],
  );

  const availableVaultIds = useMemo(
    () => [...new Set(data.baseVaults.map((v) => v.id))],
    [data.baseVaults],
  );

  // Cache-aware flags — show content if real data OR cache is available
  const hasData = !data.userLoading || data.cache !== null;
  const showPositions = data.hasPositions || (data.userLoading && (data.cache?.positionVaultIds?.length ?? 0) > 0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !el.children[0]) return;
    const cardWidth = (el.children[0] as HTMLElement).offsetWidth;
    const gap = 16;
    const idx = Math.round(el.scrollLeft / (cardWidth + gap));
    setActiveCard(Math.min(1, Math.max(0, idx)));
  }, []);

  const cardBase =
    "relative overflow-hidden rounded-[2rem] bg-cream shadow-[0_4px_20px_rgba(0,0,0,0.08)]";

  const savingsTint =
    "pointer-events-none absolute inset-0 rounded-[inherit] border border-sage/30 bg-[rgba(143,174,130,0.22)]";

  const balanceTint =
    "pointer-events-none absolute inset-0 rounded-[inherit] border border-[rgba(184,148,62,0.25)] bg-[rgba(184,148,62,0.16)]";

  return (
    <div
      className="relative min-h-dvh"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Organic mesh gradient ──────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse at 25% 0%, rgba(143,174,130,0.07) 0%, transparent 50%)",
            "radial-gradient(ellipse at 75% 60%, rgba(107,137,168,0.04) 0%, transparent 50%)",
          ].join(", "),
        }}
      />
      {/* ── Enhanced grain overlay ─────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "url(/noise.svg)",
          backgroundSize: "200px 200px",
          opacity: 0.05,
          mixBlendMode: "multiply",
        }}
      />

      {/* ── Content ────────────────────────────────────── */}
      <div className="relative pt-20 pb-36">
        <div className="px-6 sm:px-10">
          <div className="mx-auto w-full max-w-lg">
            {/* ── Pull-to-refresh indicator ────────────────── */}
            {(pullDistance > 0 || refreshing) && (
              <div
                className="flex items-center justify-center overflow-hidden transition-[height] duration-200"
                style={{ height: refreshing ? 40 : pullDistance * 0.5 }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`text-ink-light/40 ${refreshing ? "animate-spin" : ""}`}
                  style={!refreshing ? { transform: `rotate(${pullDistance * 3}deg)` } : undefined}
                >
                  <path
                    d="M21 12a9 9 0 1 1-6.2-8.6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            )}

            {/* ── Greeting ───────────────────────────────── */}
            <motion.h1
              {...greetReveal}
              className="font-display text-[2rem] leading-snug text-ink sm:text-[2.5rem]"
            >
              {getGreeting()}, {name}{" "}
              <span className="inline-block origin-[70%_70%] animate-[wave-loop_8s_ease-in-out_infinite]">
                👋
              </span>
            </motion.h1>
          </div>
        </div>

        {/* ── Card carousel ──────────────────────────────── */}
        <motion.div {...deckReveal} className="mt-8">
          {displaySavings === null ? (
            <div className="px-6 sm:px-10">
              <div className="mx-auto max-w-lg">
                <div className={cardBase}>
                  <div className={savingsTint} />
                  <div className="relative aspect-[1.6/1] p-7">
                    <div className="h-4 w-20 animate-pulse rounded bg-ink/[0.06]" />
                    <div className="mt-6 h-10 w-32 animate-pulse rounded bg-ink/[0.08]" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 sm:px-10"
              >
                {/* ── Savings card ────────────────────────── */}
                <motion.div
                  className="w-full flex-none snap-center"
                  animate={{ opacity: activeCard === 0 ? 1 : 0.6 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={cardBase}>
                    <div className={savingsTint} />
                    <CardGrain />
                    <div className="relative flex aspect-[1.6/1] flex-col justify-between p-7">
                      <p className="font-mono text-[10px] tracking-[0.12em] text-ink-light/50 uppercase">
                        {data.hasPositions || displayVaultIds.length > 0 ? "Total Savings" : "Earn up to"}
                      </p>
                      {data.hasPositions || displayVaultIds.length > 0 ? (
                        <OdometerNumber
                          value={displaySavings}
                          format={formatUsd}
                          className="font-display text-[2.5rem] leading-none tracking-tight text-ink sm:text-[3rem]"
                        />
                      ) : (
                        <p className="font-display text-[2.5rem] leading-none tracking-tight text-sage sm:text-[3rem]">
                          {bestApy > 0 ? formatApy(String(bestApy)) : "5.0%"}
                        </p>
                      )}
                      <div className="flex items-center justify-end gap-3">
                        {(displayVaultIds.length > 0 ? displayVaultIds : availableVaultIds).map((id) => {
                          const logo = VAULT_LOGOS[id];
                          const label = VAULT_SHORT[id] || id;
                          return (
                            <div key={id} className="flex flex-col items-center gap-1.5">
                              {logo && (
                                <img
                                  src={logo}
                                  alt={label}
                                  width={32}
                                  height={32}
                                  className="h-8 w-8 rounded-full"
                                />
                              )}
                              <span className="font-mono text-[9px] tracking-wide text-ink-light/40">
                                {label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* ── Balance card ────────────────────────── */}
                <motion.div
                  className="w-full flex-none snap-center"
                  animate={{ opacity: activeCard === 1 ? 1 : 0.6 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={cardBase}>
                    <div className={balanceTint} />
                    <CardGrain />
                    <div className="relative flex aspect-[1.6/1] flex-col justify-between p-7">
                      <p className="font-mono text-[10px] tracking-[0.12em] text-ink-light/50 uppercase">
                        Wallet Balance
                      </p>
                      <OdometerNumber
                        value={displayBalance ?? 0}
                        format={formatUsd}
                        className="font-display text-[2.5rem] leading-none tracking-tight text-ink sm:text-[3rem]"
                      />
                      <div className="flex items-center justify-end">
                        <WalletIcon className="h-8 w-8 text-ink/15" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* ── Dot indicators ──────────────────────── */}
              <div className="mt-4 flex justify-center gap-1.5">
                {[0, 1].map((i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                      activeCard === i ? "bg-ink" : "bg-ink/20"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* ── Editorial prose (APY + closer) ──────────────── */}
        <div className="px-6 sm:px-10">
          <div className="mx-auto w-full max-w-lg">
            {hasData && showPositions && (
              <motion.p
                {...proseReveal}
                className="mt-6 font-body text-[1.25rem] leading-relaxed text-ink sm:text-[1.4rem]"
              >
                Your money is earning{" "}
                <span className="underline decoration-sage/40 decoration-[1.5px] underline-offset-4">
                  {formatApy(String(bestApy))}
                </span>
                {" "}annually. {closer}
              </motion.p>
            )}

            {hasData && !showPositions && (
              <motion.p
                {...proseReveal}
                className="mt-6 font-body text-[1.25rem] leading-relaxed text-ink sm:text-[1.4rem]"
              >
                {closer}
              </motion.p>
            )}

            {/* ── Positions ──────────────────────────────── */}
            {hasData && showPositions && (
              <motion.section {...sectionReveal(0)} className="mt-10">
                <p className="font-body text-[1.25rem] leading-relaxed text-ink sm:text-[1.4rem]">
                  Here&rsquo;s where your money is working.
                </p>
                <div className="mt-4 space-y-3">
                  {data.positions.length > 0 ? (
                    data.positions.map((p) => (
                      <PositionCard
                        key={`${p.vault.id}-${p.vault.chain.id}`}
                        vault={p.vault}
                        position={p.position}
                        prices={data.prices}
                        goal={goals?.[p.vault.id]}
                        onTap={onPositionTap}
                      />
                    ))
                  ) : (
                    <div className="h-16 animate-pulse rounded-xl bg-ink/[0.04]" />
                  )}
                </div>
              </motion.section>
            )}
          </div>
        </div>

        {/* ── Vaults (horizontal scroll, full-bleed) ──── */}
        {!data.vaultsLoading && data.baseVaults.length > 0 && (
          <motion.section {...sectionReveal(1)} className="mt-10">
            <div className="px-6 sm:px-10">
              <div className="mx-auto w-full max-w-lg">
                <p className="font-body text-[1.25rem] leading-relaxed text-ink sm:text-[1.4rem]">
                  {showPositions
                    ? "You could also earn across these."
                    : "Here\u2019s what you could be earning."}
                </p>
              </div>
            </div>
            <div className="relative mt-4">
              <div className="flex gap-3 overflow-x-auto px-6 pb-2 sm:px-10">
                {data.baseVaults.map((vault) => (
                  <VaultCard
                    key={`${vault.id}-${vault.chain.id}`}
                    vault={vault}
                    onTap={onVaultTap}
                  />
                ))}
                <div className="w-3 flex-none" />
              </div>
              <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-cream to-transparent" />
            </div>
          </motion.section>
        )}

        {/* ── Activity ───────────────────────────────────── */}
        {((activities && activities.length > 0) || narration) && (
          <div className="px-6 sm:px-10">
            <div className="mx-auto w-full max-w-lg">
              <motion.section {...sectionReveal(2)} className="mt-10">
                <div className="flex items-center gap-3">
                  <p className="font-body text-[1.25rem] leading-relaxed text-ink sm:text-[1.4rem]">
                    And here&rsquo;s what happened recently.
                  </p>
                  <button
                    onClick={() => setActivityMode((m) => (m === "prose" ? "list" : "prose"))}
                    className="flex-none text-ink-light/35 transition-colors duration-200 hover:text-ink-light"
                    aria-label={activityMode === "prose" ? "Switch to list view" : "Switch to prose view"}
                  >
                    {activityMode === "prose" ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4h12M2 8h12M2 12h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="mt-4">
                  <AnimatePresence mode="wait">
                    {activityMode === "prose" ? (
                      <motion.div
                        key="prose"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {narrationLoading ? (
                          <>
                            <div className="h-5 w-3/4 animate-pulse rounded bg-ink/[0.06]" />
                            <div className="mt-2 h-5 w-1/2 animate-pulse rounded bg-ink/[0.06]" />
                          </>
                        ) : narration ? (
                          <p className="font-body text-[1.25rem] leading-relaxed text-ink sm:text-[1.4rem]">
                            {highlightNarration(narration)}
                          </p>
                        ) : (
                          <ActivityList activities={(activities ?? []).slice(0, 5)} />
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <ActivityList activities={(activities ?? []).slice(0, 5)} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.section>
            </div>
          </div>
        )}

        {/* ── Quick-start chips (empty state) ────────────── */}
        {hasData && !showPositions && (
          <div className="px-6 sm:px-10">
            <div className="mx-auto w-full max-w-lg">
              <motion.div
                {...chipsReveal}
                className="mt-6 flex flex-wrap gap-2"
              >
                {["Emergency fund", "Vacation", "Just earning"].map((goal) => (
                  <button
                    key={goal}
                    onClick={() =>
                      open(
                        goal === "Just earning"
                          ? "I just want to earn the best interest on my money"
                          : `I want to start saving for ${goal.toLowerCase()}`
                      )
                    }
                    className="rounded-full border border-border/60 bg-white/30 px-4 py-2.5 font-mono text-xs tracking-wide text-ink-light backdrop-blur-sm transition-all duration-300 hover:border-sage/40 hover:text-ink"
                  >
                    {goal}
                  </button>
                ))}
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
