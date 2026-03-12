"use client";

import { useState } from "react";
import { parseUnits } from "viem";
import type { Address } from "viem";
import { useDeposit, useRedeem } from "@yo-protocol/react";
import type { DashboardData } from "@/hooks/use-dashboard-data";
import { usePrivy } from "@privy-io/react-auth";
import { VAULT_FRIENDLY_NAMES } from "@/lib/constants";
import { formatApy } from "@/lib/format";

type AddToolResultFn = (params: {
  tool: string;
  toolCallId: string;
  output: unknown;
}) => void;

interface ToolApprovalCardProps {
  toolName: "deposit" | "withdraw";
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
  const { vaultId, amount, tokenSymbol } = args;
  const friendlyName = VAULT_FRIENDLY_NAMES[vaultId] || vaultId;
  const vault = dashboardData?.baseVaults.find((v) => v.id === vaultId);
  const apy = vault?.yield?.["7d"] ? formatApy(vault.yield["7d"]) : "";

  // If tool already has a result, show the outcome
  if (state === "output-available" || result) {
    let parsed: Record<string, unknown> = {};
    try {
      parsed = typeof result === "string" ? JSON.parse(result) : (result as Record<string, unknown>);
    } catch {
      parsed = { success: false, error: "Invalid result" };
    }
    const success = parsed?.success;
    return (
      <div
        className={`my-2 rounded-xl border px-4 py-3 ${
          success
            ? "border-sage/20 bg-sage/5"
            : "border-fail/20 bg-fail/5"
        }`}
      >
        <p className="font-mono text-xs text-ink-light">
          {success
            ? `${toolName === "deposit" ? "Saved" : "Withdrawn"} ${amount} ${tokenSymbol}`
            : String(parsed?.error || "Cancelled")}
        </p>
      </div>
    );
  }

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
  const { user } = usePrivy();
  const [executing, setExecuting] = useState(false);

  const vaultAddress = vault?.contracts?.vaultAddress as Address | undefined;

  const sendResult = (output: unknown) =>
    addToolResult({ tool: toolName, toolCallId, output });

  const { deposit, step: depositStep } = useDeposit({
    vault: vaultAddress!,
    onConfirmed: (hash) => {
      sendResult({ success: true, txHash: hash });
      dashboardData?.refetchPositions();
      dashboardData?.refetchBalances();
      setExecuting(false);
    },
    onError: (err) => {
      sendResult({ success: false, error: err?.message || "Transaction failed" });
      setExecuting(false);
    },
  });

  const { redeem, step: redeemStep } = useRedeem({
    vault: vaultAddress!,
    onConfirmed: (hash) => {
      sendResult({ success: true, txHash: hash });
      dashboardData?.refetchPositions();
      dashboardData?.refetchBalances();
      setExecuting(false);
    },
    onError: (err) => {
      sendResult({ success: false, error: err?.message || "Transaction failed" });
      setExecuting(false);
    },
  });

  const handleConfirm = async () => {
    if (!vault || !vaultAddress) {
      sendResult({ success: false, error: "Vault not found" });
      return;
    }

    setExecuting(true);

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
        sendResult({ success: false, error: "No position found in this account" });
        setExecuting(false);
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

  const step = toolName === "deposit" ? depositStep : redeemStep;
  const stepLabel =
    step === "idle"
      ? null
      : step === "approving"
        ? "Approving..."
        : step === "depositing" || step === "redeeming"
          ? "Processing..."
          : step === "waiting"
            ? "Confirming..."
            : null;

  return (
    <div className="my-2 rounded-xl border border-sage/20 bg-cream-dark/30 px-4 py-4">
      <div>
        <p className="font-display text-lg text-ink">
          {toolName === "deposit" ? "Save" : "Withdraw"} {amount}{" "}
          {tokenSymbol}
        </p>
        <p className="mt-0.5 font-mono text-xs text-ink-light">
          {friendlyName}
          {apy && ` · ${apy} interest`}
        </p>
      </div>

      {executing && stepLabel ? (
        <div className="mt-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sage" />
          <span className="font-mono text-xs text-ink-light">{stepLabel}</span>
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
