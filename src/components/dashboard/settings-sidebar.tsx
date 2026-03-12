"use client";

import { useState } from "react";
import { usePrivy, useLogout } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatUsd } from "@/lib/format";

interface SettingsSidebarProps {
  open: boolean;
  onClose: () => void;
  walletBalanceUsd?: number;
}

function CopyableWallet({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const copy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      <span className="label-mono text-[10px]">Wallet</span>
      <button
        onClick={copy}
        className="mt-1 flex items-center gap-1.5 rounded-md px-0 py-0 font-mono text-sm text-ink transition-colors duration-200 hover:text-ink-light"
      >
        <span>{truncated}</span>
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-sage">
            <path d="M3 7.5l2.5 2.5L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-ink-light">
            <rect x="5" y="5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M9 5V3.5A1.5 1.5 0 007.5 2h-4A1.5 1.5 0 002 3.5v4A1.5 1.5 0 003.5 9H5" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        )}
      </button>
    </div>
  );
}

export function SettingsSidebar({
  open,
  onClose,
  walletBalanceUsd,
}: SettingsSidebarProps) {
  const { user } = usePrivy();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout } = useLogout({
    onSuccess: () => {
      queryClient.clear();
      router.push("/");
    },
  });

  const walletAddress = user?.smartWallet?.address ?? user?.wallet?.address;
  const email = user?.email?.address || user?.google?.email;
  const displayName =
    user?.google?.name || (user?.apple as { name?: string } | undefined)?.name || email || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-ink/20 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 z-50 h-full w-72 border-r border-border/40 bg-cream p-6"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage/10">
                    <span className="font-display text-sm text-sage">
                      {initial}
                    </span>
                  </div>
                  <span className="font-display text-lg text-ink">
                    {displayName.split(" ")[0]}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-1.5 transition-colors duration-200 hover:bg-ink/[0.04]"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="text-ink-light"
                  >
                    <path
                      d="M4 4l8 8M12 4l-8 8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {email && (
                <p className="mt-1.5 pl-12 font-mono text-[10px] text-ink-light">
                  {email}
                </p>
              )}

              <div className="mt-6 h-px bg-border/60" />

              <div className="mt-5 space-y-4">
                {walletAddress && (
                  <div className="rounded-lg bg-cream-dark/30 p-3">
                    <CopyableWallet address={walletAddress} />
                  </div>
                )}

                <div className="h-px bg-border/60" />

                {walletBalanceUsd !== undefined && (
                  <div className="rounded-lg bg-cream-dark/30 p-3">
                    <span className="label-mono text-[10px]">Balance</span>
                    <p className="mt-1 font-display text-lg text-ink">
                      {formatUsd(walletBalanceUsd)}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex-1" />

              <button
                onClick={() => logout()}
                className="w-full rounded-lg border border-fail/20 px-4 py-2.5 font-mono text-xs tracking-wide text-fail transition-colors duration-200 hover:bg-fail/5"
              >
                Log out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
