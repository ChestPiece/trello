import { streamText } from "ai";
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
      experimental_repairToolCall: async ({ toolCall, error, tools }) => {
        console.error("Tool call error:", {
          toolName: toolCall.toolName,
          error: error.message,
          args: toolCall.args,
        });

        try {
          // Get the tool definition
          const tool = tools[toolCall.toolName as keyof typeof tools];
          if (!tool) {
            console.error(
              `Tool ${toolCall.toolName} not found in tools object`
            );
            return null;
          }

          // For schema validation errors, try to repair the input
          if (
            error.message.includes("schema") ||
            error.message.includes("validation")
          ) {
            console.log(
              `Attempting to repair tool call for ${toolCall.toolName}`
            );

            // Create a repair prompt
            const repairPrompt = `The AI tried to call the tool "${
              toolCall.toolName
            }" with these arguments:
${JSON.stringify(toolCall.args, null, 2)}

But it failed with this error:
${error.message}

Please provide corrected arguments that match the tool's schema. Return only valid JSON.`;

            // Use streamText for repair instead of generateText
            const repairResponse = await streamText({
              model: openai("gpt-4o"),
              prompt: repairPrompt,
              temperature: 0,
            });

            try {
              const text = await repairResponse.text;
              const repairedArgs = JSON.parse(text);
              console.log(
                `Repaired arguments for ${toolCall.toolName}:`,
                repairedArgs
              );

              return {
                ...toolCall,
                args: repairedArgs,
              };
            } catch (parseError) {
              console.error("Failed to parse repaired arguments:", parseError);
              return null;
            }
          }

          // For other errors, try to provide a more helpful error message
          if (
            error.message.includes("API") ||
            error.message.includes("network")
          ) {
            return {
              ...toolCall,
              args: {
                _error: `API Error: ${error.message}. Please check your Trello API credentials and try again.`,
              },
            };
          }

          // For unknown errors, return null to let the system handle it
          return null;
        } catch (repairError) {
          console.error("Error during tool call repair:", repairError);
          return null;
        }
      },
    });

    // Return the streaming response
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("🚀 ~ POST ~ error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
