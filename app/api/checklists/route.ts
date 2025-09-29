import { NextRequest, NextResponse } from "next/server";

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

    // This is a simple REST endpoint that returns checklist information
    // The actual tool execution happens in the chat context
    return NextResponse.json({
      success: true,
      message:
        "Use the chat interface to interact with Trello checklists. The AI assistant can help you create, update, delete, and manage checklists.",
      availableOperations: [
        "createChecklist - Create a new checklist",
        "getChecklist - Get checklist details",
        "updateChecklist - Update checklist information",
        "deleteChecklist - Delete a checklist",
        "listChecklists - List all checklists",
        "createChecklistItem - Create a new checklist item",
        "updateChecklistItem - Update checklist item",
        "deleteChecklistItem - Delete a checklist item",
      ],
      parameters: {
        cardId: cardId || "not provided",
        fields: fields,
        checkItems: checkItems,
        checkItemFields: checkItemFields,
      },
    });
  } catch (error) {
    console.error("Error in checklists API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
