import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const updateListSchema = z.object({
  listId: z.string().describe("The ID of the list to update"),
  name: z.string().optional().describe("New name for the list"),
  closed: z.boolean().optional().describe("Whether the list should be closed"),
  pos: z
    .union([z.string(), z.number()])
    .optional()
    .describe("New position of the list"),
  subscribed: z
    .boolean()
    .optional()
    .describe("Whether to subscribe to the list"),
  idBoard: z
    .string()
    .optional()
    .describe("ID of the board to move the list to"),
});

export const updateListTool = tool({
  description:
    "Update an existing Trello list with new name, position, or other settings",
  inputSchema: updateListSchema,
  execute: async ({ listId, name, closed, pos, subscribed, idBoard }) => {
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
        ...(name && { name }),
        ...(closed !== undefined && { closed: closed.toString() }),
        ...(pos !== undefined && { pos: pos.toString() }),
        ...(subscribed !== undefined && { subscribed: subscribed.toString() }),
        ...(idBoard && { idBoard }),
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
          softLimit: response.data.softLimit,
          status: response.data.status,
          creationMethod: response.data.creationMethod,
        },
        message: `Successfully updated list "${response.data.name}"`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to update list";
      return {
        success: false,
        error: errorMessage,
        message: `Failed to update list: ${errorMessage}`,
      };
    }
  },
});
