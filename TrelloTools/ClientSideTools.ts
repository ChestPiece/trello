import { tool } from "ai";
import { z } from "zod";

// Client-side form tools that generate interactive UI instead of executing immediately
// These tools match the exact schemas from the existing Trello tools

export const createBoardFormTool = tool({
  description: "Generate an interactive form for creating a new Trello board. This tool should be called when the user wants to create a board and needs to fill out the details.",
  inputSchema: z.object({
    trigger: z.string().describe("The user's request that triggered this form generation"),
  }),
  execute: async ({ trigger }) => {
    return {
      formType: "createBoard",
      title: "Create New Board",
      description: "Fill out the details below to create a new Trello board",
      fields: [
        {
          name: "name",
          label: "Board Name",
          type: "text",
          required: true,
          placeholder: "Enter board name...",
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          required: false,
          placeholder: "Enter board description (optional)...",
        },
        {
          name: "visibility",
          label: "Visibility",
          type: "select",
          required: false,
          options: [
            { value: "private", label: "Private" },
            { value: "public", label: "Public" },
            { value: "org", label: "Organization" },
          ],
          defaultValue: "private",
        },
        {
          name: "organizationId",
          label: "Organization ID",
          type: "text",
          required: false,
          placeholder: "Enter organization ID (optional)...",
        },
        {
          name: "defaultLists",
          label: "Create Default Lists",
          type: "checkbox",
          required: false,
          defaultValue: true,
          description: "Create To Do, Doing, Done lists automatically",
        },
        {
          name: "defaultLabels",
          label: "Create Default Labels",
          type: "checkbox",
          required: false,
          defaultValue: true,
          description: "Create default color labels automatically",
        },
        // Board Preferences Section
        {
          name: "prefs_permissionLevel",
          label: "Permission Level",
          type: "select",
          required: false,
          options: [
            { value: "private", label: "Private" },
            { value: "public", label: "Public" },
            { value: "org", label: "Organization" },
          ],
          description: "Board permission level",
        },
        {
          name: "prefs_voting",
          label: "Voting",
          type: "select",
          required: false,
          options: [
            { value: "disabled", label: "Disabled" },
            { value: "enabled", label: "Enabled" },
            { value: "members", label: "Members Only" },
          ],
          description: "Who can vote on cards",
        },
        {
          name: "prefs_comments",
          label: "Comments",
          type: "select",
          required: false,
          options: [
            { value: "disabled", label: "Disabled" },
            { value: "enabled", label: "Enabled" },
            { value: "members", label: "Members Only" },
          ],
          description: "Who can comment on cards",
        },
        {
          name: "prefs_invitations",
          label: "Invitations",
          type: "select",
          required: false,
          options: [
            { value: "disabled", label: "Disabled" },
            { value: "enabled", label: "Enabled" },
            { value: "members", label: "Members Only" },
          ],
          description: "Who can invite members",
        },
        {
          name: "prefs_selfJoin",
          label: "Allow Self Join",
          type: "checkbox",
          required: false,
          defaultValue: false,
          description: "Allow members to join without invitation",
        },
        {
          name: "prefs_cardCovers",
          label: "Card Covers",
          type: "checkbox",
          required: false,
          defaultValue: true,
          description: "Show card covers",
        },
        {
          name: "prefs_isTemplate",
          label: "Is Template",
          type: "checkbox",
          required: false,
          defaultValue: false,
          description: "Make this board a template",
        },
        {
          name: "prefs_cardAging",
          label: "Card Aging",
          type: "select",
          required: false,
          options: [
            { value: "regular", label: "Regular" },
            { value: "pirate", label: "Pirate" },
          ],
          description: "Card aging style",
        },
        {
          name: "prefs_calendarFeedEnabled",
          label: "Calendar Feed",
          type: "checkbox",
          required: false,
          defaultValue: false,
          description: "Enable calendar feed",
        },
        {
          name: "prefs_background",
          label: "Background",
          type: "text",
          required: false,
          placeholder: "Background color or image...",
          description: "Board background",
        },
        {
          name: "prefs_backgroundColor",
          label: "Background Color",
          type: "color",
          required: false,
          description: "Board background color",
        },
        {
          name: "prefs_backgroundBrightness",
          label: "Background Brightness",
          type: "select",
          required: false,
          options: [
            { value: "dark", label: "Dark" },
            { value: "light", label: "Light" },
          ],
          description: "Background brightness",
        },
      ],
    };
  },
});

