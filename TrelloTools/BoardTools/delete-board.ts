import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const deleteBoardSchema = z.object({
  boardId: z.string().describe("The ID of the board to delete"),
});

export const deleteBoardTool = tool({
  description:
    "Delete a Trello board permanently. This action cannot be undone.",
  parameters: deleteBoardSchema,
  execute: async ({ boardId }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = `https://api.trello.com/1/boards/${boardId}`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
      });

      const response = await axios.delete(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        message: `Successfully deleted board with ID: ${boardId}`,
        deletedBoard: {
          id: boardId,
          name: response.data?.name || "Unknown",
          deleted: true,
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to delete board";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to delete board with ID "${boardId}". ${errorMessage}`,
      };
    }
  },
});
