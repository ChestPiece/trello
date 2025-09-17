import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

// Define more specific interfaces for Trello API response types
interface TrelloLimits {
  [key: string]: unknown;
}

interface TrelloPrefs {
  permissionLevel?: string;
  [key: string]: unknown;
}

interface TrelloOrganization {
  id?: string;
  name?: string;
  displayName?: string;
  [key: string]: unknown;
}

interface TrelloList {
  id: string;
  name: string;
  closed: boolean;
  [key: string]: unknown;
}

// Define the board interface based on Trello API response
interface TrelloBoardResponse {
  id: string;
  name: string;
  desc: string;
  url: string;
  shortUrl: string;
  prefs?: TrelloPrefs;
  idOrganization?: string;
  closed: boolean;
  pinned: boolean;
  starred: boolean;
  dateLastActivity?: string;
  dateLastView?: string;
  idShort: number;
  limits?: TrelloLimits;
  organization?: TrelloOrganization;
  lists?: TrelloList[];
}

const listBoardsSchema = z.object({
  filter: z
    .enum(["all", "closed", "none", "open", "starred"])
    .optional()
    .describe("Filter boards by status"),
  fields: z
    .array(z.string())
    .optional()
    .describe("Specific fields to return for each board"),
  organization: z
    .boolean()
    .optional()
    .describe("Whether to include organization data"),
  organizationFields: z
    .array(z.string())
    .optional()
    .describe("Fields for organization data"),
  lists: z
    .string()
    .optional()
    .describe("Lists to include (e.g., all, closed, none, open)"),
  listFields: z
    .array(z.string())
    .optional()
    .describe("Fields for lists to return"),
});

export const listBoardsTool = tool({
  description:
    "List all Trello boards accessible to the authenticated user with optional filtering and field selection",
  parameters: listBoardsSchema,
  execute: async ({
    filter = "all",
    fields,
    organization,
    organizationFields,
    lists,
    listFields,
  }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = "https://api.trello.com/1/members/me/boards";
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        filter,
        ...(fields && { fields: fields.join(",") }),
        ...(organization !== undefined && {
          organization: organization.toString(),
        }),
        ...(organizationFields && {
          organization_fields: organizationFields.join(","),
        }),
        ...(lists && { lists }),
        ...(listFields && { list_fields: listFields.join(",") }),
      });

      const response = await axios.get(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        boards: response.data.map((board: TrelloBoardResponse) => ({
          id: board.id,
          name: board.name,
          description: board.desc,
          url: board.url,
          shortUrl: board.shortUrl,
          visibility: board.prefs?.permissionLevel,
          organizationId: board.idOrganization,
          closed: board.closed,
          pinned: board.pinned,
          starred: board.starred,
          dateLastActivity: board.dateLastActivity,
          dateLastView: board.dateLastView,
          idShort: board.idShort,
          limits: board.limits,
          prefs: board.prefs,
          organization: board.organization,
          lists: board.lists,
        })),
        count: response.data.length,
        message: `Successfully retrieved ${response.data.length} board(s)`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to list boards";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to list boards. ${errorMessage}`,
      };
    }
  },
});