export const createCardFormTool = tool({
  description: "Generate an interactive form for creating a new Trello card. This tool should be called when the user wants to create a card and needs to fill out the details.",
  inputSchema: z.object({
    trigger: z.string().describe("The user's request that triggered this form generation"),
  }),
  execute: async ({ trigger }) => {
    return {
      formType: "createCard",
      title: "Create New Card",
      description: "Fill out the details below to create a new Trello card",
      fields: [
        {
          name: "name",
          label: "Card Name",
          type: "text",
          required: true,
          placeholder: "Enter card name...",
        },
        {
          name: "desc",
          label: "Description",
          type: "textarea",
          required: false,
          placeholder: "Enter card description (optional)...",
        },
        {
          name: "idList",
          label: "List ID",
          type: "text",
          required: true,
          placeholder: "Enter the list ID where this card should be created...",
        },
        {
          name: "idLabels",
          label: "Label IDs",
          type: "text",
          required: false,
          placeholder: "Enter label IDs separated by commas (optional)...",
          description: "Comma-separated list of label IDs to add to the card",
        },
        {
          name: "idMembers",
          label: "Member IDs",
          type: "text",
          required: false,
          placeholder: "Enter member IDs separated by commas (optional)...",
          description: "Comma-separated list of member IDs to add to the card",
        },
        {
          name: "due",
          label: "Due Date",
          type: "datetime-local",
          required: false,
          description: "Due date for the card",
        },
        {
          name: "dueComplete",
          label: "Mark as Complete",
          type: "checkbox",
          required: false,
          defaultValue: false,
          description: "Mark the card as complete",
        },
        {
          name: "pos",
          label: "Position",
          type: "select",
          required: false,
          options: [
            { value: "top", label: "Top" },
            { value: "bottom", label: "Bottom" },
          ],
          description: "Position of the card in the list",
        },
        {
          name: "start",
          label: "Start Date",
          type: "datetime-local",
          required: false,
          description: "Start date for the card",
        },
        {
          name: "idCardSource",
          label: "Source Card ID",
          type: "text",
          required: false,
          placeholder: "Enter source card ID to copy from (optional)...",
          description: "ID of a card to copy from",
        },
        {
          name: "keepFromSource",
          label: "Copy From Source",
          type: "select",
          required: false,
          options: [
            { value: "all", label: "All" },
            { value: "attachments", label: "Attachments" },
            { value: "checklists", label: "Checklists" },
            { value: "comments", label: "Comments" },
            { value: "customFields", label: "Custom Fields" },
            { value: "labels", label: "Labels" },
            { value: "members", label: "Members" },
            { value: "stickers", label: "Stickers" },
          ],
          description: "What to copy from the source card",
        },
        {
          name: "address",
          label: "Address",
          type: "text",
          required: false,
          placeholder: "Enter address for card location (optional)...",
          description: "Address for the card location",
        },
        {
          name: "locationName",
          label: "Location Name",
          type: "text",
          required: false,
          placeholder: "Enter location name (optional)...",
          description: "Name of the location",
        },
        {
          name: "coordinates",
          label: "Coordinates",
          type: "text",
          required: false,
          placeholder: "Enter coordinates (latitude,longitude) (optional)...",
          description: "Coordinates for the card location",
        },
      ],
    };
  },
});

export const createListFormTool = tool({
  description: "Generate an interactive form for creating a new Trello list. This tool should be called when the user wants to create a list and needs to fill out the details.",
  inputSchema: z.object({
    trigger: z.string().describe("The user's request that triggered this form generation"),
  }),
  execute: async ({ trigger }) => {
    return {
      formType: "createList",
      title: "Create New List",
      description: "Fill out the details below to create a new Trello list",
      fields: [
        {
          name: "boardId",
          label: "Board ID",
          type: "text",
          required: true,
          placeholder: "Enter the board ID where this list should be created...",
        },
        {
          name: "name",
          label: "List Name",
          type: "text",
          required: true,
          placeholder: "Enter list name...",
        },
        {
          name: "position",
          label: "Position",
          type: "select",
          required: false,
          options: [
            { value: "top", label: "Top" },
            { value: "bottom", label: "Bottom" },
          ],
          defaultValue: "bottom",
          description: "Position of the list in the board",
        },
        {
          name: "closed",
          label: "Closed",
          type: "checkbox",
          required: false,
          defaultValue: false,
          description: "Whether the list should be closed",
        },
        {
          name: "idListSource",
          label: "Source List ID",
          type: "text",
          required: false,
          placeholder: "Enter source list ID to copy from (optional)...",
          description: "ID of a list to copy from",
        },
        {
          name: "subscribe",
          label: "Subscribe",
          type: "checkbox",
          required: false,
          defaultValue: false,
          description: "Subscribe to the list",
        },
      ],
    };
  },
});

