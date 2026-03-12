"use client";

import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import type { DashboardData } from "@/hooks/use-dashboard-data";
import { useChatSheet } from "@/contexts/chat-context";
import { formatUsd, formatApy } from "@/lib/format";

interface OverviewScreenProps {
  data: DashboardData;
}

export function OverviewScreen({ data }: OverviewScreenProps) {
  const { user } = usePrivy();
  const { open } = useChatSheet();
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

  return (
    <div className="flex min-h-[calc(100dvh-5rem)] flex-col justify-center px-6 sm:px-10">
      <div className="mx-auto w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-display text-4xl leading-snug text-ink sm:text-5xl">
            Hey {name},
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.15,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-8"
        >
          {data.hasPositions ? (
            <p className="font-body text-xl leading-relaxed text-ink-light">
              Your savings are worth{" "}
              <span className="text-ink">{formatUsd(data.totalSavingsUsd)}</span>
              {bestApy > 0 && (
                <>
                  , earning up to{" "}
                  <span className="text-sage">{formatApy(String(bestApy))}</span>
                </>
              )}
              . Swipe to see the details.
            </p>
          ) : (
            <p className="font-body text-xl leading-relaxed text-ink-light">
              You haven&apos;t started saving yet. Tell me what you&apos;re
              saving for and I&apos;ll help you get started.
            </p>
          )}
        </motion.div>

        {!data.hasPositions && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mt-10 flex flex-wrap gap-2"
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
                className="rounded-lg border border-border bg-cream-dark/50 px-4 py-2 font-mono text-xs tracking-wide text-ink-light transition-all duration-300 hover:border-sage/40 hover:text-ink"
              >
                {goal}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
