import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const getCardSchema = z.object({
  cardId: z.string().describe("The ID of the card to retrieve"),
  fields: z
    .array(z.string())
    .optional()
    .describe("Fields to return for the card"),
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

export const getCardTool = tool({
  description:
    "Retrieve detailed information about a specific Trello card including attachments, members, checklists, and other data",
  parameters: getCardSchema,
  execute: async ({
    cardId,
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

      const baseUrl = `https://api.trello.com/1/cards/${cardId}`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
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
          actions: response.data.actions || [],
          checkItemStates: response.data.checkItemStates || [],
          stickers: response.data.stickers || [],
          customFieldItems: response.data.customFieldItems || [],
        },
        message: `Successfully retrieved card "${response.data.name}"`,
      };
    } catch (error: unknown) {
      console.error("Get card error:", error);

      let errorMessage = "Failed to retrieve card";
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
        message: `Failed to retrieve card with ID "${cardId}". ${errorMessage}`,
        suggestions: [
          "Check if the card ID is valid and exists",
          "Verify that you have permission to access this card",
          "Ensure API credentials are properly configured",
          "Check if the card is not archived or deleted",
        ],
      };
    }
  },
});
