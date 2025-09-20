import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const updateWorkspaceSchema = z.object({
  workspaceId: z.string().describe("The ID of the workspace to update"),
  displayName: z
    .string()
    .optional()
    .describe("New display name for the workspace"),
  description: z
    .string()
    .optional()
    .describe("New description for the workspace"),
  name: z.string().optional().describe("New name for the workspace"),
  website: z.string().optional().describe("New website URL for the workspace"),
  logo: z.string().optional().describe("New logo URL for the workspace"),
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
    .describe("Workspace preferences and settings to update"),
});

export const updateWorkspaceTool = tool({
  description:
    "Update an existing Trello workspace with new display name, description, settings, or preferences. Supports comprehensive workspace configuration updates.",
  parameters: updateWorkspaceSchema,
  execute: async ({
    workspaceId,
    displayName,
    description,
    name,
    website,
    logo,
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

      const baseUrl = `https://api.trello.com/1/organizations/${workspaceId}`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        ...(displayName && { displayName }),
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

      const response = await axios.put(`${baseUrl}?${params.toString()}`);

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
        message: `Successfully updated workspace "${
          response.data.displayName || response.data.name
        }" with ID: ${workspaceId}`,
      };
    } catch (error: unknown) {
      console.error("Update workspace error:", error);

      let errorMessage = "Failed to update workspace";
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
        message: `Failed to update workspace with ID "${workspaceId}". ${errorMessage}`,
        suggestions: [
          "Check if the workspace ID is valid and exists",
          "Verify that you have permission to update this workspace",
          "Ensure all preference values are valid",
          "Check if the new name or display name is unique",
          "Verify that all URLs (website, logo) are valid",
        ],
      };
    }
  },
});
