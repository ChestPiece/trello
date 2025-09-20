import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const createLabelSchema = z.object({
  boardId: z.string().describe("The ID of the board to create the label in"),
  name: z.string().describe("The name of the label"),
  color: z
    .enum([
      "yellow",
      "purple",
      "blue",
      "red",
      "green",
      "orange",
      "black",
      "sky",
      "pink",
      "lime",
    ])
    .describe("The color of the label"),
  listId: z
    .string()
    .optional()
    .describe("Optional ID of the list to associate the label with"),
  cardId: z
    .string()
    .optional()
    .describe("Optional ID of the card to add the label to immediately"),
});

export const createLabelTool = tool({
  description:
    "Create a new label in a Trello board with specified name and color. Optionally associate with a specific list or add to a specific card immediately.",
  parameters: createLabelSchema,
  execute: async ({ boardId, name, color, listId: _listId, cardId }) => {
    // Note: listId is not used as Trello labels are board-level, not list-level
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = "https://api.trello.com/1/labels";
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        idBoard: boardId,
        name,
        color,
      });

      const response = await axios.post(`${baseUrl}?${params.toString()}`);

      const labelData = {
        id: response.data.id,
        name: response.data.name,
        color: response.data.color,
        boardId: response.data.idBoard,
        uses: response.data.uses,
      };

      const additionalActions: string[] = [];

      // If cardId is provided, add the label to the card immediately
      if (cardId) {
        try {
          const addLabelUrl = `https://api.trello.com/1/cards/${cardId}/idLabels`;
          const addLabelParams = new URLSearchParams({
            key: apiKey,
            token: apiToken,
            value: response.data.id,
          });

          await axios.post(`${addLabelUrl}?${addLabelParams.toString()}`);
          additionalActions.push(`Added label to card ${cardId}`);
        } catch (cardError) {
          console.warn("Failed to add label to card:", cardError);
          additionalActions.push(
            `Warning: Could not add label to card ${cardId}`
          );
        }
      }

      return {
        success: true,
        label: labelData,
        message: `Successfully created label "${name}" with color ${color} in board ${boardId}${
          additionalActions.length > 0
            ? `. ${additionalActions.join(", ")}`
            : ""
        }`,
        additionalActions,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to create label";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to create label "${name}". ${errorMessage}`,
      };
    }
  },
});
