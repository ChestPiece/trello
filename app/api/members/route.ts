import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get("boardId");
    const memberId = searchParams.get("memberId");
    const fields = searchParams.get("fields")?.split(",") || [
      "id",
      "username",
      "fullName",
      "initials",
      "avatarHash",
      "avatarUrl",
      "email",
      "idBoards",
      "idOrganizations",
      "loginTypes",
      "memberType",
      "oneTimeMessagesDismissed",
      "prefs",
      "trophies",
      "uploadedAvatarHash",
      "url",
      "status",
    ];

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
    if (memberId) {
      baseUrl = `https://api.trello.com/1/members/${memberId}`;
    } else if (boardId) {
      baseUrl = `https://api.trello.com/1/boards/${boardId}/members`;
    } else {
      baseUrl = "https://api.trello.com/1/members/me";
    }

    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
      fields: fields.join(","),
    });

    const response = await axios.get(`${baseUrl}?${params.toString()}`);

    return NextResponse.json({
      success: true,
      members: memberId ? [response.data] : response.data,
      boardId: boardId || null,
      memberId: memberId || null,
    });
  } catch (error) {
    console.error("Error in members API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch members",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { boardId, memberId, email, fullName, type = "normal" } = body;

    if (!boardId || (!memberId && !email)) {
      return NextResponse.json(
        {
          success: false,
          error: "boardId and either memberId or email are required",
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

    const baseUrl = `https://api.trello.com/1/boards/${boardId}/members`;
    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
      type: type,
    });

    if (memberId) {
      params.append("idMember", memberId);
    } else if (email) {
      params.append("email", email);
    }

    if (fullName) {
      params.append("fullName", fullName);
    }

    const response = await axios.put(`${baseUrl}?${params.toString()}`);

    return NextResponse.json({
      success: true,
      member: {
        id: response.data.id,
        username: response.data.username,
        fullName: response.data.fullName,
        initials: response.data.initials,
        avatarHash: response.data.avatarHash,
        avatarUrl: response.data.avatarUrl,
        email: response.data.email,
        memberType: response.data.memberType,
        status: response.data.status,
      },
      message: `Successfully added member to board`,
    });
  } catch (error) {
    console.error("Error adding member:", error);

    let errorMessage = "Failed to add member";
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
        message: `Failed to add member. ${errorMessage}`,
      },
      { status: statusCode }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get("boardId");
    const memberId = searchParams.get("memberId");
    const body = await request.json();
    const { type, fullName } = body;

    if (!boardId || !memberId) {
      return NextResponse.json(
        {
          success: false,
          error: "boardId and memberId parameters are required",
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

    const baseUrl = `https://api.trello.com/1/boards/${boardId}/members/${memberId}`;
    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
    });

    if (type) {
      params.append("type", type);
    }

    if (fullName) {
      params.append("fullName", fullName);
    }

    const response = await axios.put(`${baseUrl}?${params.toString()}`);

    return NextResponse.json({
      success: true,
      member: {
        id: response.data.id,
        username: response.data.username,
        fullName: response.data.fullName,
        initials: response.data.initials,
        avatarHash: response.data.avatarHash,
        avatarUrl: response.data.avatarUrl,
        email: response.data.email,
        memberType: response.data.memberType,
        status: response.data.status,
      },
      message: `Successfully updated member on board`,
    });
  } catch (error) {
    console.error("Error updating member:", error);

    let errorMessage = "Failed to update member";
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
        message: `Failed to update member. ${errorMessage}`,
      },
      { status: statusCode }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get("boardId");
    const memberId = searchParams.get("memberId");

    if (!boardId || !memberId) {
      return NextResponse.json(
        {
          success: false,
          error: "boardId and memberId parameters are required",
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

    const baseUrl = `https://api.trello.com/1/boards/${boardId}/members/${memberId}`;
    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
    });

    await axios.delete(`${baseUrl}?${params.toString()}`);

    return NextResponse.json({
      success: true,
      message: `Successfully removed member from board`,
    });
  } catch (error) {
    console.error("Error removing member:", error);

    let errorMessage = "Failed to remove member";
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
        message: `Failed to remove member. ${errorMessage}`,
      },
      { status: statusCode }
    );
  }
}

