import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fields = searchParams.get("fields")?.split(",") || [
      "id",
      "name",
      "displayName",
      "desc",
      "url",
      "website",
      "logo",
      "prefs",
    ];

    // This is a simple REST endpoint that returns workspace information
    // The actual tool execution happens in the chat context
    return NextResponse.json({
      success: true,
      message:
        "Use the chat interface to interact with Trello workspaces. The AI assistant can help you create, update, delete, and manage workspaces.",
      availableOperations: [
        "createWorkspace - Create a new workspace",
        "getWorkspace - Get workspace details",
        "updateWorkspace - Update workspace information",
        "deleteWorkspace - Delete a workspace",
        "listWorkspaces - List all workspaces",
      ],
      parameters: {
        fields: fields,
      },
    });
  } catch (error) {
    console.error("Error in workspaces API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
