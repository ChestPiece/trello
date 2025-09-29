import { streamText, convertToModelMessages, UIMessage, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest } from "next/server";
import { systemPrompt } from "@/components/Prompts/system-prompt";
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
  // New tools
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
  // Workspace Tools
  createWorkspaceTool,
  getWorkspaceTool,
  updateWorkspaceTool,
  deleteWorkspaceTool,
  listWorkspacesTool,
} from "@/TrelloTools";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

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
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages format", { status: 400 });
    }

    const result = streamText({
      model: openai("gpt-4o") as unknown as Parameters<
        typeof streamText
      >[0]["model"],
      messages: convertToModelMessages(messages),
      system: systemPrompt,
      stopWhen: stepCountIs(5), // Limit steps for better performance
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
      },
      temperature: 0, // Ensure deterministic tool calls
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      messageMetadata: ({ part }) => {
        if (part.type === "start") {
          return {
            createdAt: Date.now(),
            model: "gpt-4o",
          };
        }
        if (part.type === "finish") {
          return {
            totalTokens: part.totalUsage.totalTokens,
          };
        }
      },
      onError: (error) => {
        console.error("Stream error:", error);
        // Return a user-friendly error message
        if (error instanceof Error) {
          return `An error occurred: ${error.message}`;
        }
        return "An error occurred while processing your request.";
      },
    });
  } catch (error) {
    console.error("🚀 ~ POST ~ error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
