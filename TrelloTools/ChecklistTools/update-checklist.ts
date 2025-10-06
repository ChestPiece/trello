import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const updateChecklistSchema = z.object({
  checklistId: z.string().describe("The ID of the checklist to update"),
  name: z.string().optional().describe("New name for the checklist"),
  pos: z
    .union([z.string(), z.number()])
    .optional()
    .describe("New position of the checklist"),
});

export const updateChecklistTool = tool({
  description: "Update an existing Trello checklist with new name or position",
  inputSchema: updateChecklistSchema,
  execute: async ({ checklistId, name, pos }) => {
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
        ...(name && { name }),
        ...(pos !== undefined && { pos: pos.toString() }),
      });

      const response = await axios.put(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        checklist: {
          id: response.data.id,
          name: response.data.name,
          cardId: response.data.idCard,
          boardId: response.data.idBoard,
          pos: response.data.pos,
        },
        message: `Successfully updated checklist "${response.data.name}" (ID: ${checklistId})`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to update checklist";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to update checklist with ID "${checklistId}". ${errorMessage}`,
      };
    }
  },
});
