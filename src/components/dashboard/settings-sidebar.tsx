"use client";

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
                <span className="font-display text-xl text-ink">Settings</span>
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

              <div className="mt-8 space-y-4">
                {email && (
                  <div>
                    <span className="label-mono text-[10px]">Account</span>
                    <p className="mt-1 font-body text-sm text-ink">{email}</p>
                  </div>
                )}
                {walletAddress && (
                  <div>
                    <span className="label-mono text-[10px]">Wallet</span>
                    <p className="mt-1 font-mono text-xs text-ink-light">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </p>
                  </div>
                )}
                {walletBalanceUsd !== undefined && (
                  <div>
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
