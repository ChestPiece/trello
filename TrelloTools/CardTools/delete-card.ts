import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const deleteCardSchema = z.object({
  cardId: z.string().describe("The ID of the card to delete"),
});

export const deleteCardTool = tool({
  description:
    "Delete a Trello card permanently. This action cannot be undone.",
  parameters: deleteCardSchema,
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
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to delete card";
      return {
        success: false,
        error: errorMessage,
        message: `Failed to delete card: ${errorMessage}`,
      };
    }
  },
});