export const createWorkspaceFormTool = tool({
  description: "Generate an interactive form for creating a new Trello workspace. This tool should be called when the user wants to create a workspace and needs to fill out the details.",
  inputSchema: z.object({
    trigger: z.string().describe("The user's request that triggered this form generation"),
  }),
  execute: async ({ trigger }) => {
    return {
      formType: "createWorkspace",
      title: "Create New Workspace",
      description: "Fill out the details below to create a new Trello workspace",
      fields: [
        {
          name: "displayName",
          label: "Workspace Name",
          type: "text",
          required: true,
          placeholder: "Enter workspace name...",
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          required: false,
          placeholder: "Enter workspace description (optional)...",
        },
        {
          name: "name",
          label: "Short Name",
          type: "text",
          required: false,
          placeholder: "Enter short name (optional)...",
          description: "Will be generated from display name if not provided",
        },
        {
          name: "website",
          label: "Website",
          type: "url",
          required: false,
          placeholder: "Enter website URL (optional)...",
        },
        {
          name: "logo",
          label: "Logo URL",
          type: "url",
          required: false,
          placeholder: "Enter logo URL (optional)...",
        },
        // Workspace Preferences Section
        {
          name: "prefs_permissionLevel",
          label: "Permission Level",
          type: "select",
          required: false,
          options: [
            { value: "private", label: "Private" },
            { value: "public", label: "Public" },
            { value: "org", label: "Organization" },
          ],
          description: "Workspace permission level",
        },
        {
          name: "prefs_externalMembersDisabled",
          label: "Disable External Members",
          type: "checkbox",
          required: false,
          defaultValue: false,
          description: "Disable external members",
        },
        {
          name: "prefs_selfJoin",
          label: "Allow Self Join",
          type: "checkbox",
          required: false,
          defaultValue: false,
          description: "Allow members to join without invitation",
        },
        {
          name: "prefs_cardCovers",
          label: "Card Covers",
          type: "checkbox",
          required: false,
          defaultValue: true,
          description: "Show card covers",
        },
        {
          name: "prefs_hideVotes",
          label: "Hide Votes",
          type: "checkbox",
          required: false,
          defaultValue: false,
          description: "Hide vote counts",
        },
        {
          name: "prefs_invitations",
          label: "Invitations",
          type: "select",
          required: false,
          options: [
            { value: "disabled", label: "Disabled" },
            { value: "enabled", label: "Enabled" },
            { value: "members", label: "Members Only" },
          ],
          description: "Who can invite members",
        },
        {
          name: "prefs_voting",
          label: "Voting",
          type: "select",
          required: false,
          options: [
            { value: "disabled", label: "Disabled" },
            { value: "enabled", label: "Enabled" },
            { value: "members", label: "Members Only" },
          ],
          description: "Who can vote on cards",
        },
        {
          name: "prefs_comments",
          label: "Comments",
          type: "select",
          required: false,
          options: [
            { value: "disabled", label: "Disabled" },
            { value: "enabled", label: "Enabled" },
            { value: "members", label: "Members Only" },
          ],
          description: "Who can comment on cards",
        },
        {
          name: "prefs_background",
          label: "Background",
          type: "text",
          required: false,
          placeholder: "Background color or image...",
          description: "Workspace background",
        },
        {
          name: "prefs_backgroundColor",
          label: "Background Color",
          type: "color",
          required: false,
          description: "Workspace background color",
        },
        {
          name: "prefs_backgroundBrightness",
          label: "Background Brightness",
          type: "select",
          required: false,
          options: [
            { value: "dark", label: "Dark" },
            { value: "light", label: "Light" },
          ],
          description: "Background brightness",
        },
      ],
    };
  },
});

