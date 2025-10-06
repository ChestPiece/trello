import { tool } from "ai";
import { z } from "zod";

const generateListFormSchema = z.object({
  action: z
    .enum(["create", "update", "delete", "archive", "close"])
    .describe(
      "The specific list operation to perform. Use 'create' for new lists, 'update' for modifying existing lists, 'delete' for permanent removal, 'archive' for archiving lists, or 'close' for closing lists."
    ),
  boardId: z
    .string()
    .describe(
      "The unique identifier of the board where the list belongs. Required for all list operations."
    ),
  listId: z
    .string()
    .optional()
    .describe(
      "The unique identifier of the list. Required for update, delete, archive, and close operations. Not needed for create operations."
    ),
  initialData: z
    .object({
      name: z
        .string()
        .optional()
        .describe(
          "The list name. Required for create operations, optional for updates."
        ),
      position: z
        .string()
        .optional()
        .describe(
          "The position of the list within the board. Can be 'top', 'bottom', or a specific position number."
        ),
    })
    .optional()
    .describe(
      "Pre-filled data for the form. Used primarily for update operations to populate existing values."
    ),
});

export const generateListFormTool = tool({
  description:
    "Generate an interactive list management form component. Use this tool when users want to create new lists, update existing list settings, delete lists permanently, archive lists, or close lists. The tool returns a specific UI component name that the frontend will render.",
  inputSchema: generateListFormSchema,
  execute: async ({ action, boardId, listId, initialData }) => {
    // Map action to specific UI component names that the frontend expects
    const componentMap = {
      create: "ListCreationCard",
      update: "ListUpdateCard",
      delete: "ListDeleteCard",
      archive: "ListArchiveCard",
      close: "ListCloseCard",
    };

    return {
      ui: componentMap[action],
      message: `Generated ${action} list form`,
      action,
      boardId,
      listId,
      initialData,
      metadata: {
        timestamp: Date.now(),
        generatedBy: "generateListFormTool",
      },
    };
  },
});
