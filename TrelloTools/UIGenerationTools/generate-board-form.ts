import { tool } from "ai";
import { z } from "zod";

const generateBoardFormSchema = z.object({
  action: z
    .enum(["create", "update", "delete", "close"])
    .describe(
      "The specific board operation to perform. Use 'create' for new boards, 'update' for modifying existing boards, 'delete' for permanent removal, or 'close' for archiving boards."
    ),
  boardId: z
    .string()
    .optional()
    .describe(
      "The unique identifier of the board. Required for update, delete, and close operations. Not needed for create operations."
    ),
  initialData: z
    .object({
      name: z
        .string()
        .optional()
        .describe(
          "The board name. Required for create operations, optional for updates."
        ),
      description: z
        .string()
        .optional()
        .describe("A detailed description of the board's purpose and content."),
      visibility: z
        .enum(["private", "public", "org"])
        .optional()
        .describe(
          "Board visibility level: 'private' (only you), 'public' (anyone), or 'org' (organization members only)."
        ),
      organizationId: z
        .string()
        .optional()
        .describe(
          "The organization ID if the board belongs to a specific organization."
        ),
    })
    .optional()
    .describe(
      "Pre-filled data for the form. Used primarily for update operations to populate existing values."
    ),
});

export const generateBoardFormTool = tool({
  description:
    "Generate an interactive board management form component. Use this tool when users want to create new boards, update existing board settings, delete boards permanently, or close/archive boards. The tool returns a specific UI component name that the frontend will render.",
  inputSchema: generateBoardFormSchema,
  execute: async ({ action, boardId, initialData }) => {
    // Map action to specific UI component names that the frontend expects
    const componentMap = {
      create: "BoardCreationCard",
      update: "BoardUpdateCard",
      delete: "BoardDeleteCard",
      close: "BoardCloseCard",
    };

    return {
      ui: componentMap[action],
      message: `Generated ${action} board form`,
      action,
      boardId,
      initialData,
      metadata: {
        timestamp: Date.now(),
        generatedBy: "generateBoardFormTool",
      },
    };
  },
});
