import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const updateChecklistItemSchema = z.object({
  checklistId: z
    .string()
    .describe("The ID of the checklist containing the item"),
  checkItemId: z.string().describe("The ID of the checklist item to update"),
  name: z.string().optional().describe("New name for the item"),
  state: z
    .enum(["complete", "incomplete"])
    .optional()
    .describe("New state of the item"),
  pos: z
    .union([z.string(), z.number()])
    .optional()
    .describe("New position of the item"),
  due: z
    .string()
    .optional()
    .describe("New due date for the item (ISO 8601 format)"),
  dueReminder: z.number().optional().describe("New due reminder in minutes"),
});

export const updateChecklistItemTool = tool({
  description: "Update an existing Trello checklist item with new properties",
  parameters: updateChecklistItemSchema,
  execute: async ({
    checklistId,
    checkItemId,
    name,
    state,
    pos,
    due,
    dueReminder,
  }) => {
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
        ...(name && { name }),
        ...(state && { state }),
        ...(pos !== undefined && { pos: pos.toString() }),
        ...(due && { due }),
        ...(dueReminder && { dueReminder: dueReminder.toString() }),
      });

      const response = await axios.put(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        checkItem: {
          id: response.data.id,
          name: response.data.name,
          state: response.data.state,
          pos: response.data.pos,
          due: response.data.due,
          dueReminder: response.data.dueReminder,
          idMember: response.data.idMember,
        },
        message: `Successfully updated checklist item "${response.data.name}" (ID: ${checkItemId})`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to update checklist item";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to update checklist item with ID "${checkItemId}". ${errorMessage}`,
      };
    }
  },
});
