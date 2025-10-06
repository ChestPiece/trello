import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const deleteChecklistItemSchema = z.object({
  checklistId: z
    .string()
    .describe("The ID of the checklist containing the item"),
  checkItemId: z.string().describe("The ID of the checklist item to delete"),
});

export const deleteChecklistItemTool = tool({
  description:
    "Delete a Trello checklist item permanently. This action cannot be undone.",
  inputSchema: deleteChecklistItemSchema,
  execute: async ({ checklistId, checkItemId }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = `https://api.trello.com/1/checklists/${checklistId}/checkItems/${checkItemId}`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
      });

      const response = await axios.delete(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        message: `Successfully deleted checklist item with ID: ${checkItemId}`,
        deletedCheckItem: {
          id: checkItemId,
          checklistId,
          deleted: true,
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to delete checklist item";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to delete checklist item with ID "${checkItemId}". ${errorMessage}`,
      };
    }
  },
});
