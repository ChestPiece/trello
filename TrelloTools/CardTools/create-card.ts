import { tool } from "ai";
import { z } from "zod";
import axios from "axios";

const createCardSchema = z.object({
  name: z.string().describe("The name of the card to create"),
  desc: z.string().optional().describe("The description of the card"),
  idList: z.string().describe("The ID of the list to create the card in"),
  idLabels: z
    .array(z.string())
    .optional()
    .describe("Array of label IDs to add to the card"),
  idMembers: z
    .array(z.string())
    .optional()
    .describe("Array of member IDs to add to the card"),
  due: z
    .string()
    .optional()
    .describe("Due date for the card (ISO 8601 format)"),
  dueComplete: z
    .boolean()
    .optional()
    .describe("Whether the card is marked as complete"),
  pos: z
    .union([z.string(), z.number()])
    .optional()
    .describe("Position of the card. 'top', 'bottom', or a positive number"),
  start: z
    .string()
    .optional()
    .describe("Start date for the card (ISO 8601 format)"),
  idCardSource: z.string().optional().describe("ID of a card to copy from"),
  keepFromSource: z
    .union([
      z.literal("all"),
      z.literal("attachments"),
      z.literal("checklists"),
      z.literal("comments"),
      z.literal("customFields"),
      z.literal("labels"),
      z.literal("members"),
      z.literal("stickers"),
    ])
    .optional()
    .describe("What to copy from the source card"),
  address: z.string().optional().describe("Address for the card location"),
  locationName: z.string().optional().describe("Name of the location"),
  coordinates: z
    .string()
    .optional()
    .describe("Coordinates for the card location (latitude,longitude)"),
});

export const createCardTool = tool({
  description:
    "Create a new card in a Trello list with specified name, description, and optional settings",
  inputSchema: createCardSchema,
  execute: async ({
    name,
    desc,
    idList,
    idLabels,
    idMembers,
    due,
    dueComplete,
    pos,
    start,
    idCardSource,
    keepFromSource,
    address,
    locationName,
    coordinates,
  }) => {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const apiToken = process.env.TRELLO_API_TOKEN;

      if (!apiKey || !apiToken) {
        throw new Error(
          "Trello API credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN environment variables."
        );
      }

      const baseUrl = "https://api.trello.com/1/cards";
      const params = new URLSearchParams({
        key: apiKey,
        token: apiToken,
        name,
        idList,
        ...(desc && { desc }),
        ...(idLabels && { idLabels: idLabels.join(",") }),
        ...(idMembers && { idMembers: idMembers.join(",") }),
        ...(due && { due }),
        ...(dueComplete !== undefined && {
          dueComplete: dueComplete.toString(),
        }),
        ...(pos !== undefined && { pos: pos.toString() }),
        ...(start && { start }),
        ...(idCardSource && { idCardSource }),
        ...(keepFromSource && { keepFromSource }),
        ...(address && { address }),
        ...(locationName && { locationName }),
        ...(coordinates && { coordinates }),
      });

      const response = await axios.post(`${baseUrl}?${params.toString()}`);

      return {
        success: true,
        card: {
          id: response.data.id,
          name: response.data.name,
          description: response.data.desc,
          listId: response.data.idList,
          boardId: response.data.idBoard,
          position: response.data.pos,
          closed: response.data.closed,
          due: response.data.due,
          dueComplete: response.data.dueComplete,
          start: response.data.start,
          url: response.data.url,
          shortUrl: response.data.shortUrl,
          labels: response.data.labels || [],
          members: response.data.members || [],
          attachments: response.data.attachments || [],
          checklists: response.data.checklists || [],
          badges: response.data.badges || {},
          cover: response.data.cover || {},
        },
        message: `Successfully created card "${name}" in list ${idList}`,
      };
    } catch (error: unknown) {
      console.error("Create card error:", error);

      let errorMessage = "Failed to create card";
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
        message: `Failed to create card "${name}". ${errorMessage}`,
        suggestions: [
          "Check if the card name is valid and not too long",
          "Verify that the list ID exists",
          "Ensure API credentials are properly configured",
          "Check if you have permission to create cards in this list",
        ],
      };
    }
  },
});
