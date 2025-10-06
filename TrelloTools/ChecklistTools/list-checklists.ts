import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const listChecklistsSchema = z.object({
  cardId: z.string().describe("The ID of the card to list checklists from"),
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

export const listChecklistsTool = tool({
  description:
    "List all checklists on a Trello card with optional filtering and field selection",
  inputSchema: listChecklistsSchema,
  execute: async ({ cardId, fields, checkItems, checkItemFields }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = `https://api.trello.com/1/cards/${cardId}/checklists`;
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
        checklists: response.data,
        count: response.data.length,
        message: `Successfully retrieved ${response.data.length} checklists from card ${cardId}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to list checklists";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to list checklists for card "${cardId}". ${errorMessage}`,
      };
    }
  },
});
