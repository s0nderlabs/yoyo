import { verifyAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chats, messages } from "@/lib/db/schema";

export async function POST(req: Request) {
  let userId: string;
  try {
    const auth = await verifyAuth();
    userId = auth.userId;
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { chatId?: string; messages?: { id: string; role: string; parts: unknown }[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { chatId, messages: msgs } = body;

  if (!msgs?.length) {
    return Response.json({ error: "No messages" }, { status: 400 });
  }

  try {
    let activeChatId = chatId;

    // Create chat if needed
    if (!activeChatId) {
      const firstUserMsg = msgs.find((m) => m.role === "user");
      const title = firstUserMsg
        ? String(
            (firstUserMsg.parts as { type: string; text: string }[])?.find(
              (p) => p.type === "text",
            )?.text ?? "",
          ).slice(0, 50) || "Chat"
        : "Chat";

      const [newChat] = await db
        .insert(chats)
        .values({ userId, title })
        .returning({ id: chats.id });
      activeChatId = newChat.id;
    }

    // Batch insert, skip duplicates by id
    await db
      .insert(messages)
      .values(
        msgs.map((msg) => ({
          id: msg.id,
          chatId: activeChatId!,
          role: msg.role,
          parts: msg.parts,
        })),
      )
      .onConflictDoNothing();

    return Response.json({ chatId: activeChatId });
  } catch {
    return Response.json({ error: "Database error" }, { status: 500 });
  }
}
