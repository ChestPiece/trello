import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const unarchiveListSchema = z.object({
  listId: z.string().describe("The ID of the list to unarchive (reopen)"),
});

export const unarchiveListTool = {
  description:
    "Unarchive (reopen) a Trello list. This restores a previously archived list and makes it active again.",
  inputSchema: unarchiveListSchema,

  execute: async ({ listId }: { listId: string }) => {
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

      // Return the unarchived list data directly for UI components
      return {
        id: response.data.id,
        name: response.data.name,
        closed: response.data.closed,
        boardId: response.data.idBoard,
        position: response.data.pos,
        subscribed: response.data.subscribed,
        softLimit: response.data.softLimit,
        status: response.data.status,
        creationMethod: response.data.creationMethod,
        unarchived: true,
        message: `Successfully unarchived (reopened) list "${response.data.name}"`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to unarchive list";
      throw new Error(`Failed to unarchive list: ${errorMessage}`);
    }
  },
};
