import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const createListSchema = z.object({
  boardId: z.string().describe("The ID of the board to create the list in"),
  name: z.string().describe("The name of the list to create"),
  position: z
    .union([z.string(), z.number()])
    .optional()
    .describe("Position of the list. 'top', 'bottom', or a positive number"),
  closed: z.boolean().optional().describe("Whether the list should be closed"),
  idListSource: z.string().optional().describe("ID of a list to copy from"),
  subscribe: z
    .boolean()
    .optional()
    .describe("Whether to subscribe to the list"),
});

export const createListTool = tool({
  description:
    "Create a new list in a Trello board with specified name and optional settings",
  parameters: createListSchema,
  execute: async ({
    boardId,
    name,
    position,
    closed,
    idListSource,
    subscribe,
  }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = "https://api.trello.com/1/lists";
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        idBoard: boardId,
        name,
        ...(position !== undefined && { pos: position.toString() }),
        ...(closed !== undefined && { closed: closed.toString() }),
        ...(idListSource && { idListSource }),
        ...(subscribe !== undefined && { subscribed: subscribe.toString() }),
      });

      const response = await axios.post(`${baseUrl}?${params.toString()}`);

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
        message: `Successfully created list "${name}" in board ${boardId}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to create list";
      return {
        success: false,
        error: errorMessage,
        message: `Failed to create list: ${errorMessage}`,
      };
    }
  },
});
