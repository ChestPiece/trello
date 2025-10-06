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
      console.error("Delete board error:", error);

      let errorMessage = "Failed to delete board";
      let statusCode = 500;

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string }; status?: number };
        };
        errorMessage = axiosError.response?.data?.message || errorMessage;
        statusCode = axiosError.response?.status || statusCode;
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as { message: string }).message;
      }

      return {
        success: false,
        error: errorMessage,
        statusCode,
        message: `Failed to delete board with ID "${boardId}". ${errorMessage}`,
        suggestions: [
          "Check if the board ID is valid and exists",
          "Verify that you have permission to delete this board",
          "Ensure API credentials are properly configured",
          "Check if the board is not locked or protected",
        ],
      };
    }
  },
});
