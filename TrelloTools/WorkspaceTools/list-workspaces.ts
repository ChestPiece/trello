import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const listWorkspacesSchema = z.object({
  fields: z
    .array(z.string())
    .optional()
    .describe(
      "Specific fields to return (e.g., name,displayName,desc,website,logo)"
    ),
  filter: z
    .enum(["all", "members", "none", "public"])
    .optional()
    .describe("Filter workspaces by type"),
  paidAccount: z
    .boolean()
    .optional()
    .describe("Whether to include paid account information"),
  member: z
    .boolean()
    .optional()
    .describe("Whether to include member information"),
  memberFields: z
    .array(z.string())
    .optional()
    .describe("Fields for members to return"),
  memberFilter: z
    .enum(["all", "none", "normal", "owners"])
    .optional()
    .describe("Filter members by type"),
  memberSort: z
    .enum(["fullName", "-fullName", "username", "-username"])
    .optional()
    .describe("Sort members by field"),
  memberSortBy: z
    .enum(["fullName", "username"])
    .optional()
    .describe("Sort members by specific field"),
  memberSortOrder: z
    .enum(["asc", "desc"])
    .optional()
    .describe("Sort order for members"),
  memberStartIndex: z
    .number()
    .optional()
    .describe("Start index for member pagination"),
  memberCount: z.number().optional().describe("Number of members to return"),
  memberActivity: z
    .boolean()
    .optional()
    .describe("Whether to include member activity"),
  memberActivityFields: z
    .array(z.string())
    .optional()
    .describe("Fields for member activity"),
  memberActivitySince: z
    .string()
    .optional()
    .describe("Filter member activity since this date (ISO 8601)"),
  memberActivityBefore: z
    .string()
    .optional()
    .describe("Filter member activity before this date (ISO 8601)"),
  memberActivityLimit: z
    .number()
    .optional()
    .describe("Maximum number of member activities to return"),
  memberActivityFormat: z
    .string()
    .optional()
    .describe("Format for member activity (e.g., count, list, minimal)"),
  memberActivityEntities: z
    .boolean()
    .optional()
    .describe("Whether to include member activity entities"),
  memberActivityDisplay: z
    .boolean()
    .optional()
    .describe("Whether to include member activity display"),
  memberActivityMember: z
    .boolean()
    .optional()
    .describe("Whether to include member data for activities"),
  memberActivityMemberFields: z
    .array(z.string())
    .optional()
    .describe("Fields for member activity members"),
  memberActivityMemberCreator: z
    .boolean()
    .optional()
    .describe("Whether to include member creator data for activities"),
  memberActivityMemberCreatorFields: z
    .array(z.string())
    .optional()
    .describe("Fields for member activity member creators"),
  memberActivityMemberCreatorSince: z
    .string()
    .optional()
    .describe(
      "Filter member activity member creator since this date (ISO 8601)"
    ),
  memberActivityMemberCreatorBefore: z
    .string()
    .optional()
    .describe(
      "Filter member activity member creator before this date (ISO 8601)"
    ),
  memberActivityMemberCreatorLimit: z
    .number()
    .optional()
    .describe("Maximum number of member activity member creators to return"),
  memberActivityMemberCreatorFormat: z
    .string()
    .optional()
    .describe(
      "Format for member activity member creators (e.g., count, list, minimal)"
    ),
  memberActivityMemberCreatorEntities: z
    .boolean()
    .optional()
    .describe("Whether to include member activity member creator entities"),
  memberActivityMemberCreatorDisplay: z
    .boolean()
    .optional()
    .describe("Whether to include member activity member creator display"),
  memberActivityMemberCreatorMember: z
    .boolean()
    .optional()
    .describe(
      "Whether to include member data for member activity member creators"
    ),
  memberActivityMemberCreatorMemberFields: z
    .array(z.string())
    .optional()
    .describe("Fields for member activity member creator members"),
  memberActivityMemberCreatorMemberSince: z
    .string()
    .optional()
    .describe(
      "Filter member activity member creator member since this date (ISO 8601)"
    ),
  memberActivityMemberCreatorMemberBefore: z
    .string()
    .optional()
    .describe(
      "Filter member activity member creator member before this date (ISO 8601)"
    ),
  memberActivityMemberCreatorMemberLimit: z
    .number()
    .optional()
    .describe(
      "Maximum number of member activity member creator members to return"
    ),
  memberActivityMemberCreatorMemberFormat: z
    .string()
    .optional()
    .describe(
      "Format for member activity member creator members (e.g., count, list, minimal)"
    ),
  memberActivityMemberCreatorMemberEntities: z
    .boolean()
    .optional()
    .describe(
      "Whether to include member activity member creator member entities"
    ),
  memberActivityMemberCreatorMemberDisplay: z
    .boolean()
    .optional()
    .describe(
      "Whether to include member activity member creator member display"
    ),
});

