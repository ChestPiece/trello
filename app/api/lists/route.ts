import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get("boardId");
    const filter = searchParams.get("filter") || "all";

    // This is a simple REST endpoint that returns list information
    // The actual tool execution happens in the chat context
    return NextResponse.json({
      success: true,
      message:
        "Use the chat interface to interact with Trello lists. The AI assistant can help you create, update, delete, and list lists.",
      availableOperations: [
        "createList - Create a new list",
        "getList - Get list details",
        "updateList - Update list information",
        "deleteList - Delete a list",
        "listLists - List all lists",
        "archiveList - Archive a list",
        "unarchiveList - Unarchive a list",
      ],
      parameters: {
        boardId: boardId || "not provided",
        filter: filter,
      },
    });
  } catch (error) {
    console.error("Error in lists API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
