import { tool } from "ai";
import { z } from "zod";

const generateAttachmentFormSchema = z.object({
  action: z
    .enum(["create", "delete"])
    .describe(
      "The specific attachment operation to perform. Use 'create' for adding new attachments to cards, or 'delete' for removing existing attachments."
    ),
  cardId: z
    .string()
    .describe(
      "The unique identifier of the card where the attachment belongs. Required for all attachment operations."
    ),
  attachmentId: z
    .string()
    .optional()
    .describe(
      "The unique identifier of the attachment. Required for delete operations. Not needed for create operations."
    ),
  initialData: z
    .object({
      url: z
        .string()
        .optional()
        .describe(
          "The URL of the attachment to be added. Required for create operations."
        ),
      name: z
        .string()
        .optional()
        .describe(
          "The display name for the attachment. If not provided, will be derived from the URL."
        ),
    })
    .optional()
    .describe(
      "Pre-filled data for the form. Used primarily for create operations to populate default values."
    ),
});

export const generateAttachmentFormTool = tool({
  description:
    "Generate an interactive attachment management form component. Use this tool when users want to add new attachments to cards or remove existing attachments. The tool returns a specific UI component name that the frontend will render.",
  inputSchema: generateAttachmentFormSchema,
  execute: async ({ action, cardId, attachmentId, initialData }) => {
    // Map action to specific UI component names that the frontend expects
    const componentMap = {
      create: "AttachmentCreationCard",
      delete: "AttachmentDeleteCard",
    };

    return {
      ui: componentMap[action],
      message: `Generated ${action} attachment form`,
      action,
      cardId,
      attachmentId,
      initialData,
      metadata: {
        timestamp: Date.now(),
        generatedBy: "generateAttachmentFormTool",
      },
    };
  },
});
