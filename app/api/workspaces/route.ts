import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
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
    if (workspaceId) {
      baseUrl = `https://api.trello.com/1/organizations/${workspaceId}`;
    } else {
      baseUrl = "https://api.trello.com/1/members/me/organizations";
    }

    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
      fields: fields.join(","),
    });

    const response = await axios.get(`${baseUrl}?${params.toString()}`);

    return NextResponse.json({
      success: true,
      workspaces: workspaceId ? [response.data] : response.data,
      workspaceId: workspaceId || "all",
    });
  } catch (error) {
    console.error("Error in workspaces API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch workspaces",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { displayName, desc, name, website } = body;

    if (!displayName) {
      return NextResponse.json(
        {
          success: false,
          error: "displayName is required",
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

    const baseUrl = "https://api.trello.com/1/organizations";
    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
      displayName,
    });

    if (desc) {
      params.append("desc", desc);
    }

    if (name) {
      params.append("name", name);
    }

    if (website) {
      params.append("website", website);
    }

    const response = await axios.post(`${baseUrl}?${params.toString()}`);

    return NextResponse.json({
      success: true,
      workspace: {
        id: response.data.id,
        name: response.data.name,
        displayName: response.data.displayName,
        desc: response.data.desc,
        url: response.data.url,
        website: response.data.website,
        logo: response.data.logo,
        prefs: response.data.prefs,
      },
      message: `Successfully created workspace "${displayName}" with ID: ${response.data.id}`,
    });
  } catch (error) {
    console.error("Error creating workspace:", error);

    let errorMessage = "Failed to create workspace";
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
        message: `Failed to create workspace. ${errorMessage}`,
      },
      { status: statusCode }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const body = await request.json();
    const { displayName, desc, name, website } = body;

    if (!workspaceId) {
      return NextResponse.json(
        {
          success: false,
          error: "workspaceId parameter is required",
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

    const baseUrl = `https://api.trello.com/1/organizations/${workspaceId}`;
    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
    });

    if (displayName) {
      params.append("displayName", displayName);
    }

    if (desc) {
      params.append("desc", desc);
    }

    if (name) {
      params.append("name", name);
    }

    if (website) {
      params.append("website", website);
    }

    const response = await axios.put(`${baseUrl}?${params.toString()}`);

    return NextResponse.json({
      success: true,
      workspace: {
        id: response.data.id,
        name: response.data.name,
        displayName: response.data.displayName,
        desc: response.data.desc,
        url: response.data.url,
        website: response.data.website,
        logo: response.data.logo,
        prefs: response.data.prefs,
      },
      message: `Successfully updated workspace with ID: ${workspaceId}`,
    });
  } catch (error) {
    console.error("Error updating workspace:", error);

    let errorMessage = "Failed to update workspace";
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
        message: `Failed to update workspace. ${errorMessage}`,
      },
      { status: statusCode }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        {
          success: false,
          error: "workspaceId parameter is required",
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

    const baseUrl = `https://api.trello.com/1/organizations/${workspaceId}`;
    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
    });

    await axios.delete(`${baseUrl}?${params.toString()}`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted workspace with ID: ${workspaceId}`,
    });
  } catch (error) {
    console.error("Error deleting workspace:", error);

    let errorMessage = "Failed to delete workspace";
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
        message: `Failed to delete workspace. ${errorMessage}`,
      },
      { status: statusCode }
    );
  }
}
