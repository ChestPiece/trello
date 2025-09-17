import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const listListsSchema = z.object({
  boardId: z.string().describe("The ID of the board to get lists from"),
  filter: z
    .union([
      z.literal("all"),
      z.literal("closed"),
      z.literal("none"),
      z.literal("open"),
      z.literal("visible"),
    ])
    .optional()
    .describe("Filter for lists to return"),
  fields: z.array(z.string()).optional().describe("Fields to return for lists"),
  cards: z
    .union([
      z.literal("all"),
      z.literal("closed"),
      z.literal("none"),
      z.literal("open"),
      z.literal("visible"),
    ])
    .optional()
    .describe("Filter for cards in the lists"),
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
});

type TrelloListResponse = {
  id: string;
  name: string;
  closed: boolean;
  idBoard: string;
  pos: number;
  subscribed: boolean;
  softLimit?: any;
  status?: string;
  creationMethod?: string;
  cards?: any[];
};

export const listListsTool = tool({
  description:
    "List all lists in a Trello board with optional filtering and field selection",
  parameters: listListsSchema,
  execute: async ({
    boardId,
    filter = "all",
    fields,
    cards,
    cardFields,
    cardAttachments,
    cardAttachmentFields,
    cardChecklists,
    cardStickers,
    cardStickerFields,
  }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = `https://api.trello.com/1/boards/${boardId}/lists`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        filter,
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
      });

      const response = await axios.get(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        lists: response.data.map((list: TrelloListResponse) => ({
          id: list.id,
          name: list.name,
          closed: list.closed,
          boardId: list.idBoard,
          position: list.pos,
          subscribed: list.subscribed,
          softLimit: list.softLimit,
          status: list.status,
          creationMethod: list.creationMethod,
          cards: list.cards || [],
        })),
        count: response.data.length,
        message: `Successfully retrieved ${response.data.length} list(s) from board ${boardId}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to retrieve lists";
      return {
        success: false,
        error: errorMessage,
        message: `Failed to retrieve lists: ${errorMessage}`,
      };
    }
  },
});
