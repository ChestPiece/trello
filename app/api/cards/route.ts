import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get("boardId");
    const listId = searchParams.get("listId");
    const filter = searchParams.get("filter") || "all";

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

    let baseUrl: string;
    if (listId) {
      baseUrl = `https://api.trello.com/1/lists/${listId}/cards`;
    } else if (boardId) {
      baseUrl = `https://api.trello.com/1/boards/${boardId}/cards`;
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Either boardId or listId parameter is required",
        },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
      filter: filter,
      fields:
        "id,name,desc,closed,idList,idBoard,pos,subscribed,dateLastActivity,idLabels,idMembers,idShort,labels,members,shortUrl,url",
    });

    const response = await axios.get(`${baseUrl}?${params.toString()}`);

    return NextResponse.json({
      success: true,
      cards: response.data,
      boardId: boardId,
      listId: listId,
      filter: filter,
    });
  } catch (error) {
    console.error("Error in cards API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch cards",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, desc, idList, due } = body;

    if (!name || !idList) {
      return NextResponse.json(
        {
          success: false,
          error: "name and idList are required",
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

    const baseUrl = "https://api.trello.com/1/cards";
    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
      name,
      idList,
      ...(desc && { desc }),
      ...(due && { due }),
    });

    const response = await axios.post(`${baseUrl}?${params.toString()}`);

    return NextResponse.json({
      success: true,
      card: {
        id: response.data.id,
        name: response.data.name,
        desc: response.data.desc,
        closed: response.data.closed,
        idList: response.data.idList,
        idBoard: response.data.idBoard,
        pos: response.data.pos,
        subscribed: response.data.subscribed,
        dateLastActivity: response.data.dateLastActivity,
        idLabels: response.data.idLabels,
        idMembers: response.data.idMembers,
        idShort: response.data.idShort,
        labels: response.data.labels,
        members: response.data.members,
        shortUrl: response.data.shortUrl,
        url: response.data.url,
        due: response.data.due,
      },
      message: `Successfully created card "${name}" with ID: ${response.data.id}`,
    });
  } catch (error) {
    console.error("Error creating card:", error);

    let errorMessage = "Failed to create card";
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
        message: `Failed to create card "${name}". ${errorMessage}`,
      },
      { status: statusCode }
    );
  }
}
