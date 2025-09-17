import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const createBoardSchema = z.object({
  name: z.string().describe("The name of the board to create"),
  description: z
    .string()
    .optional()
    .describe("Optional description for the board"),
  visibility: z
    .enum(["private", "public", "org"])
    .optional()
    .describe("Board visibility level"),
  organizationId: z
    .string()
    .optional()
    .describe("ID of the organization to add the board to"),
  defaultLists: z
    .boolean()
    .optional()
    .describe("Whether to create default lists (To Do, Doing, Done)"),
  defaultLabels: z
    .boolean()
    .optional()
    .describe("Whether to create default labels"),
  prefs: z
    .object({
      permissionLevel: z.enum(["private", "public", "org"]).optional(),
      voting: z.enum(["disabled", "enabled", "members"]).optional(),
      comments: z.enum(["disabled", "enabled", "members"]).optional(),
      invitations: z.enum(["disabled", "enabled", "members"]).optional(),
      selfJoin: z.boolean().optional(),
      cardCovers: z.boolean().optional(),
      isTemplate: z.boolean().optional(),
      cardAging: z.enum(["regular", "pirate"]).optional(),
      calendarFeedEnabled: z.boolean().optional(),
      background: z.string().optional(),
      backgroundColor: z.string().optional(),
      backgroundImage: z.string().optional(),
      backgroundImageScaled: z
        .array(
          z.object({
            width: z.number(),
            height: z.number(),
            url: z.string(),
          })
        )
        .optional(),
      backgroundTile: z.boolean().optional(),
      backgroundBrightness: z.enum(["dark", "light"]).optional(),
      backgroundBottomColor: z.string().optional(),
      backgroundTopColor: z.string().optional(),
      canBePublic: z.boolean().optional(),
      canBeEnterprise: z.boolean().optional(),
      canBeOrg: z.boolean().optional(),
      canBePrivate: z.boolean().optional(),
      canInvite: z.boolean().optional(),
    })
    .optional()
    .describe("Board preferences and settings"),
});

export const createBoardTool = tool({
  description:
    "Create a new Trello board with specified name, description, and settings",
  parameters: createBoardSchema,
  execute: async ({
    name,
    description,
    visibility = "private",
    organizationId,
    defaultLists = true,
    defaultLabels = true,
    prefs,
  }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = "https://api.trello.com/1/boards";
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        name,
        desc: description || "",
        defaultLists: defaultLists.toString(),
        defaultLabels: defaultLabels.toString(),
        prefs_permissionLevel: visibility,
        ...(organizationId && { idOrganization: organizationId }),
      });

      // Add preferences if provided
      if (prefs) {
        Object.entries(prefs).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(`prefs_${key}`, value.toString());
          }
        });
      }

      const response = await axios.post(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        board: {
          id: response.data.id,
          name: response.data.name,
          description: response.data.desc,
          url: response.data.url,
          shortUrl: response.data.shortUrl,
          visibility: response.data.prefs?.permissionLevel,
          organizationId: response.data.idOrganization,
          closed: response.data.closed,
          pinned: response.data.pinned,
          starred: response.data.starred,
          dateLastActivity: response.data.dateLastActivity,
          dateLastView: response.data.dateLastView,
          idTags: response.data.idTags,
          idLabels: response.data.idLabels,
          idMembers: response.data.idMembers,
          idMemberships: response.data.idMemberships,
          idShort: response.data.idShort,
          limits: response.data.limits,
          memberships: response.data.memberships,
          prefs: response.data.prefs,
        },
        message: `Successfully created board "${name}" with ID: ${response.data.id}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to create board";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to create board "${name}". ${errorMessage}`,
      };
    }
  },
});
