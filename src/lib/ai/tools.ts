import { tool } from "ai";
import { z } from "zod";
import { VAULT_FRIENDLY_NAMES, DEFAULT_CHAIN_ID } from "@/lib/constants";
import { formatApy } from "@/lib/format";

const YO_API = "https://api.yo.xyz/api/v1";

export function createTools(walletAddress?: string) {
  return {
    get_vault_rates: tool({
      description:
        "Get current interest rates for all savings accounts on Base chain",
      inputSchema: z.object({}),
      execute: async () => {
        const res = await fetch(`${YO_API}/vault/stats`);
        const json = await res.json();
        const vaults = (json as any).data || [];
        const baseVaults = vaults.filter(
          (v: any) => v.chain?.id === DEFAULT_CHAIN_ID,
        );
        return baseVaults.map((v: any) => ({
          name: VAULT_FRIENDLY_NAMES[v.id] || v.name,
          id: v.id,
          symbol: v.asset?.symbol,
          apy: formatApy(v.yield?.["7d"]),
          tvl: v.tvl?.formatted || v.tvl || "N/A",
        }));
      },
    }),

    get_wallet_balance: tool({
      description:
        "Get the user's wallet balance to see how much they can save",
      inputSchema: z.object({}),
      execute: async () => {
        if (!walletAddress) return { error: "No wallet connected" };
        const res = await fetch(
          `${YO_API}/user/balance/${walletAddress}`,
        );
        const data = await res.json();
        return {
          totalUsd: (data as any).totalBalanceUsd,
          tokens:
            ((data as any).assets || []).map((b: any) => ({
              symbol: b.symbol,
              balance: b.balance,
              usd: b.balanceUsd,
            })),
        };
      },
    }),

    deposit: tool({
      description:
        "Save money into a savings account. The user must confirm before this executes.",
      inputSchema: z.object({
        vaultId: z
          .string()
          .describe("The vault ID (e.g. yoUSD, yoETH, yoBTC)"),
        amount: z
          .string()
          .describe(
            "The amount to save in token units (e.g. '100' for 100 USDC)",
          ),
        tokenSymbol: z
          .string()
          .describe("The token symbol (e.g. USDC, WETH, WBTC)"),
      }),
    }),

    withdraw: tool({
      description:
        "Withdraw money from a savings account. The user must confirm before this executes.",
      inputSchema: z.object({
        vaultId: z
          .string()
          .describe("The vault ID (e.g. yoUSD, yoETH, yoBTC)"),
        amount: z
          .string()
          .describe("The amount to withdraw in token units"),
        tokenSymbol: z
          .string()
          .describe("The token symbol (e.g. USDC, WETH, WBTC)"),
      }),
    }),
  };
}
