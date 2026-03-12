import { eq, desc, asc } from "drizzle-orm";
import { verifyAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chats, messages } from "@/lib/db/schema";

export async function GET() {
  let userId: string;
  try {
    const auth = await verifyAuth();
    userId = auth.userId;
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find most recent chat for this user
    const [chat] = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, userId))
      .orderBy(desc(chats.createdAt))
      .limit(1);

    if (!chat) {
      return Response.json({ chatId: null, messages: [] });
    }

    const rows = await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chat.id))
      .orderBy(asc(messages.createdAt));

    const uiMessages = rows.map((r) => ({
      id: r.id,
      role: r.role,
      parts: r.parts as { type: string; text: string }[],
    }));

    return Response.json({ chatId: chat.id, messages: uiMessages });
  } catch {
    // DB query failed — return empty state so the UI still works
    return Response.json({ chatId: null, messages: [] });
  }
}
