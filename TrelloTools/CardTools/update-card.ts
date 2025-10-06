import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const updateCardSchema = z.object({
  cardId: z.string().describe("The ID of the card to update"),
  name: z.string().optional().describe("New name for the card"),
  desc: z.string().optional().describe("New description for the card"),
  closed: z.boolean().optional().describe("Whether the card should be closed"),
  idList: z.string().optional().describe("ID of the list to move the card to"),
  idBoard: z
    .string()
    .optional()
    .describe("ID of the board to move the card to"),
  pos: z
    .union([z.string(), z.number()])
    .optional()
    .describe("New position of the card"),
  due: z
    .string()
    .optional()
    .describe("New due date for the card (ISO 8601 format)"),
  dueComplete: z
    .boolean()
    .optional()
    .describe("Whether the card is marked as complete"),
  start: z
    .string()
    .optional()
    .describe("New start date for the card (ISO 8601 format)"),
  idLabels: z
    .array(z.string())
    .optional()
    .describe("Array of label IDs to set on the card"),
  idMembers: z
    .array(z.string())
    .optional()
    .describe("Array of member IDs to set on the card"),
  idAttachmentCover: z
    .string()
    .optional()
    .describe("ID of the attachment to use as cover"),
  keepFromSource: z
    .union([
      z.literal("all"),
      z.literal("attachments"),
      z.literal("checklists"),
      z.literal("comments"),
      z.literal("customFields"),
      z.literal("labels"),
      z.literal("members"),
      z.literal("stickers"),
    ])
    .optional()
    .describe("What to keep from the source when moving"),
  address: z.string().optional().describe("New address for the card location"),
  locationName: z.string().optional().describe("New name of the location"),
  coordinates: z
    .string()
    .optional()
    .describe("New coordinates for the card location (latitude,longitude)"),
  subscribed: z
    .boolean()
    .optional()
    .describe("Whether to subscribe to the card"),
});

export const updateCardTool = tool({
  description:
    "Update an existing Trello card with new name, description, position, or other settings",
  inputSchema: updateCardSchema,
  execute: async ({
    cardId,
    name,
    desc,
    closed,
    idList,
    idBoard,
    pos,
    due,
    dueComplete,
    start,
    idLabels,
    idMembers,
    idAttachmentCover,
    keepFromSource,
    address,
    locationName,
    coordinates,
    subscribed,
  }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = `https://api.trello.com/1/cards/${cardId}`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        ...(name && { name }),
        ...(desc !== undefined && { desc }),
        ...(closed !== undefined && { closed: closed.toString() }),
        ...(idList && { idList }),
        ...(idBoard && { idBoard }),
        ...(pos !== undefined && { pos: pos.toString() }),
        ...(due !== undefined && { due }),
        ...(dueComplete !== undefined && {
          dueComplete: dueComplete.toString(),
        }),
        ...(start !== undefined && { start }),
        ...(idLabels && { idLabels: idLabels.join(",") }),
        ...(idMembers && { idMembers: idMembers.join(",") }),
        ...(idAttachmentCover && { idAttachmentCover }),
        ...(keepFromSource && { keepFromSource }),
        ...(address !== undefined && { address }),
        ...(locationName !== undefined && { locationName }),
        ...(coordinates !== undefined && { coordinates }),
        ...(subscribed !== undefined && { subscribed: subscribed.toString() }),
      });

      const response = await axios.put(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        card: {
          id: response.data.id,
          name: response.data.name,
          description: response.data.desc,
          listId: response.data.idList,
          boardId: response.data.idBoard,
          position: response.data.pos,
          closed: response.data.closed,
          due: response.data.due,
          dueComplete: response.data.dueComplete,
          start: response.data.start,
          url: response.data.url,
          shortUrl: response.data.shortUrl,
          labels: response.data.labels || [],
          members: response.data.members || [],
          attachments: response.data.attachments || [],
          checklists: response.data.checklists || [],
          badges: response.data.badges || {},
          cover: response.data.cover || {},
        },
        message: `Successfully updated card "${response.data.name}"`,
      };
    } catch (error: unknown) {
      console.error("Update card error:", error);

      let errorMessage = "Failed to update card";
      let statusCode = 500;

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string }; status?: number };
        };
        errorMessage = axiosError.response?.data?.message || errorMessage;
        statusCode = axiosError.response?.status || statusCode;
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as { message: string }).message;
      }

      return {
        success: false,
        error: errorMessage,
        statusCode,
        message: `Failed to update card with ID "${cardId}". ${errorMessage}`,
        suggestions: [
          "Check if the card ID is valid and exists",
          "Verify that you have permission to update this card",
          "Ensure all field values are valid",
          "Check if the target list or board exists when moving cards",
        ],
      };
    }
  },
});