export const createLabelFormTool = tool({
  description: "Generate an interactive form for creating a new Trello label. This tool should be called when the user wants to create a label and needs to fill out the details.",
  inputSchema: z.object({
    trigger: z.string().describe("The user's request that triggered this form generation"),
  }),
  execute: async ({ trigger }) => {
    return {
      formType: "createLabel",
      title: "Create New Label",
      description: "Fill out the details below to create a new Trello label",
      fields: [
        {
          name: "boardId",
          label: "Board ID",
          type: "text",
          required: true,
          placeholder: "Enter the board ID where this label should be created...",
        },
        {
          name: "name",
          label: "Label Name",
          type: "text",
          required: true,
          placeholder: "Enter label name...",
        },
        {
          name: "color",
          label: "Color",
          type: "select",
          required: true,
          options: [
            { value: "yellow", label: "Yellow" },
            { value: "purple", label: "Purple" },
            { value: "blue", label: "Blue" },
            { value: "red", label: "Red" },
            { value: "green", label: "Green" },
            { value: "orange", label: "Orange" },
            { value: "black", label: "Black" },
            { value: "sky", label: "Sky" },
            { value: "pink", label: "Pink" },
            { value: "lime", label: "Lime" },
          ],
          description: "Choose a color for the label",
        },
        {
          name: "cardId",
          label: "Card ID",
          type: "text",
          required: false,
          placeholder: "Enter card ID to add label to immediately (optional)...",
          description: "Optional: Add this label to a specific card immediately",
        },
      ],
    };
  },
});

export const createChecklistFormTool = tool({
  description: "Generate an interactive form for creating a new Trello checklist. This tool should be called when the user wants to create a checklist and needs to fill out the details.",
  inputSchema: z.object({
    trigger: z.string().describe("The user's request that triggered this form generation"),
  }),
  execute: async ({ trigger }) => {
    return {
      formType: "createChecklist",
      title: "Create New Checklist",
      description: "Fill out the details below to create a new Trello checklist",
      fields: [
        {
          name: "cardId",
          label: "Card ID",
          type: "text",
          required: true,
          placeholder: "Enter the card ID where this checklist should be created...",
        },
        {
          name: "name",
          label: "Checklist Name",
          type: "text",
          required: true,
          placeholder: "Enter checklist name...",
        },
        {
          name: "idChecklistSource",
          label: "Source Checklist ID",
          type: "text",
          required: false,
          placeholder: "Enter source checklist ID to copy from (optional)...",
          description: "ID of a checklist to copy from",
        },
        {
          name: "pos",
          label: "Position",
          type: "select",
          required: false,
          options: [
            { value: "top", label: "Top" },
            { value: "bottom", label: "Bottom" },
          ],
          defaultValue: "bottom",
          description: "Position of the checklist in the card",
        },
      ],
    };
  },
});

export const createAttachmentFormTool = tool({
  description: "Generate an interactive form for creating a new Trello attachment. This tool should be called when the user wants to create an attachment and needs to fill out the details.",
  inputSchema: z.object({
    trigger: z.string().describe("The user's request that triggered this form generation"),
  }),
  execute: async ({ trigger }) => {
    return {
      formType: "createAttachment",
      title: "Create New Attachment",
      description: "Fill out the details below to create a new Trello attachment",
      fields: [
        {
          name: "cardId",
          label: "Card ID",
          type: "text",
          required: true,
          placeholder: "Enter the card ID where this attachment should be added...",
        },
        {
          name: "url",
          label: "File URL",
          type: "url",
          required: false,
          placeholder: "Enter URL of the file to attach (optional)...",
          description: "URL of the file to attach",
        },
        {
          name: "name",
          label: "Attachment Name",
          type: "text",
          required: false,
          placeholder: "Enter name for the attachment (optional)...",
          description: "Name for the attachment",
        },
        {
          name: "mimeType",
          label: "MIME Type",
          type: "text",
          required: false,
          placeholder: "Enter MIME type (optional)...",
          description: "MIME type of the attachment",
        },
        {
          name: "file",
          label: "File Data",
          type: "file",
          required: false,
          description: "Upload a file (Base64 encoded data)",
        },
      ],
    };
  },
});

// Export all client-side form tools
export const clientSideFormTools = {
  createBoardForm: createBoardFormTool,
  createCardForm: createCardFormTool,
  createListForm: createListFormTool,
  createWorkspaceForm: createWorkspaceFormTool,
  createLabelForm: createLabelFormTool,
  createChecklistForm: createChecklistFormTool,
  createAttachmentForm: createAttachmentFormTool,
};
