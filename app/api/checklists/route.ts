import { NextRequest, NextResponse } from "next/server";
import { listChecklistsTool } from "@/TrelloTools/ChecklistTools/list-checklists";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");
    const fields = searchParams.get("fields")?.split(",") || [
      "id",
      "name",
      "idCard",
      "pos",
    ];
    const checkItems = searchParams.get("checkItems") || "all";
    const checkItemFields = searchParams.get("checkItemFields")?.split(",") || [
      "id",
      "name",
      "state",
      "pos",
      "due",
      "idMember",
    ];

    if (!cardId) {
      return NextResponse.json(
        { error: "cardId parameter is required" },
        { status: 400 }
      );
    }

    const result = await listChecklistsTool.execute(
      {
        cardId,
        fields,
        checkItems: checkItems as "all" | "none",
        checkItemFields,
      },
      {
        toolCallId: "list-checklists-" + Date.now(),
        messages: [],
      }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch checklists" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checklists: result.checklists,
      count: result.count,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in /api/checklists:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
