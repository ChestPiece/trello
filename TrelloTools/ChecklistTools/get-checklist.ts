import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const getChecklistSchema = z.object({
  checklistId: z.string().describe("The ID of the checklist to retrieve"),
  fields: z
    .array(z.string())
    .optional()
    .describe("Specific fields to return (e.g., name,idCard,idBoard)"),
  checkItems: z
    .enum(["all", "none"])
    .optional()
    .describe("Whether to include check items"),
  checkItemFields: z
    .array(z.string())
    .optional()
    .describe("Fields for check items to return"),
});

export const getChecklistTool = tool({
  description:
    "Retrieve detailed information about a specific Trello checklist",
  inputSchema: getChecklistSchema,
  execute: async ({ checklistId, fields, checkItems, checkItemFields }) => {
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
        ...(fields && { fields: fields.join(",") }),
        ...(checkItems && { checkItems }),
        ...(checkItemFields && { checkItem_fields: checkItemFields.join(",") }),
      });

      const response = await axios.get(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        checklist: response.data,
        message: `Successfully retrieved checklist "${response.data.name}" (ID: ${checklistId})`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to retrieve checklist";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to retrieve checklist with ID "${checklistId}". ${errorMessage}`,
      };
    }
  },
});
