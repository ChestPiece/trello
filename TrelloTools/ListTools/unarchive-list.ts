import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const unarchiveListSchema = z.object({
  listId: z.string().describe("The ID of the list to unarchive (reopen)"),
});

export const unarchiveListTool = tool({
  description:
    "Unarchive (reopen) a Trello list. This restores a previously archived list and makes it active again.",
  parameters: unarchiveListSchema,
  execute: async ({ listId }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = `https://api.trello.com/1/lists/${listId}`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        closed: "false",
      });

      const response = await axios.put(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        list: {
          id: response.data.id,
          name: response.data.name,
          closed: response.data.closed,
          boardId: response.data.idBoard,
          position: response.data.pos,
          subscribed: response.data.subscribed,
        },
        message: `Successfully unarchived (reopened) list "${response.data.name}"`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to unarchive list";
      return {
        success: false,
        error: errorMessage,
        message: `Failed to unarchive list: ${errorMessage}`,
      };
    }
  },
});

