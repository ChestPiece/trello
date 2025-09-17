import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const listMembersSchema = z.object({
  boardId: z.string().describe("The ID of the board to list members from"),
  fields: z
    .array(z.string())
    .optional()
    .describe("Specific fields to return (e.g., username,fullName,email)"),
  filter: z
    .enum(["all", "none", "normal", "owners", "admins"])
    .optional()
    .describe("Filter members by type"),
  activity: z
    .boolean()
    .optional()
    .describe("Whether to include activity information"),
});

export const listMembersTool = tool({
  description:
    "List all members of a Trello board with optional filtering and field selection",
  parameters: listMembersSchema,
  execute: async ({ boardId, fields, filter, activity }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = `https://api.trello.com/1/boards/${boardId}/members`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        ...(fields && { fields: fields.join(",") }),
        ...(filter && { filter }),
        ...(activity !== undefined && { activity: activity.toString() }),
      });

      const response = await axios.get(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        members: response.data,
        count: response.data.length,
        message: `Successfully retrieved ${response.data.length} members from board ${boardId}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to list members";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to list members for board "${boardId}". ${errorMessage}`,
      };
    }
  },
});
