import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const removeMemberFromBoardSchema = z.object({
  boardId: z.string().describe("The ID of the board to remove the member from"),
  memberId: z.string().describe("The ID of the member to remove"),
});

export const removeMemberFromBoardTool = tool({
  description:
    "Remove a member from a Trello board. This action cannot be undone.",
  inputSchema: removeMemberFromBoardSchema,
  execute: async ({ boardId, memberId }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = `https://api.trello.com/1/boards/${boardId}/members/${memberId}`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
      });

      const response = await axios.delete(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        message: `Successfully removed member ${memberId} from board ${boardId}`,
        removedMember: {
          id: memberId,
          boardId,
          removed: true,
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to remove member from board";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to remove member "${memberId}" from board "${boardId}". ${errorMessage}`,
      };
    }
  },
});
