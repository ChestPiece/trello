import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const updateBoardSchema = z.object({
  boardId: z.string().describe("The ID of the board to update"),
  name: z.string().optional().describe("New name for the board"),
  description: z.string().optional().describe("New description for the board"),
  closed: z
    .boolean()
    .optional()
    .describe("Whether to close or reopen the board"),
  subscribed: z
    .boolean()
    .optional()
    .describe("Whether to subscribe to the board"),
  idOrganization: z
    .string()
    .optional()
    .describe("ID of the organization to move the board to"),
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
    .describe("Board preferences and settings to update"),
  labelNames: z
    .object({
      green: z.string().optional(),
      yellow: z.string().optional(),
      orange: z.string().optional(),
      red: z.string().optional(),
      purple: z.string().optional(),
      blue: z.string().optional(),
      sky: z.string().optional(),
      lime: z.string().optional(),
      pink: z.string().optional(),
      black: z.string().optional(),
    })
    .optional()
    .describe("Custom names for board labels"),
});

export const updateBoardTool = tool({
  description:
    "Update an existing Trello board with new name, description, settings, or preferences",
  parameters: updateBoardSchema,
  execute: async ({
    boardId,
    name,
    description,
    closed,
    subscribed,
    idOrganization,
    prefs,
    labelNames,
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
        ...(name && { name }),
        ...(description !== undefined && { desc: description }),
        ...(closed !== undefined && { closed: closed.toString() }),
        ...(subscribed !== undefined && { subscribed: subscribed.toString() }),
        ...(idOrganization && { idOrganization }),
      });

      // Add preferences if provided
      if (prefs) {
        Object.entries(prefs).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(`prefs_${key}`, value.toString());
          }
        });
      }

      // Add label names if provided
      if (labelNames) {
        Object.entries(labelNames).forEach(([color, name]) => {
          if (name !== undefined && name !== null) {
            params.append(`labelNames_${color}`, name);
          }
        });
      }

      const response = await axios.put(`${baseUrl}?${params.toString()}`);

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
          prefs: response.data.prefs,
          labelNames: response.data.labelNames,
        },
        message: `Successfully updated board "${response.data.name}" (ID: ${boardId})`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to update board";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to update board with ID "${boardId}". ${errorMessage}`,
      };
    }
  },
});
