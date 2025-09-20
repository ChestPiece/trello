import { NextRequest, NextResponse } from "next/server";
import { listLabelsTool } from "@/TrelloTools/LabelTools/list-labels";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get("boardId");
    const fields = searchParams.get("fields")?.split(",") || [
      "id",
      "name",
      "color",
      "idBoard",
    ];

    if (!boardId) {
      return NextResponse.json(
        { error: "boardId parameter is required" },
        { status: 400 }
      );
    }

    const result = await listLabelsTool.execute(
      {
        boardId,
        fields,
      },
      {
        toolCallId: "list-labels-" + Date.now(),
        messages: [],
      }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch labels" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      labels: result.labels,
      count: result.count,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in /api/labels:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
