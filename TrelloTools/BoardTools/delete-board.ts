import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const deleteBoardSchema = z.object({
  boardId: z.string().describe("The ID of the board to delete"),
});

export const deleteBoardTool = {
  description:
    "Delete a Trello board permanently. This action cannot be undone.",
  inputSchema: deleteBoardSchema,

  execute: async ({ boardId }: { boardId: string }) => {
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

      // Return the deleted board data directly for UI components
      return {
        id: boardId,
        name: response.data?.name || "Unknown",
        deleted: true,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to delete board";

      throw new Error(
        `Failed to delete board with ID "${boardId}": ${errorMessage}`
      );
    }
  },
};
