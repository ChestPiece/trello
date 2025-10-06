import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const createChecklistItemSchema = z.object({
  checklistId: z
    .string()
    .describe("The ID of the checklist to add the item to"),
  name: z.string().describe("The name of the checklist item"),
  pos: z
    .union([z.string(), z.number()])
    .optional()
    .describe("Position of the item. 'top', 'bottom', or a positive number"),
  checked: z.boolean().optional().describe("Whether the item is checked"),
  due: z
    .string()
    .optional()
    .describe("Due date for the item (ISO 8601 format)"),
  dueReminder: z.number().optional().describe("Due reminder in minutes"),
});

export const createChecklistItemTool = tool({
  description:
    "Create a new item in a Trello checklist with specified name and optional settings",
  inputSchema: createChecklistItemSchema,
  execute: async ({ checklistId, name, pos, checked, due, dueReminder }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = `https://api.trello.com/1/checklists/${checklistId}/checkItems`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        name,
        ...(pos !== undefined && { pos: pos.toString() }),
        ...(checked !== undefined && { checked: checked.toString() }),
        ...(due && { due }),
        ...(dueReminder && { dueReminder: dueReminder.toString() }),
      });

      const response = await axios.post(`${baseUrl}?${params.toString()}`);

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
        message: `Successfully created checklist item "${name}" in checklist ${checklistId}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to create checklist item";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to create checklist item "${name}". ${errorMessage}`,
      };
    }
  },
});
