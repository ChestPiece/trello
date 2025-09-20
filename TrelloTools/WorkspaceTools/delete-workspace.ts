import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const deleteWorkspaceSchema = z.object({
  workspaceId: z.string().describe("The ID of the workspace to delete"),
});

export const deleteWorkspaceTool = tool({
  description:
    "Delete a Trello workspace permanently. This action cannot be undone and will remove all boards, members, and data associated with the workspace.",
  parameters: deleteWorkspaceSchema,
  execute: async ({ workspaceId }) => {
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

      return {
        success: true,
        message: `Successfully deleted workspace with ID: ${workspaceId}`,
        deletedWorkspace: {
          id: workspaceId,
          name: response.data?.displayName || response.data?.name || "Unknown",
          deleted: true,
        },
      };
    } catch (error: unknown) {
      console.error("Delete workspace error:", error);

      let errorMessage = "Failed to delete workspace";
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
        message: `Failed to delete workspace with ID "${workspaceId}". ${errorMessage}`,
        suggestions: [
          "Check if the workspace ID is valid and exists",
          "Verify that you have admin permissions to delete this workspace",
          "Ensure all boards in the workspace are deleted first if required",
          "Check if there are any active memberships that need to be removed",
          "Verify that the workspace is not being used by other services",
        ],
      };
    }
  },
});
