import { NextRequest, NextResponse } from "next/server";
import { listCardsTool } from "@/TrelloTools/CardTools/list-cards";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get("boardId");
    const listId = searchParams.get("listId");
    const filter = searchParams.get("filter") || "all";

    if (!boardId && !listId) {
      return NextResponse.json(
        { error: "Either boardId or listId parameter is required" },
        { status: 400 }
      );
    }

    const result = await listCardsTool.execute(
      {
        boardId: boardId || undefined,
        listId: listId || undefined,
        filter: filter as "all" | "closed" | "none" | "open" | "visible",
        fields: [
          "id",
          "name",
          "desc",
          "closed",
          "idList",
          "idBoard",
          "pos",
          "due",
          "dueComplete",
          "idMembers",
          "idLabels",
          "url",
          "shortUrl",
          "idShort",
          "dateLastActivity",
          "idAttachmentCover",
          "manualCoverAttachment",
          "idChecklists",
          "idMembersVoted",
        ],
        attachments: true,
        members: true,
        checklists: "all",
      },
      {
        toolCallId: "list-cards-" + Date.now(),
        messages: [],
      }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch cards" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      cards: result.cards,
      count: result.count,
    });
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
