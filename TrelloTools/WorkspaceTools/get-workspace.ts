import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const getWorkspaceSchema = z.object({
  workspaceId: z.string().describe("The ID of the workspace to retrieve"),
  fields: z
    .array(z.string())
    .nullable()
    .describe(
      "Specific fields to return (e.g., name,displayName,desc,website,logo)"
    ),
  actions: z
    .string()
    .nullable()
    .describe(
      "Actions to include (e.g., all, addAttachmentToCard, addChecklistToCard)"
    ),
  actionFields: z
    .array(z.string())
    .nullable()
    .describe("Fields for actions to return"),
  actionsLimit: z
    .number()
    .nullable()
    .describe("Maximum number of actions to return"),
  actionSince: z
    .string()
    .nullable()
    .describe("Filter actions since this date (ISO 8601)"),
  actionBefore: z
    .string()
    .nullable()
    .describe("Filter actions before this date (ISO 8601)"),
  boards: z
    .string()
    .nullable()
    .describe("Boards to include (e.g., all, closed, none, open, starred)"),
  boardFields: z
    .array(z.string())
    .nullable()
    .describe("Fields for boards to return"),
  boardActions: z.string().nullable().describe("Board actions to include"),
  boardActionsEntities: z
    .boolean()
    .nullable()
    .describe("Whether to include board action entities"),
  boardActionsFormat: z
    .string()
    .nullable()
    .describe("Format for board actions (e.g., count, list, minimal)"),
  boardActionsSince: z
    .string()
    .nullable()
    .describe("Filter board actions since this date (ISO 8601)"),
  boardActionsLimit: z
    .number()
    .nullable()
    .describe("Maximum number of board actions to return"),
  boardLists: z
    .string()
    .nullable()
    .describe("Board lists to include (e.g., all, closed, none, open)"),
  members: z
    .string()
    .nullable()
    .describe("Members to include (e.g., all, none, normal, owners)"),
  memberFields: z
    .array(z.string())
    .nullable()
    .describe("Fields for members to return"),
  memberships: z
    .array(z.string())
    .nullable()
    .describe(
      "Memberships to include (e.g., all, active, admin, deactivated, me, normal)"
    ),
  membershipsMember: z
    .boolean()
    .nullable()
    .describe("Whether to include member data for memberships"),
  membershipsMemberFields: z
    .array(z.string())
    .nullable()
    .describe("Fields for membership members"),
  paidAccount: z
    .boolean()
    .nullable()
    .describe("Whether to include paid account information"),
});

export const getWorkspaceTool = tool({
  description:
    "Retrieve detailed information about a specific Trello workspace including boards, members, actions, and other data",
  inputSchema: getWorkspaceSchema,

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
  }: {
    workspaceId: string;
    fields?: string[];
    actions?: string;
    actionFields?: string[];
    actionsLimit?: number;
    actionSince?: string;
    actionBefore?: string;
    boards?: string;
    boardFields?: string[];
    boardActions?: string;
    boardActionsEntities?: boolean;
    boardActionsFormat?: string;
    boardActionsSince?: string;
    boardActionsLimit?: number;
    boardLists?: string;
    members?: string;
    memberFields?: string[];
    memberships?: string[];
    membershipsMember?: boolean;
    membershipsMemberFields?: string[];
    paidAccount?: boolean;
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
