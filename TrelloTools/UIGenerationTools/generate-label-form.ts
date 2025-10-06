import { tool } from "ai";
import { z } from "zod";

const generateLabelFormSchema = z.object({
  action: z
    .enum(["create", "update", "delete"])
    .describe(
      "The specific label operation to perform. Use 'create' for new labels, 'update' for modifying existing label properties, or 'delete' for permanent removal."
    ),
  boardId: z
    .string()
    .describe(
      "The unique identifier of the board where the label belongs. Required for all label operations."
    ),
  labelId: z
    .string()
    .optional()
    .describe(
      "The unique identifier of the label. Required for update and delete operations. Not needed for create operations."
    ),
  initialData: z
    .object({
      name: z
        .string()
        .optional()
        .describe(
          "The label name/title. Required for create operations, optional for updates."
        ),
      color: z
        .string()
        .optional()
        .describe(
          "The label color in hex format (e.g., '#ff0000') or predefined color name (e.g., 'red', 'blue', 'green')."
        ),
    })
    .optional()
    .describe(
      "Pre-filled data for the form. Used primarily for update operations to populate existing values."
    ),
});

export const generateLabelFormTool = tool({
  description:
    "Generate an interactive label management form component. Use this tool when users want to create new labels, update existing label properties, or delete labels permanently. The tool returns a specific UI component name that the frontend will render.",
  inputSchema: generateLabelFormSchema,
  execute: async ({ action, boardId, labelId, initialData }) => {
    // Map action to specific UI component names that the frontend expects
    const componentMap = {
      create: "LabelCreationCard",
      update: "LabelUpdateCard",
      delete: "LabelDeleteCard",
    };

    return {
      ui: componentMap[action],
      message: `Generated ${action} label form`,
      action,
      boardId,
      labelId,
      initialData,
      metadata: {
        timestamp: Date.now(),
        generatedBy: "generateLabelFormTool",
      },
    };
  },
});
