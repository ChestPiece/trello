import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const getBoardSchema = z.object({
  boardId: z.string().describe("The ID of the board to retrieve"),
  fields: z
    .array(z.string())
    .optional()
    .describe(
      "Specific fields to return (e.g., name,desc,closed,idOrganization)"
    ),
  actions: z
    .string()
    .optional()
    .describe(
      "Actions to include (e.g., all, addAttachmentToCard, addChecklistToCard)"
    ),
  actionFields: z
    .array(z.string())
    .optional()
    .describe("Fields for actions to return"),
  actionsLimit: z
    .number()
    .optional()
    .describe("Maximum number of actions to return"),
  actionSince: z
    .string()
    .optional()
    .describe("Filter actions since this date (ISO 8601)"),
  actionBefore: z
    .string()
    .optional()
    .describe("Filter actions before this date (ISO 8601)"),
  cards: z
    .string()
    .optional()
    .describe("Cards to include (e.g., all, closed, none, open, visible)"),
  cardFields: z
    .array(z.string())
    .optional()
    .describe("Fields for cards to return"),
  cardAttachments: z
    .boolean()
    .optional()
    .describe("Whether to include card attachments"),
  cardAttachmentFields: z
    .array(z.string())
    .optional()
    .describe("Fields for card attachments"),
  cardChecklists: z
    .string()
    .optional()
    .describe("Checklists to include (e.g., all, none)"),
  cardStickers: z
    .boolean()
    .optional()
    .describe("Whether to include card stickers"),
  cardStickerFields: z
    .array(z.string())
    .optional()
    .describe("Fields for card stickers"),
  lists: z
    .string()
    .optional()
    .describe("Lists to include (e.g., all, closed, none, open)"),
  listFields: z
    .array(z.string())
    .optional()
    .describe("Fields for lists to return"),
  members: z
    .string()
    .optional()
    .describe("Members to include (e.g., all, none, normal, owners)"),
  memberFields: z
    .array(z.string())
    .optional()
    .describe("Fields for members to return"),
  memberships: z
    .array(z.string())
    .optional()
    .describe(
      "Memberships to include (e.g., all, active, admin, deactivated, me, normal)"
    ),
  membershipsMember: z
    .boolean()
    .optional()
    .describe("Whether to include member data for memberships"),
  membershipsMemberFields: z
    .array(z.string())
    .optional()
    .describe("Fields for membership members"),
  organization: z
    .boolean()
    .optional()
    .describe("Whether to include organization data"),
  organizationFields: z
    .array(z.string())
    .optional()
    .describe("Fields for organization"),
  tags: z.boolean().optional().describe("Whether to include tags"),
  tagFields: z.array(z.string()).optional().describe("Fields for tags"),
});

export const getBoardTool = tool({
  description:
    "Retrieve detailed information about a specific Trello board including cards, lists, members, and other data",
  parameters: getBoardSchema,
  execute: async ({
    boardId,
    fields,
    actions,
    actionFields,
    actionsLimit,
    actionSince,
    actionBefore,
    cards,
    cardFields,
    cardAttachments,
    cardAttachmentFields,
    cardChecklists,
    cardStickers,
    cardStickerFields,
    lists,
    listFields,
    members,
    memberFields,
    memberships,
    membershipsMember,
    membershipsMemberFields,
    organization,
    organizationFields,
    tags,
    tagFields,
  }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = `https://api.trello.com/1/boards/${boardId}`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        ...(fields && { fields: fields.join(",") }),
        ...(actions && { actions }),
        ...(actionFields && { action_fields: actionFields.join(",") }),
        ...(actionsLimit && { actions_limit: actionsLimit.toString() }),
        ...(actionSince && { actions_since: actionSince }),
        ...(actionBefore && { actions_before: actionBefore }),
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
        ...(lists && { lists }),
        ...(listFields && { list_fields: listFields.join(",") }),
        ...(members && { members }),
        ...(memberFields && { member_fields: memberFields.join(",") }),
        ...(memberships && { memberships: memberships.join(",") }),
        ...(membershipsMember !== undefined && {
          memberships_member: membershipsMember.toString(),
        }),
        ...(membershipsMemberFields && {
          memberships_member_fields: membershipsMemberFields.join(","),
        }),
        ...(organization !== undefined && {
          organization: organization.toString(),
        }),
        ...(organizationFields && {
          organization_fields: organizationFields.join(","),
        }),
        ...(tags !== undefined && { tags: tags.toString() }),
        ...(tagFields && { tag_fields: tagFields.join(",") }),
      });

      const response = await axios.get(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        board: response.data,
        message: `Successfully retrieved board "${response.data.name}" (ID: ${boardId})`,
      };
    } catch (error: unknown) {
      console.error("Get board error:", error);

      let errorMessage = "Failed to retrieve board";
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
        message: `Failed to retrieve board with ID "${boardId}". ${errorMessage}`,
        suggestions: [
          "Check if the board ID is valid and exists",
          "Verify that you have permission to access this board",
          "Ensure API credentials are properly configured",
          "Check if the board is not archived or deleted",
        ],
      };
    }
  },
});
