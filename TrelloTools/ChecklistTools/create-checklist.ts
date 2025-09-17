import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const createChecklistSchema = z.object({
  cardId: z.string().describe("The ID of the card to create the checklist in"),
  name: z.string().describe("The name of the checklist"),
  idChecklistSource: z
    .string()
    .optional()
    .describe("ID of a checklist to copy from"),
  pos: z
    .union([z.string(), z.number()])
    .optional()
    .describe(
      "Position of the checklist. 'top', 'bottom', or a positive number"
    ),
});

export const createChecklistTool = tool({
  description:
    "Create a new checklist in a Trello card with specified name and optional settings",
  parameters: createChecklistSchema,
  execute: async ({ cardId, name, idChecklistSource, pos }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = "https://api.trello.com/1/checklists";
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        idCard: cardId,
        name,
        ...(idChecklistSource && { idChecklistSource }),
        ...(pos !== undefined && { pos: pos.toString() }),
      });

      const response = await axios.post(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        checklist: {
          id: response.data.id,
          name: response.data.name,
          cardId: response.data.idCard,
          boardId: response.data.idBoard,
          pos: response.data.pos,
          checkItems: response.data.checkItems || [],
        },
        message: `Successfully created checklist "${name}" in card ${cardId}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to create checklist";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to create checklist "${name}". ${errorMessage}`,
      };
    }
  },
});
