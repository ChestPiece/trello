import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");
    const filter = searchParams.get("filter") || "all";
    const limit = searchParams.get("limit");

    // This is a simple REST endpoint that returns attachment information
    // The actual tool execution happens in the chat context
    return NextResponse.json({
      success: true,
      message:
        "Use the chat interface to interact with Trello attachments. The AI assistant can help you create, delete, and list attachments.",
      availableOperations: [
        "createAttachment - Create a new attachment",
        "getAttachment - Get attachment details",
        "deleteAttachment - Delete an attachment",
        "listAttachments - List all attachments",
      ],
      parameters: {
        cardId: cardId || "not provided",
        filter: filter,
        limit: limit || "not provided",
      },
    });
  } catch (error) {
    console.error("Error in attachments API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
