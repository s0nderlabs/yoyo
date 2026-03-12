# yo-savings

**Core idea: Onchain savings made easy.**
AI is a feature that enables simplicity, not the product itself. YO Savings Hackathon submission.

## Hackathon

- **Prize:** $3K USDC + 25K $YO tokens ($1.5K+15K / $1K+10K / $500+5K)
- **Deadline:** Mar 20, 2026 02:00 UTC
- **Competition:** 0 BUIDLs / 77 hackers
- **Link:** https://dorahacks.io/hackathon/yo/detail
- **Theme:** "Build the smartest savings account in DeFi using YO"

## Required Tech

- `@yo-protocol/core` or `@yo-protocol/react`
- Real mainnet transactions — **no mocks, no testnet** (entries using mock tx will be disqualified)
- Interact with live YO vaults on Base, Ethereum, or Arbitrum

## YO Protocol

- Multi-chain yield optimizer — deposit assets, auto-allocates to best risk-adjusted yields
- 5 vaults: yoUSD, yoETH, yoBTC, yoEUR, yoGOLD (ERC-4626)
- Zero management/performance fees
- TVL: ~$91M (Base $76.7M, ETH $14.1M, Arbitrum $338K)
- Integration: yoGateway (preferred — single contract for all vaults) or individual contracts

## Judging

| Criteria | Weight |
|----------|--------|
| UX Simplicity | 30% |
| Creativity & Growth Potential | 30% |
| Quality of Integration | 20% |
| Risk & Trust | 20% |

## Important Rules

- **Minimum 10 qualified submissions required for prizes to be awarded**
- All judging decisions are final

## Submission Requirements

- GitHub repository
- 3-minute demo video
- Clear explanation of how YO SDK was used

## Docs

- Main: https://docs.yo.xyz
- yoGateway guide: https://docs.yo.xyz/integrations/technical-guides/yogateway-integration-guide
- Contract guide: https://docs.yo.xyz/integrations/technical-guides/individual-contract-integration-guide
- API: https://docs.yo.xyz/api

## Conventions

- NEVER use testnet — all transactions on mainnet
- Private keys via macOS Keychain (`security find-generic-password`), never in .env or files
- Base chain is best target (highest TVL $76.7M)

## Project Structure

```
src/
├── app/
│   ├── globals.css        # Tailwind v4 theme + design system
│   ├── layout.tsx         # Root layout (fonts, metadata, providers)
│   ├── page.tsx           # Landing page
│   ├── sw.ts              # Service worker (PWA)
│   ├── ~offline/page.tsx  # Offline fallback
│   ├── api/
│   │   └── chat/route.ts  # AI chat endpoint (DeepSeek + Vercel AI SDK)
│   └── app/               # Authenticated area
│       ├── layout.tsx     # Auth guard + app chrome (chat bar, ChatProvider)
│       └── page.tsx       # Dashboard (swipeable overview + details screens)
├── components/
│   ├── chat/              # AI chat UI
│   │   ├── chat-sheet.tsx          # Bottom sheet with useChat
│   │   ├── message-bubble.tsx      # User/assistant message rendering
│   │   ├── thinking-indicator.tsx  # Reasoning/loading animation
│   │   ├── tool-approval-card.tsx  # Confirm/reject card for deposit/withdraw
│   │   └── tool-result-card.tsx    # Rendered results for read-only tools
│   ├── dashboard/         # Dashboard screens + sheets
│   │   ├── overview-screen.tsx     # Total savings, greeting, chip buttons
│   │   ├── details-screen.tsx      # Vault list + positions
│   │   ├── vault-card.tsx          # Individual vault display
│   │   ├── position-card.tsx       # User position display
│   │   ├── deposit-sheet.tsx       # Deposit bottom sheet (useDeposit)
│   │   ├── withdraw-sheet.tsx      # Withdraw bottom sheet (useRedeem)
│   │   ├── settings-sidebar.tsx    # Settings slide-out panel
│   │   └── skeleton.tsx            # Loading skeletons
│   └── landing/           # Landing page sections
├── contexts/
│   └── chat-context.tsx   # Bridge between chat and dashboard state
├── hooks/
│   ├── use-dashboard-data.ts  # Aggregates vaults, positions, balances, prices
│   └── use-handle-login.ts    # Privy login handler
├── lib/
│   ├── ai/
│   │   ├── system-prompt.ts   # AI persona + context builder
│   │   └── tools.ts           # Tool definitions (server + client-side)
│   ├── db/
│   │   ├── index.ts           # Drizzle client (Vercel Postgres)
│   │   └── schema.ts          # Chat/message tables
│   ├── constants.ts       # Vault names, chain config
│   ├── format.ts          # formatUsd, formatApy helpers
│   ├── privy.ts           # Privy app config
│   └── wagmi.ts           # wagmi chain + transport config
└── providers/
    └── index.tsx          # Provider stack (Privy → Query → wagmi → YO)
```

## AI Chat Architecture

- **Model:** DeepSeek V3.2 Reasoner (`deepseek-reasoner`) via Vercel AI SDK
- **Auth:** `@privy-io/server-auth` verifies `privy-token` cookie in API route
- **Read-only tools** (server `execute`): `get_vault_rates`, `get_user_positions`, `get_wallet_balance`
- **Action tools** (client-side, no `execute`): `deposit`, `withdraw` — render confirm/reject card, execute via `useDeposit`/`useRedeem` hooks
- **Context bridge:** `ChatContext` connects chat sheet to dashboard data (vaults, positions, balances, refetch callbacks)
- **Transport:** `DefaultChatTransport` with live body getters for fresh wallet/balance data per request
- **System prompt injection defense:** userName sanitized with `replace(/[^\p{L}\p{N}\s'-]/gu, "").slice(0, 50)`

## Provider Nesting (CRITICAL)

```
PrivyProvider → QueryClientProvider → WagmiProvider → YieldProvider
```

- `createConfig` from `@privy-io/wagmi` (NOT from `wagmi`)
- `WagmiProvider` from `@privy-io/wagmi` (NOT from `wagmi`)
- `YieldProvider` from `@yo-protocol/react`

## Design System

- Tailwind v4 — all tokens in `globals.css` @theme block
- Colors: cream, cream-dark, ink, ink-light, sage, sage-light, fail, border
- Fonts: `font-display` (Instrument Serif), `font-body` (Source Serif 4), `font-mono` (JetBrains Mono)
- `label-mono` utility: 11px mono uppercase, ink-light, 0.1em tracking
- Rounded corners, noise grain overlay, editorial/newspaper aesthetic
- No DeFi jargon in UI
