import {
  streamText,
  convertToModelMessages,
  UIMessage,
  stepCountIs,
  smoothStream,
} from "ai";
import { openai } from "@ai-sdk/openai"; // ✅ v2 import
import { NextRequest } from "next/server";
import { systemPrompt } from "@/components/Prompts/system-prompt";
import { saveMessages } from "@/lib/message-persistence";

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
  archiveListTool,
  unarchiveListTool,
  createCardTool,
  getCardTool,
  updateCardTool,
  deleteCardTool,
  listCardsTool,
  createLabelTool,
  getLabelTool,
  updateLabelTool,
  deleteLabelTool,
  listLabelsTool,
  addLabelToCardTool,
  removeLabelFromCardTool,
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
  createWorkspaceTool,
  getWorkspaceTool,
  updateWorkspaceTool,
  deleteWorkspaceTool,
  listWorkspacesTool,
} from "@/TrelloTools";

// Import client-side form tools
import {
  createBoardFormTool,
  createCardFormTool,
  createListFormTool,
  createWorkspaceFormTool,
  createLabelFormTool,
  createChecklistFormTool,
  createAttachmentFormTool,
  updateBoardFormTool,
  updateCardFormTool,
  updateListFormTool,
  updateLabelFormTool,
  updateChecklistFormTool,
  updateChecklistItemFormTool,
  updateWorkspaceFormTool,
} from "@/TrelloTools/ClientSideTools";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Environment checks
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}
if (!process.env.TRELLO_API_KEY || !process.env.TRELLO_API_TOKEN) {
  console.warn(
    "Warning: Trello API credentials not configured. Trello tools will not work properly."
  );
}

// ✅ OpenAI client is automatically configured with OPENAI_API_KEY

export async function POST(req: NextRequest) {
  try {
    const { messages, chatId }: { messages: UIMessage[]; chatId?: string } =
      await req.json();

    // Validate messages format
    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages format", { status: 400 });
    }

    // Validate that we have at least one message
    if (messages.length === 0) {
      return new Response("No messages provided", { status: 400 });
    }

    // Convert UI messages to model messages
    const modelMessages = convertToModelMessages(messages);

    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: modelMessages,
      system: systemPrompt,
      temperature: 0, // Deterministic for tool calls
      stopWhen: stepCountIs(5), // Allow up to 5 steps for multi-step tool calls
      experimental_transform: smoothStream(), // ✅ Add smooth streaming
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
        archiveList: archiveListTool,
        unarchiveList: unarchiveListTool,

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
        addLabelToCard: addLabelToCardTool,
        removeLabelFromCard: removeLabelFromCardTool,

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

        // Workspace Tools
        createWorkspace: createWorkspaceTool,
        getWorkspace: getWorkspaceTool,
        updateWorkspace: updateWorkspaceTool,
        deleteWorkspace: deleteWorkspaceTool,
        listWorkspaces: listWorkspacesTool,

        // Client-side Form Tools (for interactive UI generation)
        // Create Forms
        createBoardForm: createBoardFormTool,
        createCardForm: createCardFormTool,
        createListForm: createListFormTool,
        createWorkspaceForm: createWorkspaceFormTool,
        createLabelForm: createLabelFormTool,
        createChecklistForm: createChecklistFormTool,
        createAttachmentForm: createAttachmentFormTool,

        // Update Forms
        updateBoardForm: updateBoardFormTool,
        updateCardForm: updateCardFormTool,
        updateListForm: updateListFormTool,
        updateLabelForm: updateLabelFormTool,
        updateChecklistForm: updateChecklistFormTool,
        updateChecklistItemForm: updateChecklistItemFormTool,
        updateWorkspaceForm: updateWorkspaceFormTool,
      },
      onFinish: ({ finishReason, usage, toolCalls, toolResults }) => {
        // Log completion for monitoring
        console.log("Chat completion finished:", {
          finishReason,
          usage,
          toolCallsCount: toolCalls?.length || 0,
          toolResultsCount: toolResults?.length || 0,
        });
      },
      onError: ({ error }) => {
        console.error("Stream error:", error);
      },
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onFinish: async ({ messages: finalMessages }) => {
        // Save messages to persistence layer
        if (chatId && finalMessages) {
          try {
            await saveMessages(chatId, finalMessages);
            console.log(`Messages saved for chat ${chatId}`);
          } catch (error) {
            console.error("Failed to save messages:", error);
          }
        }
      },
      onError: (error: unknown) => {
        console.error("Stream error:", error);

        // Provide user-friendly error messages
        if (error instanceof Error) {
          // Check for specific error types
          if (error.message.includes("API key")) {
            return "Authentication error. Please check your API configuration.";
          }
          if (error.message.includes("rate limit")) {
            return "Rate limit exceeded. Please try again in a moment.";
          }
          if (error.message.includes("Trello")) {
            return "Trello service error. Please check your Trello configuration.";
          }
          return `An error occurred: ${error.message}`;
        }
        return "An unexpected error occurred while processing your request.";
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);

    // Return appropriate error response
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
