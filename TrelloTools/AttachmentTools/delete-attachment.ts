import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const deleteAttachmentSchema = z.object({
  cardId: z.string().describe("The ID of the card containing the attachment"),
  attachmentId: z.string().describe("The ID of the attachment to delete"),
});

export const deleteAttachmentTool = tool({
  description:
    "Delete a Trello attachment permanently. This action cannot be undone.",
  parameters: deleteAttachmentSchema,
  execute: async ({ cardId, attachmentId }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = `https://api.trello.com/1/cards/${cardId}/attachments/${attachmentId}`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
      });

      const response = await axios.delete(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        message: `Successfully deleted attachment with ID: ${attachmentId}`,
        deletedAttachment: {
          id: attachmentId,
          cardId,
          deleted: true,
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to delete attachment";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to delete attachment with ID "${attachmentId}". ${errorMessage}`,
      };
    }
  },
});
