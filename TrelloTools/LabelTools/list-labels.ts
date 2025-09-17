import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const listLabelsSchema = z.object({
  boardId: z.string().describe("The ID of the board to list labels from"),
  fields: z
    .array(z.string())
    .optional()
    .describe("Specific fields to return (e.g., name,color,uses)"),
  limit: z.number().optional().describe("Maximum number of labels to return"),
});

export const listLabelsTool = tool({
  description:
    "List all labels in a Trello board with optional filtering and field selection",
  parameters: listLabelsSchema,
  execute: async ({ boardId, fields, limit }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = `https://api.trello.com/1/boards/${boardId}/labels`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        ...(fields && { fields: fields.join(",") }),
        ...(limit && { limit: limit.toString() }),
      });

      const response = await axios.get(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        labels: response.data,
        count: response.data.length,
        message: `Successfully retrieved ${response.data.length} labels from board ${boardId}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to list labels";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to list labels for board "${boardId}". ${errorMessage}`,
      };
    }
  },
});
