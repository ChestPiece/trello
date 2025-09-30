import { NextRequest } from "next/server";
import { loadMessages } from "@/lib/message-persistence";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;

    if (!chatId) {
      return new Response("Chat ID is required", { status: 400 });
    }

    const messages = await loadMessages(chatId);

    return new Response(JSON.stringify({ messages }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to load messages:", error);
    return new Response("Failed to load messages", { status: 500 });
  }
}
