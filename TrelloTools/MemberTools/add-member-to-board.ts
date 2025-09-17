import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const addMemberToBoardSchema = z.object({
  boardId: z.string().describe("The ID of the board to add the member to"),
  email: z
    .string()
    .email()
    .optional()
    .describe("Email address of the member to add"),
  fullName: z.string().optional().describe("Full name of the member to add"),
  type: z
    .enum(["admin", "normal", "observer"])
    .optional()
    .describe("Type of membership for the member"),
});

export const addMemberToBoardTool = tool({
  description:
    "Add a member to a Trello board with specified email or full name",
  parameters: addMemberToBoardSchema,
  execute: async ({ boardId, email, fullName, type = "normal" }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      if (!email && !fullName) {
        throw new Error("Either email or fullName must be provided");
      }

      const baseUrl = `https://api.trello.com/1/boards/${boardId}/members`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        type,
        ...(email && { email }),
        ...(fullName && { fullName }),
      });

      const response = await axios.put(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        member: {
          id: response.data.id,
          username: response.data.username,
          fullName: response.data.fullName,
          email: response.data.email,
          type: response.data.type,
          status: response.data.status,
          bio: response.data.bio,
          bioData: response.data.bioData,
          confirmed: response.data.confirmed,
          memberType: response.data.memberType,
          dateLastActivity: response.data.dateLastActivity,
          dateLastActivityUpdate: response.data.dateLastActivityUpdate,
          idMemberReferrer: response.data.idMemberReferrer,
          idEnterprisesDeactivated: response.data.idEnterprisesDeactivated,
          limits: response.data.limits,
          nonPublic: response.data.nonPublic,
          nonPublicAvailable: response.data.nonPublicAvailable,
          products: response.data.products,
          url: response.data.url,
          avatarSource: response.data.avatarSource,
          avatarHash: response.data.avatarHash,
          avatarUrl: response.data.avatarUrl,
          gravatarHash: response.data.gravatarHash,
          idBoards: response.data.idBoards,
          idOrganizations: response.data.idOrganizations,
          loginTypes: response.data.loginTypes,
          newEmail: response.data.newEmail,
          oneTimeMessagesDismissed: response.data.oneTimeMessagesDismissed,
          prefs: response.data.prefs,
          trophies: response.data.trophies,
          uploadedAvatarHash: response.data.uploadedAvatarHash,
          uploadedAvatarUrl: response.data.uploadedAvatarUrl,
          premiumFeatures: response.data.premiumFeatures,
          isAaMastered: response.data.isAaMastered,
          ixUpdate: response.data.ixUpdate,
        },
        message: `Successfully added member to board ${boardId}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to add member to board";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to add member to board "${boardId}". ${errorMessage}`,
      };
    }
  },
});
