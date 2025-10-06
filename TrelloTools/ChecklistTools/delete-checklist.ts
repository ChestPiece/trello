import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const deleteChecklistSchema = z.object({
  checklistId: z.string().describe("The ID of the checklist to delete"),
});

export const deleteChecklistTool = tool({
  description:
    "Delete a Trello checklist permanently. This action cannot be undone.",
  inputSchema: deleteChecklistSchema,
  execute: async ({ checklistId }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = `https://api.trello.com/1/checklists/${checklistId}`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
      });

      const response = await axios.delete(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        message: `Successfully deleted checklist with ID: ${checklistId}`,
        deletedChecklist: {
          id: checklistId,
          deleted: true,
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to delete checklist";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to delete checklist with ID "${checklistId}". ${errorMessage}`,
      };
    }
  },
});
