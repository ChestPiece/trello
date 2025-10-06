import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const deleteLabelSchema = z.object({
  labelId: z.string().describe("The ID of the label to delete"),
});

export const deleteLabelTool = tool({
  description:
    "Delete a Trello label permanently. This action cannot be undone.",
  inputSchema: deleteLabelSchema,
  execute: async ({ labelId }) => {
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
      });

      const response = await axios.delete(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        message: `Successfully deleted label with ID: ${labelId}`,
        deletedLabel: {
          id: labelId,
          deleted: true,
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to delete label";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to delete label with ID "${labelId}". ${errorMessage}`,
      };
    }
  },
});
