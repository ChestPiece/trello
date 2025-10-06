import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const updateLabelSchema = z.object({
  labelId: z.string().describe("The ID of the label to update"),
  name: z.string().optional().describe("New name for the label"),
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
    .describe("New color for the label"),
});

export const updateLabelTool = tool({
  description: "Update an existing Trello label with new name or color",
  inputSchema: updateLabelSchema,
  execute: async ({ labelId, name, color }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = `https://api.trello.com/1/labels/${labelId}`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        ...(name && { name }),
        ...(color && { color }),
      });

      const response = await axios.put(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        label: {
          id: response.data.id,
          name: response.data.name,
          color: response.data.color,
          boardId: response.data.idBoard,
          uses: response.data.uses,
        },
        message: `Successfully updated label "${response.data.name}" (ID: ${labelId})`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to update label";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to update label with ID "${labelId}". ${errorMessage}`,
      };
    }
  },
});
