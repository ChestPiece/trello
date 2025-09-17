import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const listAttachmentsSchema = z.object({
  cardId: z.string().describe("The ID of the card to list attachments from"),
  fields: z
    .array(z.string())
    .optional()
    .describe("Specific fields to return (e.g., name,url,mimeType,bytes)"),
  filter: z
    .enum(["cover", "gallery", "all"])
    .optional()
    .describe("Filter attachments by type"),
  limit: z
    .number()
    .optional()
    .describe("Maximum number of attachments to return"),
});

export const listAttachmentsTool = tool({
  description:
    "List all attachments on a Trello card with optional filtering and field selection",
  parameters: listAttachmentsSchema,
  execute: async ({ cardId, fields, filter, limit }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = `https://api.trello.com/1/cards/${cardId}/attachments`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        ...(fields && { fields: fields.join(",") }),
        ...(filter && { filter }),
        ...(limit && { limit: limit.toString() }),
      });

      const response = await axios.get(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        attachments: response.data,
        count: response.data.length,
        message: `Successfully retrieved ${response.data.length} attachments from card ${cardId}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to list attachments";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to list attachments for card "${cardId}". ${errorMessage}`,
      };
    }
  },
});
