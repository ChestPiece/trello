import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const archiveListSchema = z.object({
  listId: z.string().describe("The ID of the list to archive"),
  archiveAllCards: z
    .boolean()
    .optional()
    .describe("Whether to archive all cards in the list as well"),
});

export const archiveListTool = {
  description:
    "Archive a Trello list. This closes the list and optionally archives all cards within it. Archived lists can be restored later.",
  inputSchema: archiveListSchema,

  execute: async ({
    listId,
    archiveAllCards = false,
  }: {
    listId: string;
    archiveAllCards?: boolean;
  }) => {
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
        closed: "true",
        ...(archiveAllCards && { archiveAllCards: archiveAllCards.toString() }),
      });

      const response = await axios.put(`${baseUrl}?${params.toString()}`);

      // Return the archived list data directly for UI components
      return {
        id: response.data.id,
        name: response.data.name,
        closed: response.data.closed,
        boardId: response.data.idBoard,
        position: response.data.pos,
        subscribed: response.data.subscribed,
        softLimit: response.data.softLimit,
        status: response.data.status,
        creationMethod: response.data.creationMethod,
        archived: true,
        message: `Successfully archived list "${response.data.name}"${
          archiveAllCards ? " and all its cards" : ""
        }`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to archive list";
      throw new Error(`Failed to archive list: ${errorMessage}`);
    }
  },
};
