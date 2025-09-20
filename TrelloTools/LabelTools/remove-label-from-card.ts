import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const removeLabelFromCardSchema = z.object({
  cardId: z.string().describe("The ID of the card to remove the label from"),
  labelId: z.string().describe("The ID of the label to remove from the card"),
});

export const removeLabelFromCardTool = tool({
  description:
    "Remove a specific label from a Trello card. The label must be currently attached to the card.",
  parameters: removeLabelFromCardSchema,
  execute: async ({ cardId, labelId }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = `https://api.trello.com/1/cards/${cardId}/idLabels/${labelId}`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
      });

      const response = await axios.delete(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        cardId,
        labelId,
        message: `Successfully removed label ${labelId} from card ${cardId}`,
        removed: true,
      };
    } catch (error: unknown) {
      console.error("Remove label from card error:", error);

      let errorMessage = "Failed to remove label from card";
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
        message: `Failed to remove label ${labelId} from card ${cardId}. ${errorMessage}`,
        suggestions: [
          "Check if the card ID is valid and exists",
          "Verify that the label ID is valid and exists",
          "Ensure the label is currently attached to the card",
          "Check if you have permission to modify this card",
          "Verify that the label hasn't already been removed from the card",
          "Ensure API credentials are properly configured",
        ],
      };
    }
  },
});
