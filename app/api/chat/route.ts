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
  createCardTool,
  getCardTool,
  updateCardTool,
  deleteCardTool,
  listCardsTool,
  // New tools
  createLabelTool,
  getLabelTool,
  updateLabelTool,
  deleteLabelTool,
  listLabelsTool,
  createAttachmentTool,
  getAttachmentTool,
  deleteAttachmentTool,
  listAttachmentsTool,
  createChecklistTool,
  getChecklistTool,
  updateChecklistTool,
  deleteChecklistTool,
  listChecklistsTool,
  createChecklistItemTool,
  updateChecklistItemTool,
  deleteChecklistItemTool,
  addMemberToBoardTool,
  removeMemberFromBoardTool,
  listMembersTool,
  getMemberTool,
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
        // Card Tools
        createCard: createCardTool,
        getCard: getCardTool,
        updateCard: updateCardTool,
        deleteCard: deleteCardTool,
        listCards: listCardsTool,
        // Label Tools
        createLabel: createLabelTool,
        getLabel: getLabelTool,
        updateLabel: updateLabelTool,
        deleteLabel: deleteLabelTool,
        listLabels: listLabelsTool,
        // Attachment Tools
        createAttachment: createAttachmentTool,
        getAttachment: getAttachmentTool,
        deleteAttachment: deleteAttachmentTool,
        listAttachments: listAttachmentsTool,
        // Checklist Tools
        createChecklist: createChecklistTool,
        getChecklist: getChecklistTool,
        updateChecklist: updateChecklistTool,
        deleteChecklist: deleteChecklistTool,
        listChecklists: listChecklistsTool,
        createChecklistItem: createChecklistItemTool,
        updateChecklistItem: updateChecklistItemTool,
        deleteChecklistItem: deleteChecklistItemTool,
        // Member Tools
        addMemberToBoard: addMemberToBoardTool,
        removeMemberFromBoard: removeMemberFromBoardTool,
        listMembers: listMembersTool,
        getMember: getMemberTool,
      },
      maxSteps: 10, // Allow more complex multi-step operations
      temperature: 0, // Ensure deterministic tool calls
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
      // Enhanced tool call repair for better reliability
      experimental_repairToolCall: async ({ toolCall, error }) => {
        // Log the error for debugging but don't attempt repair for now
        console.error("Tool call error:", {
          toolName: toolCall.toolName,
          error: error.message,
          args: toolCall.args,
        });
        return null;
      },
    });

    // Return the streaming response
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("🚀 ~ POST ~ error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
