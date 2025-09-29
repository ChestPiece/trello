import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get("boardId");
    const listId = searchParams.get("listId");
    const filter = searchParams.get("filter") || "all";

    // This is a simple REST endpoint that returns card information
    // The actual tool execution happens in the chat context
    return NextResponse.json({
      success: true,
      message:
        "Use the chat interface to interact with Trello cards. The AI assistant can help you create, update, delete, and list cards.",
      availableOperations: [
        "createCard - Create a new card",
        "getCard - Get card details",
        "updateCard - Update card information",
        "deleteCard - Delete a card",
        "listCards - List all cards",
      ],
      parameters: {
        boardId: boardId || "not provided",
        listId: listId || "not provided",
        filter: filter,
      },
    });
  } catch (error) {
    console.error("Error in cards API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
