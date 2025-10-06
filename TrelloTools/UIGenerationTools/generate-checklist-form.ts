import { tool } from "ai";
import { z } from "zod";

const generateChecklistFormSchema = z.object({
  action: z
    .enum(["create", "update", "delete"])
    .describe(
      "The specific checklist operation to perform. Use 'create' for new checklists, 'update' for modifying existing checklist properties, or 'delete' for permanent removal."
    ),
  cardId: z
    .string()
    .describe(
      "The unique identifier of the card where the checklist belongs. Required for all checklist operations."
    ),
  checklistId: z
    .string()
    .optional()
    .describe(
      "The unique identifier of the checklist. Required for update and delete operations. Not needed for create operations."
    ),
  initialData: z
    .object({
      name: z
        .string()
        .optional()
        .describe(
          "The checklist name/title. Required for create operations, optional for updates."
        ),
      position: z
        .string()
        .optional()
        .describe(
          "The position of the checklist within the card. Can be 'top', 'bottom', or a specific position number."
        ),
    })
    .optional()
    .describe(
      "Pre-filled data for the form. Used primarily for update operations to populate existing values."
    ),
});

export const generateChecklistFormTool = tool({
  description:
    "Generate an interactive checklist management form component. Use this tool when users want to create new checklists, update existing checklist properties, or delete checklists permanently. The tool returns a specific UI component name that the frontend will render.",
  inputSchema: generateChecklistFormSchema,
  execute: async ({ action, cardId, checklistId, initialData }) => {
    // Map action to specific UI component names that the frontend expects
    const componentMap = {
      create: "ChecklistCreationCard",
      update: "ChecklistUpdateCard",
      delete: "ChecklistDeleteCard",
    };

    return {
      ui: componentMap[action],
      message: `Generated ${action} checklist form`,
      action,
      cardId,
      checklistId,
      initialData,
      metadata: {
        timestamp: Date.now(),
        generatedBy: "generateChecklistFormTool",
      },
    };
  },
});
