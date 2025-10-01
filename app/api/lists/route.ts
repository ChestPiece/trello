import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get("boardId");
    const filter = searchParams.get("filter") || "all";

    if (!boardId) {
      return NextResponse.json(
        {
          success: false,
          error: "boardId parameter is required",
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

    const baseUrl = `https://api.trello.com/1/boards/${boardId}/lists`;
    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
      filter: filter,
      fields: "id,name,desc,closed,idBoard,pos,subscribed,softLimit,status",
    });

    const response = await axios.get(`${baseUrl}?${params.toString()}`);

    return NextResponse.json({
      success: true,
      lists: response.data,
      boardId: boardId,
      filter: filter,
    });
  } catch (error) {
    console.error("Error in lists API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch lists",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, boardId } = body;

    if (!name || !boardId) {
      return NextResponse.json(
        {
          success: false,
          error: "name and boardId are required",
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

    const baseUrl = "https://api.trello.com/1/lists";
    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
      name,
      idBoard: boardId,
    });

    const response = await axios.post(`${baseUrl}?${params.toString()}`);

    return NextResponse.json({
      success: true,
      list: {
        id: response.data.id,
        name: response.data.name,
        desc: response.data.desc,
        closed: response.data.closed,
        idBoard: response.data.idBoard,
        pos: response.data.pos,
        subscribed: response.data.subscribed,
        softLimit: response.data.softLimit,
        status: response.data.status,
      },
      message: `Successfully created list "${name}" with ID: ${response.data.id}`,
    });
  } catch (error) {
    console.error("Error creating list:", error);

    let errorMessage = "Failed to create list";
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
        message: `Failed to create list "${name}". ${errorMessage}`,
      },
      { status: statusCode }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listId = searchParams.get("id") || searchParams.get("listId");
    const body = await request.json();
    const { name, closed, pos, subscribed } = body;

    if (!listId) {
      return NextResponse.json(
        {
          success: false,
          error: "id parameter is required",
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

    const baseUrl = `https://api.trello.com/1/lists/${listId}`;
    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
    });

    if (name) {
      params.append("name", name);
    }

    if (closed !== undefined) {
      params.append("closed", closed.toString());
    }

    if (pos !== undefined) {
      params.append("pos", pos.toString());
    }

    if (subscribed !== undefined) {
      params.append("subscribed", subscribed.toString());
    }

    const response = await axios.put(`${baseUrl}?${params.toString()}`);

    return NextResponse.json({
      success: true,
      list: {
        id: response.data.id,
        name: response.data.name,
        desc: response.data.desc,
        closed: response.data.closed,
        idBoard: response.data.idBoard,
        pos: response.data.pos,
        subscribed: response.data.subscribed,
        softLimit: response.data.softLimit,
        status: response.data.status,
      },
      message: `Successfully updated list "${response.data.name}" with ID: ${listId}`,
    });
  } catch (error) {
    console.error("Error updating list:", error);

    let errorMessage = "Failed to update list";
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
        message: `Failed to update list. ${errorMessage}`,
      },
      { status: statusCode }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listId = searchParams.get("listId");

    if (!listId) {
      return NextResponse.json(
        {
          success: false,
          error: "listId parameter is required",
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

    const baseUrl = `https://api.trello.com/1/lists/${listId}`;
    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
    });

    await axios.delete(`${baseUrl}?${params.toString()}`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted list with ID: ${listId}`,
    });
  } catch (error) {
    console.error("Error deleting list:", error);

    let errorMessage = "Failed to delete list";
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
        message: `Failed to delete list. ${errorMessage}`,
      },
      { status: statusCode }
    );
  }
}
