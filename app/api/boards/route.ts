import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";

    // This is a simple REST endpoint that returns board information
    // The actual tool execution happens in the chat context
    return NextResponse.json({
      success: true,
      message:
        "Use the chat interface to interact with Trello boards. The AI assistant can help you create, update, delete, and list boards.",
      availableOperations: [
        "createBoard - Create a new board",
        "getBoard - Get board details",
        "updateBoard - Update board settings",
        "deleteBoard - Delete a board",
        "listBoards - List all boards",
      ],
      filter: filter,
    });
  } catch (error) {
    console.error("Error in boards API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
