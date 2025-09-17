import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const createLabelSchema = z.object({
  boardId: z.string().describe("The ID of the board to create the label in"),
  name: z.string().describe("The name of the label"),
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
    .describe("The color of the label"),
});

export const createLabelTool = tool({
  description:
    "Create a new label in a Trello board with specified name and color",
  parameters: createLabelSchema,
  execute: async ({ boardId, name, color }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = "https://api.trello.com/1/labels";
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        idBoard: boardId,
        name,
        color,
      });

      const response = await axios.post(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        label: {
          id: response.data.id,
          name: response.data.name,
          color: response.data.color,
          boardId: response.data.idBoard,
          uses: response.data.uses,
        },
        message: `Successfully created label "${name}" with color ${color} in board ${boardId}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to create label";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to create label "${name}". ${errorMessage}`,
      };
    }
  },
});
