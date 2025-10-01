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

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("id") || searchParams.get("cardId");
    const body = await request.json();
    const {
      name,
      desc,
      closed,
      pos,
      due,
      dueComplete,
      idList,
      idBoard,
      idLabels,
      idMembers,
      idAttachmentCover,
      address,
      locationName,
      coordinates,
      cover,
      idMembersVoted,
      manualCoverAttachment,
      subscribed,
      checkItemStates,
      checklists,
      descData,
      dueReminder,
      email,
      idChecklists,
      labels,
      idShort,
      limits,
      members,
      membersVoted,
      start,
      stickers,
    } = body;

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

    const baseUrl = `https://api.trello.com/1/cards/${cardId}`;
    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
    });

    // Add all the parameters that are provided
    if (name) params.append("name", name);
    if (desc !== undefined) params.append("desc", desc);
    if (closed !== undefined) params.append("closed", closed.toString());
    if (pos !== undefined) params.append("pos", pos.toString());
    if (due) params.append("due", due);
    if (dueComplete !== undefined)
      params.append("dueComplete", dueComplete.toString());
    if (idList) params.append("idList", idList);
    if (idBoard) params.append("idBoard", idBoard);
    if (idLabels) params.append("idLabels", idLabels);
    if (idMembers) params.append("idMembers", idMembers);
    if (idAttachmentCover)
      params.append("idAttachmentCover", idAttachmentCover);
    if (address) params.append("address", address);
    if (locationName) params.append("locationName", locationName);
    if (coordinates) params.append("coordinates", coordinates);
    if (cover) params.append("cover", cover);
    if (idMembersVoted) params.append("idMembersVoted", idMembersVoted);
    if (manualCoverAttachment !== undefined)
      params.append("manualCoverAttachment", manualCoverAttachment.toString());
    if (subscribed !== undefined)
      params.append("subscribed", subscribed.toString());
    if (checkItemStates) params.append("checkItemStates", checkItemStates);
    if (checklists) params.append("checklists", checklists);
    if (descData) params.append("descData", descData);
    if (dueReminder) params.append("dueReminder", dueReminder.toString());
    if (email) params.append("email", email);
    if (idChecklists) params.append("idChecklists", idChecklists);
    if (labels) params.append("labels", labels);
    if (idShort) params.append("idShort", idShort.toString());
    if (limits) params.append("limits", limits);
    if (members) params.append("members", members);
    if (membersVoted) params.append("membersVoted", membersVoted);
    if (start) params.append("start", start);
    if (stickers) params.append("stickers", stickers);

    const response = await axios.put(`${baseUrl}?${params.toString()}`);

    return NextResponse.json({
      success: true,
      card: {
        id: response.data.id,
        name: response.data.name,
        desc: response.data.desc,
        idList: response.data.idList,
        idBoard: response.data.idBoard,
        url: response.data.url,
        shortUrl: response.data.shortUrl,
        due: response.data.due,
        pos: response.data.pos,
        subscribed: response.data.subscribed,
        closed: response.data.closed,
        idShort: response.data.idShort,
        shortLink: response.data.shortLink,
        labels: response.data.labels,
        idLabels: response.data.idLabels,
        idMembers: response.data.idMembers,
        idMembersVoted: response.data.idMembersVoted,
        idAttachmentCover: response.data.idAttachmentCover,
        address: response.data.address,
        locationName: response.data.locationName,
        coordinates: response.data.coordinates,
        cover: response.data.cover,
        manualCoverAttachment: response.data.manualCoverAttachment,
        checkItemStates: response.data.checkItemStates,
        checklists: response.data.checklists,
        descData: response.data.descData,
        dueReminder: response.data.dueReminder,
        email: response.data.email,
        idChecklists: response.data.idChecklists,
        limits: response.data.limits,
        members: response.data.members,
        membersVoted: response.data.membersVoted,
        start: response.data.start,
        stickers: response.data.stickers,
      },
      message: `Successfully updated card "${response.data.name}" with ID: ${cardId}`,
    });
  } catch (error) {
    console.error("Error updating card:", error);

    let errorMessage = "Failed to update card";
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
        message: `Failed to update card. ${errorMessage}`,
      },
      { status: statusCode }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("id") || searchParams.get("cardId");

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

    const baseUrl = `https://api.trello.com/1/cards/${cardId}`;
    const params = new URLSearchParams({
      key: apiKey,
      token: apiToken,
    });

    await axios.delete(`${baseUrl}?${params.toString()}`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted card with ID: ${cardId}`,
    });
  } catch (error) {
    console.error("Error deleting card:", error);

    let errorMessage = "Failed to delete card";
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
        message: `Failed to delete card. ${errorMessage}`,
      },
      { status: statusCode }
    );
  }
}
