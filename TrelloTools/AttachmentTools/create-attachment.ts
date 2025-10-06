import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const createAttachmentSchema = z.object({
  cardId: z.string().describe("The ID of the card to attach the file to"),
  url: z.string().url().optional().describe("URL of the file to attach"),
  name: z.string().optional().describe("Name for the attachment"),
  mimeType: z.string().optional().describe("MIME type of the attachment"),
  file: z.string().optional().describe("Base64 encoded file data"),
});

export const createAttachmentTool = tool({
  description: "Create an attachment on a Trello card by URL or file data",
  inputSchema: createAttachmentSchema,
  execute: async ({ cardId, url, name, mimeType, file }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      if (!url && !file) {
        throw new Error("Either URL or file data must be provided");
      }

      const baseUrl = `https://api.trello.com/1/cards/${cardId}/attachments`;
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        ...(url && { url }),
        ...(name && { name }),
        ...(mimeType && { mimeType }),
      });

      let response;
      if (file) {
        // For file uploads, we need to use FormData
        const formData = new FormData();
        formData.append("key", apiKey);
        formData.append("token", apiToken);
        formData.append("file", file);
        if (name) formData.append("name", name);
        if (mimeType) formData.append("mimeType", mimeType);

        response = await axios.post(baseUrl, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await axios.post(`${baseUrl}?${params.toString()}`);
      }

      return {
        success: true,
        attachment: {
          id: response.data.id,
          name: response.data.name,
          url: response.data.url,
          mimeType: response.data.mimeType,
          bytes: response.data.bytes,
          date: response.data.date,
          edgeColor: response.data.edgeColor,
          idMember: response.data.idMember,
          isUpload: response.data.isUpload,
          pos: response.data.pos,
          previews: response.data.previews || [],
        },
        message: `Successfully attached "${response.data.name}" to card ${cardId}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to create attachment";

      return {
        success: false,
        error: errorMessage,
        message: `Failed to create attachment on card "${cardId}". ${errorMessage}`,
      };
    }
  },
});
