import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");
    const filter = searchParams.get("filter") || "all";
    const limit = searchParams.get("limit");
    const fields = searchParams.get("fields")?.split(",") || [
      "id",
      "name",
      "url",
      "pos",
      "date",
      "edgeColor",
      "previewUrl",
      "previewUrl2x",
      "isUpload",
      "mimeType",
      "bytes",
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

    const baseUrl = `https://api.trello.com/1/cards/${cardId}/attachments`;
    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
      filter: filter,
      fields: fields.join(","),
    });

    if (limit) {
      params.append("limit", limit);
    }

    const response = await axios.get(`${baseUrl}?${params.toString()}`);

    return NextResponse.json({
      success: true,
      attachments: response.data,
      cardId: cardId,
      filter: filter,
      limit: limit || "not specified",
    });
  } catch (error) {
    console.error("Error in attachments API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch attachments",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardId, name, url, file, mimeType } = body;

    if (!cardId) {
      return NextResponse.json(
        {
          success: false,
          error: "cardId is required",
        },
        { status: 400 }
      );
    }

    if (!name || (!url && !file)) {
      return NextResponse.json(
        {
          success: false,
          error: "name and either url or file is required",
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

    const baseUrl = `https://api.trello.com/1/cards/${cardId}/attachments`;
    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
      name,
    });

    if (url) {
      params.append("url", url);
    }

    if (mimeType) {
      params.append("mimeType", mimeType);
    }

    const response = await axios.post(`${baseUrl}?${params.toString()}`);

    return NextResponse.json({
      success: true,
      attachment: {
        id: response.data.id,
        name: response.data.name,
        url: response.data.url,
        pos: response.data.pos,
        date: response.data.date,
        edgeColor: response.data.edgeColor,
        previewUrl: response.data.previewUrl,
        previewUrl2x: response.data.previewUrl2x,
        isUpload: response.data.isUpload,
        mimeType: response.data.mimeType,
        bytes: response.data.bytes,
      },
      message: `Successfully created attachment "${name}" with ID: ${response.data.id}`,
    });
  } catch (error) {
    console.error("Error creating attachment:", error);

    let errorMessage = "Failed to create attachment";
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
        message: `Failed to create attachment. ${errorMessage}`,
      },
      { status: statusCode }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");
    const attachmentId = searchParams.get("attachmentId");

    if (!cardId || !attachmentId) {
      return NextResponse.json(
        {
          success: false,
          error: "cardId and attachmentId parameters are required",
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

    const baseUrl = `https://api.trello.com/1/cards/${cardId}/attachments/${attachmentId}`;
    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
    });

    await axios.delete(`${baseUrl}?${params.toString()}`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted attachment with ID: ${attachmentId}`,
    });
  } catch (error) {
    console.error("Error deleting attachment:", error);

    let errorMessage = "Failed to delete attachment";
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
        message: `Failed to delete attachment. ${errorMessage}`,
      },
      { status: statusCode }
    );
  }
}
