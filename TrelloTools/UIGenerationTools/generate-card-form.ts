import { tool } from "ai";
import { z } from "zod";

const generateCardFormSchema = z.object({
  action: z
    .enum(["create", "update", "delete"])
    .describe(
      "The specific card operation to perform. Use 'create' for new cards, 'update' for modifying existing cards, or 'delete' for permanent removal."
    ),
  listId: z
    .string()
    .describe(
      "The unique identifier of the list where the card belongs. Required for all card operations."
    ),
  cardId: z
    .string()
    .optional()
    .describe(
      "The unique identifier of the card. Required for update and delete operations. Not needed for create operations."
    ),
  initialData: z
    .object({
      name: z
        .string()
        .optional()
        .describe(
          "The card title/name. Required for create operations, optional for updates."
        ),
      description: z
        .string()
        .optional()
        .describe(
          "A detailed description of the card's content and requirements."
        ),
      dueDate: z
        .string()
        .optional()
        .describe("The due date for the card in ISO format (YYYY-MM-DD)."),
      memberIds: z
        .array(z.string())
        .optional()
        .describe("Array of member IDs assigned to this card."),
    })
    .optional()
    .describe(
      "Pre-filled data for the form. Used primarily for update operations to populate existing values."
    ),
});

export const generateCardFormTool = tool({
  description:
    "Generate an interactive card management form component. Use this tool when users want to create new cards, update existing card details, or delete cards permanently. The tool returns a specific UI component name that the frontend will render.",
  inputSchema: generateCardFormSchema,
  execute: async ({ action, listId, cardId, initialData }) => {
    // Map action to specific UI component names that the frontend expects
    const componentMap = {
      create: "CardCreationCard",
      update: "CardUpdateCard",
      delete: "CardDeleteCard",
    };

    return {
      ui: componentMap[action],
      message: `Generated ${action} card form`,
      action,
      listId,
      cardId,
      initialData,
      metadata: {
        timestamp: Date.now(),
        generatedBy: "generateCardFormTool",
      },
    };
  },
});
