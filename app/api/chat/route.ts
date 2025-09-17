import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest } from "next/server";
import { systemPrompt } from "@/components/system-prompt";
import {
  createBoardTool,
  getBoardTool,
  updateBoardTool,
  deleteBoardTool,
  listBoardsTool,
  createListTool,
  getListTool,
  updateListTool,
  deleteListTool,
  listListsTool,
} from "@/TrelloTools";

// You'll need to set OPENAI_API_KEY in your environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

// Check for Trello API credentials
if (!process.env.TRELLO_API_KEY || !process.env.TRELLO_API_TOKEN) {
  console.warn(
    "Warning: Trello API credentials not configured. Trello tools will not work properly."
  );
}

export async function POST(req: NextRequest) {
  // Extract the `messages` from the body of the request
  try {
    const { messages } = await req.json();

    // Stream the response using streamText with Trello tools integration
    const result = streamText({
      model: openai("gpt-4o"),
      messages,
      system: systemPrompt,
      tools: {
        // Board Tools
        createBoard: createBoardTool,
        getBoard: getBoardTool,
        updateBoard: updateBoardTool,
        deleteBoard: deleteBoardTool,
        listBoards: listBoardsTool,
        // List Tools
        createList: createListTool,
        getList: getListTool,
        updateList: updateListTool,
        deleteList: deleteListTool,
        listLists: listListsTool,
      },
      maxSteps: 5, // Allow multi-step tool usage
      onError: ({ error }) => {
        console.error("Stream error:", error);
      },
      onFinish: ({ text, toolCalls, toolResults, usage }) => {
        console.log("Stream finished:", {
          textLength: text.length,
          toolCallsCount: toolCalls.length,
          toolResultsCount: toolResults.length,
          usage,
        });
      },
    });

    // Return the streaming response
    return result.toDataStreamResponse();
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
