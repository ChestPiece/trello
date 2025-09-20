import { NextRequest, NextResponse } from "next/server";
import { listWorkspacesTool } from "@/TrelloTools/WorkspaceTools/list-workspaces";

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

    const result = await listWorkspacesTool.execute(
      {
        fields,
      },
      {
        toolCallId: "list-workspaces-" + Date.now(),
        messages: [],
      }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch workspaces" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      workspaces: result.workspaces,
      count: result.count,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in /api/workspaces:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
