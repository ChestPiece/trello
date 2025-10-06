import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const getAttachmentSchema = z.object({
  cardId: z.string().describe("The ID of the card containing the attachment"),
  attachmentId: z.string().describe("The ID of the attachment to retrieve"),
  fields: z
    .array(z.string())
    .optional()
    .describe("Specific fields to return (e.g., name,url,mimeType,bytes)"),
});

export const getAttachmentTool = tool({
  description:
    "Retrieve detailed information about a specific Trello attachment",
  inputSchema: getAttachmentSchema,
  execute: async ({ cardId, attachmentId, fields }) => {
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
        ...(fields && { fields: fields.join(",") }),
      });

      const response = await axios.get(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        attachment: response.data,
        message: `Successfully retrieved attachment "${response.data.name}" (ID: ${attachmentId})`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to retrieve attachment";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to retrieve attachment with ID "${attachmentId}". ${errorMessage}`,
      };
    }
  },
});
