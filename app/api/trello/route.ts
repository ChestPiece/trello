import { NextRequest, NextResponse } from "next/server";
import { trelloService } from "@/lib/trello-service";
import { TrelloOperation } from "@/lib/types/trello";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, params = {} } = body;

    // Validate request
    if (!operation) {
      return NextResponse.json(
        {
          success: false,
          error: "Operation is required",
          message: "Please specify a Trello operation to execute",
        },
        { status: 400 }
      );
    }

    // Validate operation
    const validOperations: TrelloOperation[] = [
      "listBoards",
      "getBoard",
      "createBoard",
      "updateBoard",
      "deleteBoard",
      "listLists",
      "getList",
      "createList",
      "updateList",
      "deleteList",
      "archiveList",
      "unarchiveList",
      "listCards",
      "getCard",
      "createCard",
      "updateCard",
      "deleteCard",
      "listLabels",
      "getLabel",
      "createLabel",
      "updateLabel",
      "deleteLabel",
      "addLabelToCard",
      "removeLabelFromCard",
      "listAttachments",
      "getAttachment",
      "createAttachment",
      "deleteAttachment",
      "listChecklists",
      "getChecklist",
      "createChecklist",
      "updateChecklist",
      "deleteChecklist",
      "createChecklistItem",
      "updateChecklistItem",
      "deleteChecklistItem",
      "listMembers",
      "getMember",
      "addMemberToBoard",
      "removeMemberFromBoard",
      "listWorkspaces",
      "getWorkspace",
      "createWorkspace",
      "updateWorkspace",
      "deleteWorkspace",
    ];

    if (!validOperations.includes(operation)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid operation: ${operation}`,
          message: `Supported operations: ${validOperations.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Check if Trello service is configured
    if (!trelloService.isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "Trello API credentials not configured",
          message:
            "Please configure TRELLO_API_KEY and TRELLO_API_TOKEN environment variables",
        },
        { status: 500 }
      );
    }

    // Execute the operation
    const result = await trelloService.executeToolOperation(operation, params);

    // Return appropriate HTTP status based on result
    const status = result.success ? 200 : 500;
    return NextResponse.json(result, { status });
  } catch (error) {
    console.error("API Route Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred while processing the request",
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for simple operations (backward compatibility)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get("operation") as TrelloOperation;

    if (!operation) {
      return NextResponse.json(
        {
          success: false,
          error: "Operation parameter is required",
          message: "Please specify a Trello operation as a query parameter",
        },
        { status: 400 }
      );
    }

    // Convert search params to params object
    const params: Record<string, any> = {};
    for (const [key, value] of searchParams.entries()) {
      if (key !== "operation") {
        // Handle array parameters (comma-separated)
        if (value.includes(",")) {
          params[key] = value.split(",");
        } else {
          params[key] = value;
        }
      }
    }

    // Execute the operation
    const result = await trelloService.executeToolOperation(operation, params);

    // Return appropriate HTTP status based on result
    const status = result.success ? 200 : 500;
    return NextResponse.json(result, { status });
  } catch (error) {
    console.error("API Route Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred while processing the request",
      },
      { status: 500 }
    );
  }
}
