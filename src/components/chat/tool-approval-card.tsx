"use client";

import { useState, useCallback } from "react";
import { parseUnits, encodeFunctionData, erc20Abi } from "viem";
import type { Address, Hex } from "viem";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { usePrivy } from "@privy-io/react-auth";
import { useYoClient } from "@yo-protocol/react";
import type { DashboardData } from "@/hooks/use-dashboard-data";
import {
  VAULT_FRIENDLY_NAMES,
  BASE_TOKENS,
  BASE_TOKEN_DECIMALS,
  ALLOWANCE_HOLDER,
} from "@/lib/constants";
import { formatApy } from "@/lib/format";
import { logActivity } from "@/lib/activity";
import { useVaultDeposit, useVaultRedeem } from "@/hooks/use-vault-tx";

type AddToolResultFn = (params: {
  tool: string;
  toolCallId: string;
  output: unknown;
}) => void;

interface ToolApprovalCardProps {
  toolName: "deposit" | "withdraw" | "swap_and_deposit" | "swap";
  toolCallId: string;
  args: Record<string, string>;
  state: string;
  result: unknown;
  addToolResult: AddToolResultFn;
  dashboardData: DashboardData | null;
}

export function ToolApprovalCard({
  toolName,
  toolCallId,
  args,
  state,
  result,
  addToolResult,
  dashboardData,
}: ToolApprovalCardProps) {
  // If tool already has a result, show the outcome
  if (state === "output-available" || result) {
    let parsed: Record<string, unknown> = {};
    try {
      parsed =
        typeof result === "string"
          ? JSON.parse(result)
          : (result as Record<string, unknown>);
    } catch {
      parsed = { success: false, error: "Invalid result" };
    }
    const success = parsed?.success;
    const label =
      toolName === "swap_and_deposit"
        ? `Swapped ${args.sellAmount} ${args.sellToken} and saved in ${VAULT_FRIENDLY_NAMES[args.vaultId] || args.vaultId}`
        : toolName === "swap"
          ? `Converted ${args.sellAmount} ${args.sellToken} to ${args.buyToken}`
          : toolName === "deposit"
            ? `Saved ${args.amount} ${args.tokenSymbol}`
            : `Withdrawn ${args.amount} ${args.tokenSymbol}`;
    return (
      <div
        className={`my-2 rounded-xl border px-4 py-3 ${
          success
            ? "border-sage/20 bg-sage/5"
            : "border-fail/20 bg-fail/5"
        }`}
      >
        <p className="font-mono text-xs text-ink-light">
          {success ? label : String(parsed?.error || "Cancelled")}
        </p>
      </div>
    );
  }

  if (toolName === "swap" || toolName === "swap_and_deposit") {
    return (
      <SwapDepositPending
        toolCallId={toolCallId}
        args={args}
        addToolResult={addToolResult}
        dashboardData={dashboardData}
      />
    );
  }

  const { vaultId, amount, tokenSymbol } = args;
  const friendlyName = VAULT_FRIENDLY_NAMES[vaultId] || vaultId;
  const vault = dashboardData?.baseVaults.find((v) => v.id === vaultId);
  const apy = formatApy(vault?.yield?.["7d"]);

  return (
    <PendingApproval
      toolName={toolName}
      toolCallId={toolCallId}
      vaultId={vaultId}
      amount={amount}
      tokenSymbol={tokenSymbol}
      friendlyName={friendlyName}
      apy={apy}
      vault={vault}
      addToolResult={addToolResult}
      dashboardData={dashboardData}
    />
  );
}

/* ── Swap + Deposit Card ──────────────────────────────────── */

