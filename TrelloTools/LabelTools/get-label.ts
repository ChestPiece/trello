import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const getLabelSchema = z.object({
  labelId: z.string().describe("The ID of the label to retrieve"),
  fields: z
    .array(z.string())
    .optional()
    .describe("Specific fields to return (e.g., name,color,uses)"),
});

export const getLabelTool = tool({
  description: "Retrieve detailed information about a specific Trello label",
  inputSchema: getLabelSchema,
  execute: async ({ labelId, fields }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = `https://api.trello.com/1/labels/${labelId}`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        ...(fields && { fields: fields.join(",") }),
      });

      const response = await axios.get(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        label: response.data,
        message: `Successfully retrieved label "${response.data.name}" (ID: ${labelId})`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to retrieve label";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to retrieve label with ID "${labelId}". ${errorMessage}`,
      };
    }
  },
});
