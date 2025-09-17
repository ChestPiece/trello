import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const listCardsSchema = z.object({
  boardId: z
    .string()
    .optional()
    .describe("The ID of the board to get cards from"),
  listId: z
    .string()
    .optional()
    .describe("The ID of the list to get cards from"),
  filter: z
    .union([
      z.literal("all"),
      z.literal("closed"),
      z.literal("none"),
      z.literal("open"),
      z.literal("visible"),
    ])
    .optional()
    .describe("Filter for cards to return"),
  fields: z.array(z.string()).optional().describe("Fields to return for cards"),
  actions: z
    .union([
      z.literal("all"),
      z.literal("addAttachmentToCard"),
      z.literal("addChecklistToCard"),
      z.literal("addMemberToBoard"),
      z.literal("addMemberToCard"),
      z.literal("addMemberToOrganization"),
      z.literal("addToOrganizationBoard"),
      z.literal("commentCard"),
      z.literal("convertToCardFromCheckItem"),
      z.literal("copyCard"),
      z.literal("createCard"),
      z.literal("createCheckItem"),
      z.literal("createList"),
      z.literal("createOrganization"),
      z.literal("deleteAttachmentFromCard"),
      z.literal("deleteCard"),
      z.literal("deleteCheckItem"),
      z.literal("deleteComment"),
      z.literal("deleteOrganizationInvitation"),
      z.literal("disablePowerUp"),
      z.literal("emailCard"),
      z.literal("enablePowerUp"),
      z.literal("makeAdminOfBoard"),
      z.literal("makeNormalMemberOfBoard"),
      z.literal("makeNormalMemberOfOrganization"),
      z.literal("makeObserverOfBoard"),
      z.literal("memberJoinedTrello"),
      z.literal("moveCardFromBoard"),
      z.literal("moveCardToBoard"),
      z.literal("removeChecklistFromCard"),
      z.literal("removeFromOrganizationBoard"),
      z.literal("removeMemberFromCard"),
      z.literal("unconfirmedCard"),
      z.literal("updateBoard"),
      z.literal("updateCard"),
      z.literal("updateCheckItem"),
      z.literal("updateCheckItemStateOnCard"),
      z.literal("updateChecklist"),
      z.literal("updateList"),
      z.literal("updateMember"),
      z.literal("updateOrganization"),
      z.literal("updateOrganizationInvitation"),
    ])
    .optional()
    .describe("Filter for actions to return"),
  actionFields: z
    .array(z.string())
    .optional()
    .describe("Fields to return for actions"),
  actionsLimit: z
    .number()
    .optional()
    .describe("Limit the number of actions returned"),
  actionSince: z
    .string()
    .optional()
    .describe("Filter actions since this date (ISO 8601 format)"),
  actionBefore: z
    .string()
    .optional()
    .describe("Filter actions before this date (ISO 8601 format)"),
  attachments: z
    .boolean()
    .optional()
    .describe("Whether to include attachments"),
  attachmentFields: z
    .array(z.string())
    .optional()
    .describe("Fields to return for attachments"),
  members: z.boolean().optional().describe("Whether to include members"),
  memberFields: z
    .array(z.string())
    .optional()
    .describe("Fields to return for members"),
  membersVoted: z
    .boolean()
    .optional()
    .describe("Whether to include members who voted"),
  memberVotedFields: z
    .array(z.string())
    .optional()
    .describe("Fields to return for members who voted"),
  checkItemStates: z
    .boolean()
    .optional()
    .describe("Whether to include check item states"),
  checkItemStateFields: z
    .array(z.string())
    .optional()
    .describe("Fields to return for check item states"),
  checklists: z
    .union([z.literal("all"), z.literal("none")])
    .optional()
    .describe("Filter for checklists"),
  checklistFields: z
    .array(z.string())
    .optional()
    .describe("Fields to return for checklists"),
  stickers: z.boolean().optional().describe("Whether to include stickers"),
  stickerFields: z
    .array(z.string())
    .optional()
    .describe("Fields to return for stickers"),
  customFieldItems: z
    .boolean()
    .optional()
    .describe("Whether to include custom field items"),
});

export const listCardsTool = tool({
  description:
    "List all cards in a Trello board or list with optional filtering and field selection",
  parameters: listCardsSchema,
  execute: async ({
    boardId,
    listId,
    filter = "all",
    fields,
    actions,
    actionFields,
    actionsLimit,
    actionSince,
    actionBefore,
    attachments,
    attachmentFields,
    members,
    memberFields,
    membersVoted,
    memberVotedFields,
    checkItemStates,
    checkItemStateFields,
    checklists,
    checklistFields,
    stickers,
    stickerFields,
    customFieldItems,
  }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      let baseUrl: string;
      if (boardId) {
        baseUrl = `https://api.trello.com/1/boards/${boardId}/cards`;
      } else if (listId) {
        baseUrl = `https://api.trello.com/1/lists/${listId}/cards`;
      } else {
        throw new Error("Either boardId or listId must be provided");
      }

      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        filter,
        ...(fields && { fields: fields.join(",") }),
        ...(actions && { actions }),
        ...(actionFields && { action_fields: actionFields.join(",") }),
        ...(actionsLimit && { actions_limit: actionsLimit.toString() }),
        ...(actionSince && { actions_since: actionSince }),
        ...(actionBefore && { actions_before: actionBefore }),
        ...(attachments !== undefined && {
          attachments: attachments.toString(),
        }),
        ...(attachmentFields && {
          attachment_fields: attachmentFields.join(","),
        }),
        ...(members !== undefined && { members: members.toString() }),
        ...(memberFields && { member_fields: memberFields.join(",") }),
        ...(membersVoted !== undefined && {
          membersVoted: membersVoted.toString(),
        }),
        ...(memberVotedFields && {
          member_voted_fields: memberVotedFields.join(","),
        }),
        ...(checkItemStates !== undefined && {
          checkItemStates: checkItemStates.toString(),
        }),
        ...(checkItemStateFields && {
          checkItemState_fields: checkItemStateFields.join(","),
        }),
        ...(checklists && { checklists }),
        ...(checklistFields && { checklist_fields: checklistFields.join(",") }),
        ...(stickers !== undefined && { stickers: stickers.toString() }),
        ...(stickerFields && { sticker_fields: stickerFields.join(",") }),
        ...(customFieldItems !== undefined && {
          customFieldItems: customFieldItems.toString(),
        }),
      });

      const response = await axios.get(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        cards: response.data.map((card: any) => ({
          id: card.id,
          name: card.name,
          description: card.desc,
          listId: card.idList,
          boardId: card.idBoard,
          position: card.pos,
          closed: card.closed,
          due: card.due,
          dueComplete: card.dueComplete,
          start: card.start,
          url: card.url,
          shortUrl: card.shortUrl,
          labels: card.labels || [],
          members: card.members || [],
          attachments: card.attachments || [],
          checklists: card.checklists || [],
          badges: card.badges || {},
          cover: card.cover || {},
          actions: card.actions || [],
          checkItemStates: card.checkItemStates || [],
          stickers: card.stickers || [],
          customFieldItems: card.customFieldItems || [],
        })),
        count: response.data.length,
        message: `Successfully retrieved ${response.data.length} card(s) from ${
          boardId ? `board ${boardId}` : `list ${listId}`
        }`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to retrieve cards";
      return {
        success: false,
        error: errorMessage,
        message: `Failed to retrieve cards: ${errorMessage}`,
      };
    }
  },
});


