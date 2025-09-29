import { NextRequest, NextResponse } from "next/server";

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

    // This is a simple REST endpoint that returns label information
    // The actual tool execution happens in the chat context
    return NextResponse.json({
      success: true,
      message:
        "Use the chat interface to interact with Trello labels. The AI assistant can help you create, update, delete, and manage labels.",
      availableOperations: [
        "createLabel - Create a new label",
        "getLabel - Get label details",
        "updateLabel - Update label information",
        "deleteLabel - Delete a label",
        "listLabels - List all labels",
        "addLabelToCard - Add label to a card",
        "removeLabelFromCard - Remove label from a card",
      ],
      parameters: {
        boardId: boardId || "not provided",
        fields: fields,
      },
    });
  } catch (error) {
    console.error("Error in labels API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
