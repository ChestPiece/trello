import { NextRequest, NextResponse } from "next/server";
import { listAttachmentsTool } from "@/TrelloTools/AttachmentTools/list-attachments";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");
    const filter = searchParams.get("filter") || "all";
    const limit = searchParams.get("limit");

    if (!cardId) {
      return NextResponse.json(
        { error: "cardId parameter is required" },
        { status: 400 }
      );
    }

    const result = await listAttachmentsTool.execute(
      {
        cardId,
        filter: filter as "cover" | "gallery" | "all",
        fields: [
          "id",
          "name",
          "url",
          "mimeType",
          "bytes",
          "date",
          "idMember",
          "isUpload",
          "pos",
          "edgeColor",
          "fileName",
          "idCard",
        ],
        ...(limit && { limit: parseInt(limit) }),
      },
      {
        toolCallId: "list-attachments-" + Date.now(),
        messages: [],
      }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch attachments" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      attachments: result.attachments,
      count: result.count,
    });
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

