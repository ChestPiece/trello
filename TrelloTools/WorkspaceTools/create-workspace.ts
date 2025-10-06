import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const createWorkspaceSchema = z.object({
  displayName: z
    .string()
    .describe("The display name of the workspace to create"),
  description: z
    .string()
    .optional()
    .describe("Optional description for the workspace"),
  name: z
    .string()
    .optional()
    .describe(
      "Optional name for the workspace (will be generated from displayName if not provided)"
    ),
  website: z
    .string()
    .optional()
    .describe("Optional website URL for the workspace"),
  logo: z.string().optional().describe("Optional logo URL for the workspace"),
  prefs: z
    .object({
      permissionLevel: z.enum(["private", "public", "org"]).optional(),
      externalMembersDisabled: z.boolean().optional(),
      googleAppsVersion: z.number().optional(),
      orgInviteRestrict: z.string().optional(),
      boardVisibilityRestrict: z
        .object({
          private: z.string().optional(),
          org: z.string().optional(),
          public: z.string().optional(),
        })
        .optional(),
      boardDeleteRestrict: z
        .object({
          private: z.string().optional(),
          org: z.string().optional(),
          public: z.string().optional(),
        })
        .optional(),
      selfJoin: z.boolean().optional(),
      cardCovers: z.boolean().optional(),
      hideVotes: z.boolean().optional(),
      invitations: z.enum(["disabled", "enabled", "members"]).optional(),
      voting: z.enum(["disabled", "enabled", "members"]).optional(),
      comments: z.enum(["disabled", "enabled", "members"]).optional(),
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
    .describe("Workspace preferences and settings"),
});

export const createWorkspaceTool = tool({
  description:
    "Create a new Trello workspace (organization) with specified display name, description, and settings. Supports comprehensive workspace configuration including permissions, visibility, and custom preferences.",
  inputSchema: createWorkspaceSchema,
  execute: async ({ displayName, description, name, website, logo, prefs }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = "https://api.trello.com/1/organizations";
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        displayName,
        ...(description && { desc: description }),
        ...(name && { name }),
        ...(website && { website }),
        ...(logo && { logo }),
      });

      // Add preferences if provided
      if (prefs) {
        Object.entries(prefs).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (typeof value === "object" && !Array.isArray(value)) {
              // Handle nested objects like boardVisibilityRestrict
              Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                if (nestedValue !== undefined && nestedValue !== null) {
                  params.append(
                    `prefs_${key}_${nestedKey}`,
                    nestedValue.toString()
                  );
                }
              });
            } else if (Array.isArray(value)) {
              // Handle arrays like backgroundImageScaled
              value.forEach((item, index) => {
                if (typeof item === "object") {
                  Object.entries(item).forEach(([itemKey, itemValue]) => {
                    if (itemValue !== undefined && itemValue !== null) {
                      params.append(
                        `prefs_${key}_${index}_${itemKey}`,
                        itemValue.toString()
                      );
                    }
                  });
                }
              });
            } else {
              params.append(`prefs_${key}`, value.toString());
            }
          }
        });
      }

      const response = await axios.post(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        workspace: {
          id: response.data.id,
          name: response.data.name,
          displayName: response.data.displayName,
          description: response.data.desc,
          website: response.data.website,
          logo: response.data.logo,
          url: response.data.url,
          products: response.data.products,
          powerUps: response.data.powerUps,
          dateLastActivity: response.data.dateLastActivity,
          dateLastView: response.data.dateLastView,
          idTags: response.data.idTags,
          idMembers: response.data.idMembers,
          idMemberships: response.data.idMemberships,
          limits: response.data.limits,
          memberships: response.data.memberships,
          prefs: response.data.prefs,
        },
        message: `Successfully created workspace "${displayName}" with ID: ${response.data.id}`,
      };
    } catch (error: unknown) {
      console.error("Create workspace error:", error);

      let errorMessage = "Failed to create workspace";
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
        message: `Failed to create workspace "${displayName}". ${errorMessage}`,
        suggestions: [
          "Check if the workspace name is valid and not too long",
          "Verify that the display name is unique",
          "Ensure API credentials are properly configured",
          "Check if you have permission to create workspaces",
          "Verify that all preference values are valid",
        ],
      };
    }
  },
});
