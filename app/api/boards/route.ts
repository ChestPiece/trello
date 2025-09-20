import { NextRequest, NextResponse } from "next/server";
import { listBoardsTool } from "@/TrelloTools/BoardTools/list-boards";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";

    const result = await listBoardsTool.execute(
      {
        filter: filter as "all" | "closed" | "none" | "open" | "starred",
        fields: [
          "id",
          "name",
          "desc",
          "url",
          "shortUrl",
          "closed",
          "pinned",
          "starred",
          "idOrganization",
        ],
        organization: true,
        lists: "none", // Don't include lists for performance
      },
      {
        toolCallId: "list-boards-" + Date.now(),
        messages: [],
      }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch boards" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      boards: result.boards,
      count: result.count,
    });
  } catch (error) {
    console.error("Error fetching boards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
