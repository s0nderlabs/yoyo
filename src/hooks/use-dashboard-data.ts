"use client";

import { useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useVaults,
  useUserPositions,
  useUserBalances,
  usePrices,
} from "@yo-protocol/react";
import type { VaultStatsItem, UserVaultPosition } from "@yo-protocol/core";
import type { Address } from "viem";
import { DEFAULT_CHAIN_ID, VAULT_DISPLAY_ORDER } from "@/lib/constants";
import { assetsToUsd } from "@/lib/format";

export interface TypedPosition {
  vault: VaultStatsItem;
  position: UserVaultPosition;
}

export interface DashboardData {
  baseVaults: VaultStatsItem[];
  allVaults: VaultStatsItem[];
  vaultsLoading: boolean;

  walletAddress: Address | undefined;
  walletBalanceUsd: number;
  totalSavingsUsd: number;
  positions: TypedPosition[];
  hasPositions: boolean;
  userLoading: boolean;

  prices: Record<string, number>;

  refetchPositions: () => void;
  refetchBalances: () => void;
}

export function useDashboardData(): DashboardData {
  const { user } = usePrivy();
  const walletAddress = (user?.smartWallet?.address ?? user?.wallet?.address) as Address | undefined;

  const { vaults = [], isLoading: vaultsLoading } = useVaults();
  const {
    positions: rawPositions = [],
    isLoading: positionsLoading,
    refetch: refetchPositions,
  } = useUserPositions(walletAddress, { enabled: !!walletAddress });
  const {
    balances,
    isLoading: balancesLoading,
    refetch: refetchBalances,
  } = useUserBalances(walletAddress, { enabled: !!walletAddress });
  const { prices = {} } = usePrices();

  const baseVaults = useMemo(() => {
    const filtered = vaults.filter(
      (v: VaultStatsItem) => v.chain.id === DEFAULT_CHAIN_ID,
    );
    return filtered.sort((a: VaultStatsItem, b: VaultStatsItem) => {
      const aIdx = VAULT_DISPLAY_ORDER.indexOf(a.id as (typeof VAULT_DISPLAY_ORDER)[number]);
      const bIdx = VAULT_DISPLAY_ORDER.indexOf(b.id as (typeof VAULT_DISPLAY_ORDER)[number]);
      return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
    });
  }, [vaults]);

  const positions = useMemo(() => {
    return rawPositions
      .map((p: { vault: unknown; position: UserVaultPosition }) => ({
        vault: p.vault as VaultStatsItem,
        position: p.position,
      }))
      .filter((p) => p.position.assets > 0n);
  }, [rawPositions]);

  const totalSavingsUsd = useMemo(() => {
    return positions.reduce((sum, p) => {
      const symbol = p.vault.asset.symbol.toLowerCase();
      const price = prices[symbol];
      return sum + assetsToUsd(p.position.assets, p.vault.asset.decimals, price);
    }, 0);
  }, [positions, prices]);

  const walletBalanceUsd = balances?.totalBalanceUsd
    ? parseFloat(balances.totalBalanceUsd)
    : 0;

  return {
    baseVaults,
    allVaults: vaults,
    vaultsLoading,

    walletAddress,
    walletBalanceUsd,
    totalSavingsUsd,
    positions,
    hasPositions: positions.length > 0,
    userLoading: positionsLoading || balancesLoading,

    prices,

    refetchPositions,
    refetchBalances,
  };
}
