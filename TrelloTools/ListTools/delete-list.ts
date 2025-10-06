import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const deleteListSchema = z.object({
  listId: z.string().describe("The ID of the list to delete"),
  archiveAllCards: z
    .boolean()
    .optional()
    .describe("Whether to archive all cards in the list before deleting"),
});

export const deleteListTool = tool({
  description:
    "Delete a Trello list permanently. Optionally archive all cards in the list first.",
  inputSchema: deleteListSchema,
  execute: async ({ listId, archiveAllCards = false }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = `https://api.trello.com/1/lists/${listId}`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        ...(archiveAllCards && { archiveAllCards: archiveAllCards.toString() }),
      });

      const response = await axios.put(
        `${baseUrl}/closed?${params.toString()}`
      );

      // Note: Trello doesn't actually delete lists, it closes them
      // To truly delete, we need to close the list first, then delete it
      if (response.data.closed) {
        // Now delete the closed list
        const deleteResponse = await axios.delete(
          `${baseUrl}?${params.toString()}`
        );

        return {
          success: true,
          message: `Successfully deleted list ${listId}${
            archiveAllCards ? " and archived all cards" : ""
          }`,
          listId: listId,
        };
      } else {
        return {
          success: false,
          error: "Failed to close list before deletion",
          message: "Failed to delete list: Could not close the list first",
        };
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to delete list";
      return {
        success: false,
        error: errorMessage,
        message: `Failed to delete list: ${errorMessage}`,
      };
    }
  },
});
