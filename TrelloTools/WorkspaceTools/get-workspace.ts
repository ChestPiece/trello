import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const getWorkspaceSchema = z.object({
  workspaceId: z.string().describe("The ID of the workspace to retrieve"),
  fields: z
    .array(z.string())
    .optional()
    .describe(
      "Specific fields to return (e.g., name,displayName,desc,website,logo)"
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
  boards: z
    .string()
    .optional()
    .describe("Boards to include (e.g., all, closed, none, open, starred)"),
  boardFields: z
    .array(z.string())
    .optional()
    .describe("Fields for boards to return"),
  boardActions: z.string().optional().describe("Board actions to include"),
  boardActionsEntities: z
    .boolean()
    .optional()
    .describe("Whether to include board action entities"),
  boardActionsFormat: z
    .string()
    .optional()
    .describe("Format for board actions (e.g., count, list, minimal)"),
  boardActionsSince: z
    .string()
    .optional()
    .describe("Filter board actions since this date (ISO 8601)"),
  boardActionsLimit: z
    .number()
    .optional()
    .describe("Maximum number of board actions to return"),
  boardLists: z
    .string()
    .optional()
    .describe("Board lists to include (e.g., all, closed, none, open)"),
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
  paidAccount: z
    .boolean()
    .optional()
    .describe("Whether to include paid account information"),
});

export const getWorkspaceTool = tool({
  description:
    "Retrieve detailed information about a specific Trello workspace including boards, members, actions, and other data",
  parameters: getWorkspaceSchema,
  execute: async ({
    workspaceId,
    fields,
    actions,
    actionFields,
    actionsLimit,
    actionSince,
    actionBefore,
    boards,
    boardFields,
    boardActions,
    boardActionsEntities,
    boardActionsFormat,
    boardActionsSince,
    boardActionsLimit,
    boardLists,
    members,
    memberFields,
    memberships,
    membershipsMember,
    membershipsMemberFields,
    paidAccount,
  }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = `https://api.trello.com/1/organizations/${workspaceId}`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        ...(fields && { fields: fields.join(",") }),
        ...(actions && { actions }),
        ...(actionFields && { action_fields: actionFields.join(",") }),
        ...(actionsLimit && { actions_limit: actionsLimit.toString() }),
        ...(actionSince && { actions_since: actionSince }),
        ...(actionBefore && { actions_before: actionBefore }),
        ...(boards && { boards }),
        ...(boardFields && { board_fields: boardFields.join(",") }),
        ...(boardActions && { board_actions: boardActions }),
        ...(boardActionsEntities !== undefined && {
          board_actions_entities: boardActionsEntities.toString(),
        }),
        ...(boardActionsFormat && { board_actions_format: boardActionsFormat }),
        ...(boardActionsSince && { board_actions_since: boardActionsSince }),
        ...(boardActionsLimit && {
          board_actions_limit: boardActionsLimit.toString(),
        }),
        ...(boardLists && { board_lists: boardLists }),
        ...(members && { members }),
        ...(memberFields && { member_fields: memberFields.join(",") }),
        ...(memberships && { memberships: memberships.join(",") }),
        ...(membershipsMember !== undefined && {
          memberships_member: membershipsMember.toString(),
        }),
        ...(membershipsMemberFields && {
          memberships_member_fields: membershipsMemberFields.join(","),
        }),
        ...(paidAccount !== undefined && {
          paid_account: paidAccount.toString(),
        }),
      });

      const response = await axios.get(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        workspace: response.data,
        message: `Successfully retrieved workspace "${
          response.data.displayName || response.data.name
        }" (ID: ${workspaceId})`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to retrieve workspace";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to retrieve workspace with ID "${workspaceId}". ${errorMessage}`,
      };
    }
  },
});
