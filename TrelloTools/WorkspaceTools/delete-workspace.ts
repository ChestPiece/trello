import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const deleteWorkspaceSchema = z.object({
  workspaceId: z.string().describe("The ID of the workspace to delete"),
});

export const deleteWorkspaceTool = {
  description:
    "Delete a Trello workspace permanently. This action cannot be undone and will remove all boards, members, and data associated with the workspace.",
  inputSchema: deleteWorkspaceSchema,

  execute: async ({ workspaceId }: { workspaceId: string }) => {
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
      });

      const response = await axios.delete(`${baseUrl}?${params.toString()}`);

      // Return the deleted workspace data directly for UI components
      return {
        id: workspaceId,
        name: response.data?.displayName || response.data?.name || "Unknown",
        deleted: true,
        message: `Successfully deleted workspace with ID: ${workspaceId}`,
      };
    } catch (error: unknown) {
      console.error("Delete workspace error:", error);

      let errorMessage = "Failed to delete workspace";

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string }; status?: number };
        };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as { message: string }).message;
      }

      throw new Error(
        `Failed to delete workspace with ID "${workspaceId}": ${errorMessage}`
      );
    }
  },
};
