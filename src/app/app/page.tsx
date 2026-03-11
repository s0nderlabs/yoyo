"use client";

import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import { useState, useRef } from "react";

function OverviewScreen() {
  const { user } = usePrivy();
  const name = user?.google?.name?.split(" ")[0] ||
    user?.apple?.firstName ||
    "there";

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
          <p className="font-body text-xl leading-relaxed text-ink-light">
            You haven&apos;t started saving yet. Tell me what you&apos;re saving
            for and I&apos;ll help you get started.
          </p>
        </motion.div>

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
              className="rounded-lg border border-border bg-cream-dark/50 px-4 py-2 font-mono text-xs tracking-wide text-ink-light transition-all duration-300 hover:border-sage/40 hover:text-ink"
            >
              {goal}
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function DetailsScreen() {
  return (
    <div className="min-h-[calc(100dvh-5rem)] px-6 pt-16 pb-8 sm:px-10">
      <div className="mx-auto w-full max-w-lg space-y-10">
        {/* YOUR ACCOUNTS */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="label-mono">Your accounts</span>
          <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
            <div className="bg-cream p-4">
              <span className="label-mono text-[10px]">Balance</span>
              <p className="mt-1 font-display text-2xl text-ink">$0</p>
            </div>
            <div className="bg-cream p-4">
              <span className="label-mono text-[10px]">Savings</span>
              <p className="mt-1 font-display text-2xl text-ink">$0</p>
            </div>
          </div>
        </motion.section>

        {/* SAVINGS */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <span className="label-mono">Savings</span>
          <div className="mt-4 rounded-lg border border-border p-5">
            <p className="font-body text-sm text-ink-light">
              No savings goals yet. Start a conversation below to set one up.
            </p>
          </div>
        </motion.section>

        {/* YIELDS */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.2,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <span className="label-mono">Yields available</span>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { name: "yoUSD", asset: "USDC", apy: "5.1%", color: "text-sage" },
              { name: "yoETH", asset: "WETH", apy: "3.2%", color: "text-sage" },
              { name: "yoBTC", asset: "cbBTC", apy: "1.0%", color: "text-sage" },
              { name: "yoEUR", asset: "EURC", apy: "12.3%", color: "text-sage" },
            ].map((vault) => (
              <button
                key={vault.name}
                className="flex-none rounded-lg border border-border p-4 transition-all duration-300 hover:border-sage/40 hover:shadow-[0_2px_12px_rgba(143,174,130,0.08)]"
                style={{ minWidth: "140px" }}
              >
                <span className="label-mono text-[10px]">{vault.name}</span>
                <p className={`mt-2 font-display text-2xl ${vault.color}`}>
                  {vault.apy}
                </p>
                <p className="mt-1 font-mono text-[10px] text-ink-light">
                  {vault.asset}
                </p>
              </button>
            ))}
          </div>
        </motion.section>

        {/* RECENT ACTIVITY */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <span className="label-mono">Recent activity</span>
          <div className="mt-4 rounded-lg border border-border p-5">
            <p className="font-body text-sm text-ink-light">
              No activity yet. Your transactions will appear here.
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [activeScreen, setActiveScreen] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const width = scrollRef.current.offsetWidth;
    setActiveScreen(scrollLeft > width * 0.5 ? 1 : 0);
  };

  return (
    <div className="relative">
      {/* Header chrome */}
      <div className="fixed top-0 right-0 left-0 z-30 flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),12px)] pb-2">
        {/* Gear icon */}
        <button className="rounded-full p-2 transition-colors duration-200 hover:bg-ink/[0.04]">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="text-ink-light"
          >
            <path
              d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M16.2 12.5a1.4 1.4 0 00.3 1.5l.05.05a1.7 1.7 0 11-2.4 2.4l-.05-.05a1.4 1.4 0 00-1.5-.3 1.4 1.4 0 00-.85 1.28v.15a1.7 1.7 0 01-3.4 0v-.08a1.4 1.4 0 00-.92-1.28 1.4 1.4 0 00-1.5.3l-.05.05a1.7 1.7 0 11-2.4-2.4l.05-.05a1.4 1.4 0 00.3-1.5 1.4 1.4 0 00-1.28-.85h-.15a1.7 1.7 0 010-3.4h.08a1.4 1.4 0 001.28-.92 1.4 1.4 0 00-.3-1.5l-.05-.05a1.7 1.7 0 112.4-2.4l.05.05a1.4 1.4 0 001.5.3h.07a1.4 1.4 0 00.85-1.28v-.15a1.7 1.7 0 013.4 0v.08a1.4 1.4 0 00.85 1.28 1.4 1.4 0 001.5-.3l.05-.05a1.7 1.7 0 112.4 2.4l-.05.05a1.4 1.4 0 00-.3 1.5v.07a1.4 1.4 0 001.28.85h.15a1.7 1.7 0 010 3.4h-.08a1.4 1.4 0 00-1.28.85z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </button>

        {/* Dot indicators */}
        <div className="flex gap-1.5">
          <div
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
              activeScreen === 0 ? "bg-ink" : "bg-border"
            }`}
          />
          <div
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
              activeScreen === 1 ? "bg-ink" : "bg-border"
            }`}
          />
        </div>
      </div>

      {/* Swipeable screens */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="w-full flex-none snap-center">
          <OverviewScreen />
        </div>
        <div className="w-full flex-none snap-center">
          <DetailsScreen />
        </div>
      </div>
    </div>
  );
}
