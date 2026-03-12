const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatUsd(value: string | number | undefined): string {
  if (value === undefined || value === null || value === "") return "$0";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num) || num === 0) return "$0";
  if (num > 0 && num < 0.01) return "< $0.01";
  return usdFormatter.format(num);
}

export function formatApy(yieldStr: string | null | undefined): string {
  if (!yieldStr) return "--";
  const num = parseFloat(yieldStr);
  if (isNaN(num)) return "--";
  return `${num.toFixed(1)}%`;
}

export function formatCompact(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num) || num === 0) return "$0";
  return compactFormatter.format(num);
}

export function formatShares(shares: bigint, decimals: number): string {
  const divisor = 10 ** decimals;
  const num = Number(shares) / divisor;
  if (num === 0) return "0";
  if (num < 0.0001) return "< 0.0001";
  return num.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

export function assetsToUsd(
  assets: bigint,
  decimals: number,
  price: number | undefined,
): number {
  if (!price) return 0;
  return (Number(assets) / 10 ** decimals) * price;
}
