import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const getListSchema = z.object({
  listId: z.string().describe("The ID of the list to retrieve"),
  fields: z
    .array(z.string())
    .optional()
    .describe("Fields to return for the list"),
  cards: z
    .union([
      z.literal("all"),
      z.literal("closed"),
      z.literal("none"),
      z.literal("open"),
      z.literal("visible"),
    ])
    .optional()
    .describe("Filter for cards in the list"),
  cardFields: z
    .array(z.string())
    .optional()
    .describe("Fields to return for cards"),
  cardAttachments: z
    .boolean()
    .optional()
    .describe("Whether to include card attachments"),
  cardAttachmentFields: z
    .array(z.string())
    .optional()
    .describe("Fields to return for card attachments"),
  cardChecklists: z
    .union([z.literal("all"), z.literal("none")])
    .optional()
    .describe("Filter for card checklists"),
  cardStickers: z
    .boolean()
    .optional()
    .describe("Whether to include card stickers"),
  cardStickerFields: z
    .array(z.string())
    .optional()
    .describe("Fields to return for card stickers"),
  filter: z
    .union([
      z.literal("all"),
      z.literal("closed"),
      z.literal("none"),
      z.literal("open"),
      z.literal("visible"),
    ])
    .optional()
    .describe("Filter for the list itself"),
});

export const getListTool = tool({
  description:
    "Retrieve detailed information about a specific Trello list including cards and other data",
  parameters: getListSchema,
  execute: async ({
    listId,
    fields,
    cards,
    cardFields,
    cardAttachments,
    cardAttachmentFields,
    cardChecklists,
    cardStickers,
    cardStickerFields,
    filter,
  }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = `https://api.trello.com/1/lists/${listId}`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        ...(fields && { fields: fields.join(",") }),
        ...(cards && { cards }),
        ...(cardFields && { card_fields: cardFields.join(",") }),
        ...(cardAttachments !== undefined && {
          card_attachments: cardAttachments.toString(),
        }),
        ...(cardAttachmentFields && {
          card_attachment_fields: cardAttachmentFields.join(","),
        }),
        ...(cardChecklists && { card_checklists: cardChecklists }),
        ...(cardStickers !== undefined && {
          card_stickers: cardStickers.toString(),
        }),
        ...(cardStickerFields && {
          card_sticker_fields: cardStickerFields.join(","),
        }),
        ...(filter && { filter }),
      });

      const response = await axios.get(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        list: {
          id: response.data.id,
          name: response.data.name,
          closed: response.data.closed,
          boardId: response.data.idBoard,
          position: response.data.pos,
          subscribed: response.data.subscribed,
          softLimit: response.data.softLimit,
          status: response.data.status,
          creationMethod: response.data.creationMethod,
          cards: response.data.cards || [],
        },
        message: `Successfully retrieved list "${response.data.name}"`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to retrieve list";
      return {
        success: false,
        error: errorMessage,
        message: `Failed to retrieve list: ${errorMessage}`,
      };
    }
  },
});
