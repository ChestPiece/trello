import { NextRequest, NextResponse } from "next/server";
import { listListsTool } from "@/TrelloTools/ListTools/list-lists";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get("boardId");
    const filter = searchParams.get("filter") || "all";

    if (!boardId) {
      return NextResponse.json(
        { error: "boardId is required" },
        { status: 400 }
      );
    }

    const result = await listListsTool.execute(
      {
        boardId,
        filter: filter as "all" | "closed" | "none" | "open" | "visible",
        fields: ["id", "name", "closed", "idBoard", "pos", "subscribed"],
        cards: "none", // Don't include cards for performance
      },
      {
        toolCallId: "list-lists-" + Date.now(),
        messages: [],
      }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch lists" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      lists: result.lists,
      count: result.count,
    });
  } catch (error) {
    console.error("Error fetching lists:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
