import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const deleteCardSchema = z.object({
  cardId: z.string().describe("The ID of the card to delete"),
});

export const deleteCardTool = tool({
  description:
    "Delete a Trello card permanently. This action cannot be undone.",
  inputSchema: deleteCardSchema,
  execute: async ({ cardId }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = `https://api.trello.com/1/cards/${cardId}`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
      });

      const response = await axios.delete(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        message: `Successfully deleted card ${cardId}`,
        cardId: cardId,
      };
    } catch (error: unknown) {
      console.error("Delete card error:", error);

      let errorMessage = "Failed to delete card";
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
        message: `Failed to delete card with ID "${cardId}". ${errorMessage}`,
        suggestions: [
          "Check if the card ID is valid and exists",
          "Verify that you have permission to delete this card",
          "Ensure API credentials are properly configured",
          "Check if the card is not locked or protected",
        ],
      };
    }
  },
});
