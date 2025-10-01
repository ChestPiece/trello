import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

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

    if (!cardId) {
      return NextResponse.json(
        {
          success: false,
          error: "cardId parameter is required",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.TRELLO_API_KEY;
    const apiToken = process.env.TRELLO_API_TOKEN;

    if (!apiKey || !apiToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables.",
        },
        { status: 500 }
      );
    }

    const baseUrl = `https://api.trello.com/1/cards/${cardId}/checklists`;
    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
      fields: fields.join(","),
      checkItems: checkItems,
      checkItem_fields: checkItemFields.join(","),
    });

    const response = await axios.get(`${baseUrl}?${params.toString()}`);

    return NextResponse.json({
      success: true,
      checklists: response.data,
      cardId: cardId,
      checkItems: checkItems,
    });
  } catch (error) {
    console.error("Error in checklists API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch checklists",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardId, name, pos, idChecklistSource, checkItems } = body;

    if (!cardId || !name) {
      return NextResponse.json(
        {
          success: false,
          error: "cardId and name are required",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.TRELLO_API_KEY;
    const apiToken = process.env.TRELLO_API_TOKEN;

    if (!apiKey || !apiToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables.",
        },
        { status: 500 }
      );
    }

    const baseUrl = "https://api.trello.com/1/checklists";
    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
      name,
      idCard: cardId,
    });

    if (pos) {
      params.append("pos", pos.toString());
    }

    if (idChecklistSource) {
      params.append("idChecklistSource", idChecklistSource);
    }

    const response = await axios.post(`${baseUrl}?${params.toString()}`);

    // If checkItems are provided, create them
    if (checkItems && Array.isArray(checkItems)) {
      for (const item of checkItems) {
        try {
          await axios.post(
            `https://api.trello.com/1/checklists/${response.data.id}/checkItems`,
            new URLSearchParams({
              key: apiKey,
              token: apiToken,
              name: item.name,
              pos: item.pos?.toString() || "bottom",
              checked: item.checked?.toString() || "false",
            })
          );
        } catch (itemError) {
          console.error("Error creating checklist item:", itemError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      checklist: {
        id: response.data.id,
        name: response.data.name,
        idCard: response.data.idCard,
        pos: response.data.pos,
        checkItems: response.data.checkItems || [],
      },
      message: `Successfully created checklist "${name}" with ID: ${response.data.id}`,
    });
  } catch (error) {
    console.error("Error creating checklist:", error);

    let errorMessage = "Failed to create checklist";
    let statusCode = 500;

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { data?: { message?: string }; status?: number };
      };
      errorMessage = axiosError.response?.data?.message || errorMessage;
      statusCode = axiosError.response?.status || statusCode;
    } else if (error && typeof error === "object" && "message" in error) {
      errorMessage = (error as { message: string }).message;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        statusCode,
        message: `Failed to create checklist. ${errorMessage}`,
      },
      { status: statusCode }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checklistId = searchParams.get("checklistId");
    const body = await request.json();
    const { name, pos } = body;

    if (!checklistId) {
      return NextResponse.json(
        {
          success: false,
          error: "checklistId parameter is required",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.TRELLO_API_KEY;
    const apiToken = process.env.TRELLO_API_TOKEN;

    if (!apiKey || !apiToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables.",
        },
        { status: 500 }
      );
    }

    const baseUrl = `https://api.trello.com/1/checklists/${checklistId}`;
    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
    });

    if (name) {
      params.append("name", name);
    }

    if (pos !== undefined) {
      params.append("pos", pos.toString());
    }

    const response = await axios.put(`${baseUrl}?${params.toString()}`);

    return NextResponse.json({
      success: true,
      checklist: {
        id: response.data.id,
        name: response.data.name,
        idCard: response.data.idCard,
        pos: response.data.pos,
        checkItems: response.data.checkItems || [],
      },
      message: `Successfully updated checklist with ID: ${checklistId}`,
    });
  } catch (error) {
    console.error("Error updating checklist:", error);

    let errorMessage = "Failed to update checklist";
    let statusCode = 500;

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { data?: { message?: string }; status?: number };
      };
      errorMessage = axiosError.response?.data?.message || errorMessage;
      statusCode = axiosError.response?.status || statusCode;
    } else if (error && typeof error === "object" && "message" in error) {
      errorMessage = (error as { message: string }).message;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        statusCode,
        message: `Failed to update checklist. ${errorMessage}`,
      },
      { status: statusCode }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checklistId = searchParams.get("checklistId");

    if (!checklistId) {
      return NextResponse.json(
        {
          success: false,
          error: "checklistId parameter is required",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.TRELLO_API_KEY;
    const apiToken = process.env.TRELLO_API_TOKEN;

    if (!apiKey || !apiToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables.",
        },
        { status: 500 }
      );
    }

    const baseUrl = `https://api.trello.com/1/checklists/${checklistId}`;
    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
    });

    await axios.delete(`${baseUrl}?${params.toString()}`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted checklist with ID: ${checklistId}`,
    });
  } catch (error) {
    console.error("Error deleting checklist:", error);

    let errorMessage = "Failed to delete checklist";
    let statusCode = 500;

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { data?: { message?: string }; status?: number };
      };
      errorMessage = axiosError.response?.data?.message || errorMessage;
      statusCode = axiosError.response?.status || statusCode;
    } else if (error && typeof error === "object" && "message" in error) {
      errorMessage = (error as { message: string }).message;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        statusCode,
        message: `Failed to delete checklist. ${errorMessage}`,
      },
      { status: statusCode }
    );
  }
}
