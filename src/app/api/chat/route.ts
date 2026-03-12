import { PrivyClient } from "@privy-io/server-auth";
import { deepseek } from "@ai-sdk/deepseek";
import { convertToModelMessages, streamText, stepCountIs, type UIMessage } from "ai";
import { createTools } from "@/lib/ai/tools";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { cookies } from "next/headers";

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!,
);

export async function POST(req: Request) {
  // Verify Privy auth token — check cookie names used by Privy SDK
  const cookieStore = await cookies();
  const token =
    cookieStore.get("privy-token")?.value ||
    cookieStore.get("privy-id-token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await privy.verifyAuthToken(token);
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const {
    messages,
    walletAddress,
    walletBalanceUsd,
    totalSavingsUsd,
    userName,
    hasPositions,
  } = body as {
    messages: UIMessage[];
    walletAddress?: string;
    walletBalanceUsd?: number;
    totalSavingsUsd?: number;
    userName?: string;
    hasPositions?: boolean;
  };

  const tools = createTools(walletAddress);

  const result = streamText({
    model: deepseek("deepseek-reasoner"),
    system: buildSystemPrompt({
      userName,
      walletAddress,
      walletBalanceUsd,
      totalSavingsUsd,
      hasPositions,
    }),
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse({ sendReasoning: true });
}
