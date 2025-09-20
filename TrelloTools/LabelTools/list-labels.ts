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
  filter: z
    .enum(["all", "none"])
    .optional()
    .describe("Filter labels by usage (all, none)"),
  color: z
    .enum([
      "yellow",
      "purple",
      "blue",
      "red",
      "green",
      "orange",
      "black",
      "sky",
      "pink",
      "lime",
    ])
    .optional()
    .describe("Filter labels by specific color"),
});

export const listLabelsTool = tool({
  description:
    "List all labels in a Trello board with optional filtering, field selection, and color filtering",
  parameters: listLabelsSchema,
  execute: async ({ boardId, fields, limit, filter, color }) => {
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
        ...(filter && { filter }),
      });

      const response = await axios.get(`${baseUrl}?${params.toString()}`);

      let labels = response.data;

      // Apply client-side color filtering if specified
      if (color) {
        labels = labels.filter((label: any) => label.color === color);
      }

      // Apply limit after filtering
      if (limit && labels.length > limit) {
        labels = labels.slice(0, limit);
      }

      return {
        success: true,
        labels,
        count: labels.length,
        totalCount: response.data.length,
        filters: {
          color: color || null,
          filter: filter || null,
          limit: limit || null,
        },
        message: `Successfully retrieved ${
          labels.length
        } labels from board ${boardId}${
          color ? ` (filtered by color: ${color})` : ""
        }${filter ? ` (filtered by usage: ${filter})` : ""}`,
      };
    } catch (error: unknown) {
      console.error("List labels error:", error);

      let errorMessage = "Failed to list labels";
      let statusCode = 500;

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string }; status?: number };
        };
        errorMessage = axiosError.response?.data?.message || errorMessage;
        statusCode = axiosError.response?.status || statusCode;
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as { message: string }).message;
      }

      return {
        success: false,
        error: errorMessage,
        statusCode,
        message: `Failed to list labels for board "${boardId}". ${errorMessage}`,
        suggestions: [
          "Check if the board ID is valid and exists",
          "Verify that you have permission to access this board",
          "Ensure API credentials are properly configured",
          "Check if the board has any labels",
          "Verify that filter parameters are valid",
        ],
      };
    }
  },
});
