import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const addLabelToCardSchema = z.object({
  cardId: z.string().describe("The ID of the card to add the label to"),
  labelId: z.string().describe("The ID of the label to add to the card"),
});

export const addLabelToCardTool = tool({
  description:
    "Add a specific label to a Trello card. The label must exist in the same board as the card.",
  parameters: addLabelToCardSchema,
  execute: async ({ cardId, labelId }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = `https://api.trello.com/1/cards/${cardId}/idLabels`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        value: labelId,
      });

      const response = await axios.post(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        cardId,
        labelId,
        message: `Successfully added label ${labelId} to card ${cardId}`,
        label: response.data,
      };
    } catch (error: unknown) {
      console.error("Add label to card error:", error);

      let errorMessage = "Failed to add label to card";
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
        message: `Failed to add label ${labelId} to card ${cardId}. ${errorMessage}`,
        suggestions: [
          "Check if the card ID is valid and exists",
          "Verify that the label ID is valid and exists",
          "Ensure the label and card are in the same board",
          "Check if you have permission to modify this card",
          "Verify that the label hasn't already been added to the card",
          "Ensure API credentials are properly configured",
        ],
      };
    }
  },
});
