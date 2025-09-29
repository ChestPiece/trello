import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const getMemberSchema = z.object({
  memberId: z.string().describe("The ID of the member to retrieve"),
  fields: z
    .array(z.string())
    .nullable()
    .describe("Specific fields to return (e.g., username,fullName,email)"),
  boards: z
    .enum(["all", "closed", "none", "open", "starred"])
    .nullable()
    .describe("Boards to include"),
  boardFields: z
    .array(z.string())
    .nullable()
    .describe("Fields for boards to return"),
  boardActions: z.string().nullable().describe("Actions to include for boards"),
  boardActionsEntities: z
    .boolean()
    .nullable()
    .describe("Whether to include action entities for boards"),
  boardActionsLimit: z
    .number()
    .nullable()
    .describe("Maximum number of actions to return for boards"),
  boardActionsFormat: z
    .enum(["count", "list", "minimal"])
    .nullable()
    .describe("Format for board actions"),
  boardActionsSince: z
    .string()
    .nullable()
    .describe("Filter board actions since this date"),
  boardActionsBefore: z
    .string()
    .nullable()
    .describe("Filter board actions before this date"),
  boardLists: z
    .enum(["all", "closed", "none", "open"])
    .nullable()
    .describe("Lists to include for boards"),
  boardMemberships: z
    .array(z.string())
    .nullable()
    .describe("Memberships to include for boards"),
  boardOrganization: z
    .boolean()
    .nullable()
    .describe("Whether to include organization for boards"),
  boardStars: z
    .boolean()
    .nullable()
    .describe("Whether to include stars for boards"),
  organizations: z
    .enum(["all", "members", "none", "public"])
    .nullable()
    .describe("Organizations to include"),
  organizationFields: z
    .array(z.string())
    .nullable()
    .describe("Fields for organizations to return"),
  organizationPaidAccount: z
    .boolean()
    .nullable()
    .describe("Whether to include paid account info for organizations"),
});

export const getMemberTool = tool({
  description: "Retrieve detailed information about a specific Trello member",
  inputSchema: getMemberSchema,

  execute: async ({
    memberId,
    fields,
    boards,
    boardFields,
    boardActions,
    boardActionsEntities,
    boardActionsLimit,
    boardActionsFormat,
    boardActionsSince,
    boardActionsBefore,
    boardLists,
    boardMemberships,
    boardOrganization,
    boardStars,
    organizations,
    organizationFields,
    organizationPaidAccount,
  }: {
    memberId: string;
    fields?: string[];
    boards?: "all" | "closed" | "none" | "open" | "starred";
    boardFields?: string[];
    boardActions?: string;
    boardActionsEntities?: boolean;
    boardActionsLimit?: number;
    boardActionsFormat?: "count" | "list" | "minimal";
    boardActionsSince?: string;
    boardActionsBefore?: string;
    boardLists?: "all" | "closed" | "none" | "open";
    boardMemberships?: string[];
    boardOrganization?: boolean;
    boardStars?: boolean;
    organizations?: "all" | "members" | "none" | "public";
    organizationFields?: string[];
    organizationPaidAccount?: boolean;
  }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = `https://api.trello.com/1/members/${memberId}`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        ...(fields && { fields: fields.join(",") }),
        ...(boards && { boards }),
        ...(boardFields && { board_fields: boardFields.join(",") }),
        ...(boardActions && { board_actions: boardActions }),
        ...(boardActionsEntities !== undefined && {
          board_actions_entities: boardActionsEntities.toString(),
        }),
        ...(boardActionsLimit && {
          board_actions_limit: boardActionsLimit.toString(),
        }),
        ...(boardActionsFormat && { board_actions_format: boardActionsFormat }),
        ...(boardActionsSince && { board_actions_since: boardActionsSince }),
        ...(boardActionsBefore && { board_actions_before: boardActionsBefore }),
        ...(boardLists && { board_lists: boardLists }),
        ...(boardMemberships && {
          board_memberships: boardMemberships.join(","),
        }),
        ...(boardOrganization !== undefined && {
          board_organization: boardOrganization.toString(),
        }),
        ...(boardStars !== undefined && {
          board_stars: boardStars.toString(),
        }),
        ...(organizations && { organizations }),
        ...(organizationFields && {
          organization_fields: organizationFields.join(","),
        }),
        ...(organizationPaidAccount !== undefined && {
          organization_paid_account: organizationPaidAccount.toString(),
        }),
      });

      const response = await axios.get(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        member: response.data,
        message: `Successfully retrieved member "${
          response.data.fullName || response.data.username
        }" (ID: ${memberId})`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to retrieve member";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to retrieve member with ID "${memberId}". ${errorMessage}`,
      };
    }
  },
});
