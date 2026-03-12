export const YO_GATEWAY = "0xF1EeE0957267b1A474323Ff9CfF7719E964969FA" as const;
export const YO_REGISTRY = "0x56c3119DC3B1a75763C87D5B0A2C55E489502232" as const;
export const YO_ORACLE = "0x6E879d0CcC85085A709eBf5539224f53d0D396B0" as const;
export const YO_REDEEMER = "0x0439e941841f97dc1334d1a433379c6fcdcc2162" as const;

export const VAULTS = {
  yoUSD: {
    base: "0x0000000f2eB9f69274678c76222B35eEc7588a65" as const,
  },
  yoETH: {
    base: "0x3a43aec53490cb9fa922847385d82fe25d0e9de7" as const,
  },
  yoBTC: {
    base: "0xbCbc8cb4D1e8ED048a6276a5E94A3e952660BcbC" as const,
  },
} as const;

export const DEFAULT_CHAIN_ID = 8453;
export const SUPPORTED_CHAIN_IDS = [8453, 1, 42161] as const;

export const VAULT_DISPLAY_ORDER = ["yoUSD", "yoETH", "yoBTC", "yoEUR"] as const;

export const VAULT_FRIENDLY_NAMES: Record<string, string> = {
  yoUSD: "Dollar Savings",
  yoETH: "Ether Savings",
  yoBTC: "Bitcoin Savings",
  yoEUR: "Euro Savings",
  yoGOLD: "Gold Savings",
  yoUSDT: "Tether Savings",
};
