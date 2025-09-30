import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
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

    const baseUrl = "https://api.trello.com/1/members/me/boards";
    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
      filter: filter,
      fields:
        "id,name,desc,url,shortUrl,closed,pinned,starred,dateLastActivity,dateLastView,idTags,idLabels,idMembers,idMemberships,idShort,limits,memberships,prefs",
    });

    const response = await axios.get(`${baseUrl}?${params.toString()}`);

    return NextResponse.json({
      success: true,
      boards: response.data,
      filter: filter,
    });
  } catch (error) {
    console.error("Error in boards API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch boards",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      visibility = "private",
      defaultLists = true,
      defaultLabels = true,
    } = body;

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

    const baseUrl = "https://api.trello.com/1/boards";
    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
      name,
      desc: description || "",
      defaultLists: defaultLists.toString(),
      defaultLabels: defaultLabels.toString(),
      prefs_permissionLevel: visibility,
    });

    const response = await axios.post(`${baseUrl}?${params.toString()}`);

    return NextResponse.json({
      success: true,
      board: {
        id: response.data.id,
        name: response.data.name,
        description: response.data.desc,
        url: response.data.url,
        shortUrl: response.data.shortUrl,
        visibility: response.data.prefs?.permissionLevel,
        closed: response.data.closed,
        pinned: response.data.pinned,
        starred: response.data.starred,
        dateLastActivity: response.data.dateLastActivity,
        dateLastView: response.data.dateLastView,
        idTags: response.data.idTags,
        idLabels: response.data.idLabels,
        idMembers: response.data.idMembers,
        idMemberships: response.data.idMemberships,
        idShort: response.data.idShort,
        limits: response.data.limits,
        memberships: response.data.memberships,
        prefs: response.data.prefs,
      },
      message: `Successfully created board "${name}" with ID: ${response.data.id}`,
    });
  } catch (error) {
    console.error("Error creating board:", error);

    let errorMessage = "Failed to create board";
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
        message: `Failed to create board "${name}". ${errorMessage}`,
      },
      { status: statusCode }
    );
  }
}