function SwapDepositPending({
  toolCallId,
  args,
  addToolResult,
  dashboardData,
}: {
  toolCallId: string;
  args: Record<string, string>;
  addToolResult: AddToolResultFn;
  dashboardData: DashboardData | null;
}) {
  const sellToken = args.sellToken || args.sell_token || "";
  const buyToken = args.buyToken || args.buy_token || "";
  const sellAmount = args.sellAmount || args.sell_amount || "0";
  const expectedBuyAmount = args.expectedBuyAmount || args.expected_buy_amount || "0";
  const vaultId = args.vaultId || args.vault_id || "";
  const friendlyName = VAULT_FRIENDLY_NAMES[vaultId] || vaultId;
  const vault = dashboardData?.baseVaults.find((v) => v.id === vaultId);
  const apy = formatApy(vault?.yield?.["7d"]);

  const { client } = useSmartWallets();
  const { user } = usePrivy();
  const yoClient = useYoClient();
  const walletAddress = (user?.smartWallet?.address ??
    user?.wallet?.address) as Address | undefined;

  const [executing, setExecuting] = useState(false);

  const isSwapOnly = !vaultId;
  const toolKey = isSwapOnly ? "swap" : "swap_and_deposit";

  const sendResult = useCallback(
    (output: unknown) =>
      addToolResult({ tool: toolKey, toolCallId, output }),
    [addToolResult, toolCallId, toolKey],
  );

  const handleConfirm = useCallback(async () => {
    if (!client || !walletAddress) {
      sendResult({ success: false, error: "Wallet not ready" });
      return;
    }
    if (!isSwapOnly && (!yoClient || !vault)) {
      sendResult({ success: false, error: "Vault not ready" });
      return;
    }
    setExecuting(true);
    try {
      const sellSym = (sellToken || "").toUpperCase();
      const buySym = (buyToken || "").toUpperCase();
      const sellAddr = BASE_TOKENS[sellSym] as Address;
      const buyAddr = BASE_TOKENS[buySym] as Address;
      const sellDecimals = BASE_TOKEN_DECIMALS[sellSym];
      const isNativeETH = sellSym === "ETH";
      const sellAmountWei = parseUnits(sellAmount, sellDecimals).toString();

      // 1. Fetch fresh 0x quote via our API route
      const params = new URLSearchParams({
        sellToken: sellAddr,
        buyToken: buyAddr,
        sellAmount: sellAmountWei,
        taker: walletAddress,
      });
      const quoteRes = await fetch(`/api/swap-quote?${params}`);
      const quote = await quoteRes.json();
      if (!quoteRes.ok || quote.code) {
        sendResult({
          success: false,
          error: quote.reason || quote.message || "Swap quote failed",
        });
        setExecuting(false);
        return;
      }

      // 2. Build swap calls: approve (skip for native ETH) + swap
      const swapCalls: { to: Address; data: Hex; value?: bigint }[] = [];
      if (!isNativeETH) {
        swapCalls.push({
          to: sellAddr,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: "approve",
            args: [
              (quote.issues?.allowance?.spender ||
                ALLOWANCE_HOLDER) as Address,
              BigInt(sellAmountWei),
            ],
          }),
        });
      }
      swapCalls.push({
        to: quote.transaction.to as Address,
        data: quote.transaction.data as Hex,
        value: quote.transaction.value
          ? BigInt(quote.transaction.value)
          : undefined,
      });

      if (isSwapOnly) {
        // 3a. Standalone swap — just execute the swap
        const txHash = await client.sendTransaction({
          calls: swapCalls,
        });
        sendResult({ success: true, txHash });
        logActivity({ type: "swap", amount: sellAmount, tokenSymbol: sellSym, txHash });
      } else {
        // 3b. Swap + deposit — add deposit calls via yoGateway SDK
        const vaultAddress = vault!.contracts.vaultAddress as Address;
        const depositAmount = BigInt(quote.minBuyAmount);
        const depositTxs = await yoClient!.prepareDepositWithApproval({
          vault: vaultAddress,
          token: buyAddr,
          owner: walletAddress,
          recipient: walletAddress,
          amount: depositAmount,
          slippageBps: 50,
        });

        const depositCalls = depositTxs.map((tx) => ({
          to: tx.to as Address,
          data: tx.data as Hex,
          value: tx.value ? BigInt(tx.value) : undefined,
        }));

        const txHash = await client.sendTransaction({
          calls: [...swapCalls, ...depositCalls],
        });
        sendResult({ success: true, txHash });
        logActivity({ type: "swap_and_deposit", amount: sellAmount, tokenSymbol: sellSym, vaultId, txHash });
      }

      dashboardData?.refetchPositions();
      dashboardData?.refetchBalances();
    } catch (err: any) {
      sendResult({
        success: false,
        error: err?.message || "Transaction failed",
      });
    } finally {
      setExecuting(false);
    }
  }, [
    client,
    walletAddress,
    yoClient,
    vault,
    sellToken,
    buyToken,
    sellAmount,
    sendResult,
    dashboardData,
  ]);

  const handleCancel = useCallback(() => {
    sendResult({ success: false, error: "User cancelled" });
  }, [sendResult]);

  return (
    <div className="my-2 rounded-xl border border-sage/20 bg-cream-dark/30 px-4 py-4">
      <div>
        <p className="font-display text-lg text-ink">
          Swap {sellAmount} {sellToken?.toUpperCase() || "?"} &rarr;{" "}
          {Number(expectedBuyAmount || 0).toLocaleString("en-US", {
            maximumFractionDigits: 6,
          })}{" "}
          {buyToken?.toUpperCase() || "?"}
        </p>
        {!isSwapOnly && (
          <p className="mt-0.5 font-mono text-xs text-ink-light">
            then save in {friendlyName}
            {apy !== "--" && ` · ${apy} interest`}
          </p>
        )}
      </div>

      {executing ? (
        <div className="mt-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sage" />
          <span className="font-mono text-xs text-ink-light">
            {isSwapOnly ? "Converting..." : "Swapping & saving..."}
          </span>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleCancel}
            className="flex-1 rounded-lg border border-border px-4 py-2 font-mono text-xs tracking-wide text-ink-light transition-colors duration-200 hover:bg-ink/[0.04]"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 rounded-lg bg-sage px-4 py-2 font-mono text-xs tracking-wide text-cream transition-colors duration-200 hover:bg-sage-light"
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Deposit / Withdraw Card ──────────────────────────────── */

function PendingApproval({
  toolName,
  toolCallId,
  vaultId,
  amount,
  tokenSymbol,
  friendlyName,
  apy,
  vault,
  addToolResult,
  dashboardData,
}: {
  toolName: "deposit" | "withdraw";
  toolCallId: string;
  vaultId: string;
  amount: string;
  tokenSymbol: string;
  friendlyName: string;
  apy: string;
  vault: any;
  addToolResult: AddToolResultFn;
  dashboardData: DashboardData | null;
}) {
  const vaultAddress = vault?.contracts?.vaultAddress as Address | undefined;

  const sendResult = (output: unknown) =>
    addToolResult({ tool: toolName, toolCallId, output });

  const { deposit, isLoading: depositLoading } = useVaultDeposit({
    vault: vaultAddress!,
    onConfirmed: (hash) => {
      sendResult({ success: true, txHash: hash });
      logActivity({ type: "deposit", amount, tokenSymbol, vaultId, txHash: hash });
      dashboardData?.refetchPositions();
      dashboardData?.refetchBalances();
    },
    onError: (err) => {
      sendResult({
        success: false,
        error: err?.message || "Transaction failed",
      });
    },
  });

  const { redeem, isLoading: redeemLoading } = useVaultRedeem({
    vault: vaultAddress!,
    onConfirmed: (hash) => {
      sendResult({ success: true, txHash: hash });
      logActivity({ type: "withdraw", amount, tokenSymbol, vaultId, txHash: hash });
      dashboardData?.refetchPositions();
      dashboardData?.refetchBalances();
    },
    onError: (err) => {
      sendResult({
        success: false,
        error: err?.message || "Transaction failed",
      });
    },
  });

  const executing = depositLoading || redeemLoading;

  const handleConfirm = async () => {
    if (!vault || !vaultAddress) {
      sendResult({ success: false, error: "Vault not found" });
      return;
    }

    if (toolName === "deposit") {
      const tokenAddress = vault.asset.address as Address;
      const decimals = vault.asset.decimals;
      const parsedAmount = parseUnits(amount, decimals);
      await deposit({
        token: tokenAddress,
        amount: parsedAmount,
        chainId: vault.chain.id,
      });
    } else {
      const position = dashboardData?.positions.find(
        (p) => p.vault.id === vaultId,
      );
      if (!position) {
        sendResult({
          success: false,
          error: "No position found in this account",
        });
        return;
      }
      const totalAssets =
        Number(position.position.assets) / 10 ** vault.asset.decimals;
      const ratio = Math.min(Number(amount) / totalAssets, 1);
      const sharesToRedeem =
        (position.position.shares * BigInt(Math.round(ratio * 10000))) /
        10000n;
      await redeem(sharesToRedeem);
    }
  };

  const handleCancel = () => {
    sendResult({ success: false, error: "User cancelled" });
  };

  const stepLabel = executing ? "Processing..." : null;

  return (
    <div className="my-2 rounded-xl border border-sage/20 bg-cream-dark/30 px-4 py-4">
      <div>
        <p className="font-display text-lg text-ink">
          {toolName === "deposit" ? "Save" : "Withdraw"} {amount}{" "}
          {tokenSymbol}
        </p>
        <p className="mt-0.5 font-mono text-xs text-ink-light">
          {friendlyName}
          {apy !== "--" && ` · ${apy} interest`}
        </p>
      </div>

      {executing && stepLabel ? (
        <div className="mt-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sage" />
          <span className="font-mono text-xs text-ink-light">
            {stepLabel}
          </span>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleCancel}
            disabled={executing}
            className="flex-1 rounded-lg border border-border px-4 py-2 font-mono text-xs tracking-wide text-ink-light transition-colors duration-200 hover:bg-ink/[0.04] disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={executing}
            className="flex-1 rounded-lg bg-sage px-4 py-2 font-mono text-xs tracking-wide text-cream transition-colors duration-200 hover:bg-sage-light disabled:opacity-40"
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}