export const listWorkspacesTool = tool({
  description:
    "List all Trello workspaces accessible to the authenticated user with optional filtering and field selection",
  parameters: listWorkspacesSchema,
  execute: async ({
    fields,
    filter,
    paidAccount,
    member,
    memberFields,
    memberFilter,
    memberSort,
    memberSortBy,
    memberSortOrder,
    memberStartIndex,
    memberCount,
    memberActivity,
    memberActivityFields,
    memberActivitySince,
    memberActivityBefore,
    memberActivityLimit,
    memberActivityFormat,
    memberActivityEntities,
    memberActivityDisplay,
    memberActivityMember,
    memberActivityMemberFields,
    memberActivityMemberCreator,
    memberActivityMemberCreatorFields,
    memberActivityMemberCreatorSince,
    memberActivityMemberCreatorBefore,
    memberActivityMemberCreatorLimit,
    memberActivityMemberCreatorFormat,
    memberActivityMemberCreatorEntities,
    memberActivityMemberCreatorDisplay,
    memberActivityMemberCreatorMember,
    memberActivityMemberCreatorMemberFields,
    memberActivityMemberCreatorMemberSince,
    memberActivityMemberCreatorMemberBefore,
    memberActivityMemberCreatorMemberLimit,
    memberActivityMemberCreatorMemberFormat,
    memberActivityMemberCreatorMemberEntities,
    memberActivityMemberCreatorMemberDisplay,
  }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = "https://api.trello.com/1/members/me/organizations";
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        ...(fields && { fields: fields.join(",") }),
        ...(filter && { filter }),
        ...(paidAccount !== undefined && {
          paid_account: paidAccount.toString(),
        }),
        ...(member !== undefined && { member: member.toString() }),
        ...(memberFields && { member_fields: memberFields.join(",") }),
        ...(memberFilter && { member_filter: memberFilter }),
        ...(memberSort && { member_sort: memberSort }),
        ...(memberSortBy && { member_sortBy: memberSortBy }),
        ...(memberSortOrder && { member_sortOrder: memberSortOrder }),
        ...(memberStartIndex && {
          member_startIndex: memberStartIndex.toString(),
        }),
        ...(memberCount && { member_count: memberCount.toString() }),
        ...(memberActivity !== undefined && {
          member_activity: memberActivity.toString(),
        }),
        ...(memberActivityFields && {
          member_activity_fields: memberActivityFields.join(","),
        }),
        ...(memberActivitySince && {
          member_activity_since: memberActivitySince,
        }),
        ...(memberActivityBefore && {
          member_activity_before: memberActivityBefore,
        }),
        ...(memberActivityLimit && {
          member_activity_limit: memberActivityLimit.toString(),
        }),
        ...(memberActivityFormat && {
          member_activity_format: memberActivityFormat,
        }),
        ...(memberActivityEntities !== undefined && {
          member_activity_entities: memberActivityEntities.toString(),
        }),
        ...(memberActivityDisplay !== undefined && {
          member_activity_display: memberActivityDisplay.toString(),
        }),
        ...(memberActivityMember !== undefined && {
          member_activity_member: memberActivityMember.toString(),
        }),
        ...(memberActivityMemberFields && {
          member_activity_member_fields: memberActivityMemberFields.join(","),
        }),
        ...(memberActivityMemberCreator !== undefined && {
          member_activity_memberCreator: memberActivityMemberCreator.toString(),
        }),
        ...(memberActivityMemberCreatorFields && {
          member_activity_memberCreator_fields:
            memberActivityMemberCreatorFields.join(","),
        }),
        ...(memberActivityMemberCreatorSince && {
          member_activity_memberCreator_since: memberActivityMemberCreatorSince,
        }),
        ...(memberActivityMemberCreatorBefore && {
          member_activity_memberCreator_before:
            memberActivityMemberCreatorBefore,
        }),
        ...(memberActivityMemberCreatorLimit && {
          member_activity_memberCreator_limit:
            memberActivityMemberCreatorLimit.toString(),
        }),
        ...(memberActivityMemberCreatorFormat && {
          member_activity_memberCreator_format:
            memberActivityMemberCreatorFormat,
        }),
        ...(memberActivityMemberCreatorEntities !== undefined && {
          member_activity_memberCreator_entities:
            memberActivityMemberCreatorEntities.toString(),
        }),
        ...(memberActivityMemberCreatorDisplay !== undefined && {
          member_activity_memberCreator_display:
            memberActivityMemberCreatorDisplay.toString(),
        }),
        ...(memberActivityMemberCreatorMember !== undefined && {
          member_activity_memberCreator_member:
            memberActivityMemberCreatorMember.toString(),
        }),
        ...(memberActivityMemberCreatorMemberFields && {
          member_activity_memberCreator_member_fields:
            memberActivityMemberCreatorMemberFields.join(","),
        }),
        ...(memberActivityMemberCreatorMemberSince && {
          member_activity_memberCreator_member_since:
            memberActivityMemberCreatorMemberSince,
        }),
        ...(memberActivityMemberCreatorMemberBefore && {
          member_activity_memberCreator_member_before:
            memberActivityMemberCreatorMemberBefore,
        }),
        ...(memberActivityMemberCreatorMemberLimit && {
          member_activity_memberCreator_member_limit:
            memberActivityMemberCreatorMemberLimit.toString(),
        }),
        ...(memberActivityMemberCreatorMemberFormat && {
          member_activity_memberCreator_member_format:
            memberActivityMemberCreatorMemberFormat,
        }),
        ...(memberActivityMemberCreatorMemberEntities !== undefined && {
          member_activity_memberCreator_member_entities:
            memberActivityMemberCreatorMemberEntities.toString(),
        }),
        ...(memberActivityMemberCreatorMemberDisplay !== undefined && {
          member_activity_memberCreator_member_display:
            memberActivityMemberCreatorMemberDisplay.toString(),
        }),
      });

      const response = await axios.get(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        workspaces: response.data,
        count: response.data.length,
        message: `Successfully retrieved ${response.data.length} workspace(s)`,
      };
    } catch (error: unknown) {
      console.error("List workspaces error:", error);

      let errorMessage = "Failed to list workspaces";
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
        message: `Failed to list workspaces. ${errorMessage}`,
        suggestions: [
          "Check if API credentials are properly configured",
          "Verify that you have permission to access workspaces",
          "Ensure the filter parameters are valid",
          "Check if the field names are correct",
          "Verify that pagination parameters are within valid ranges",
        ],
      };
    }
  },
});
