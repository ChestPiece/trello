import { tool } from "ai";
import { z } from "zod";

// Client-side form tools that generate interactive UI instead of executing immediately
// These tools match the exact schemas from the existing Trello tools

// ===== FORM TOOLS =====

export const createBoardFormTool = tool({
  description:
    "Generate an interactive form for creating a new Trello board. This tool should be called when the user wants to create a board and needs to fill out the details.",
  inputSchema: z.object({
    trigger: z
      .string()
      .describe("The user's request that triggered this form generation"),
  }),
  execute: async () => {
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
      ],
    };
  },
});

export const createCardFormTool = tool({
  description:
    "Generate an interactive form for creating a new Trello card. This tool should be called when the user wants to create a card and needs to fill out the details.",
  inputSchema: z.object({
    trigger: z
      .string()
      .describe("The user's request that triggered this form generation"),
  }),
  execute: async () => {
    // Note: Dynamic data fetching should be handled by the form component
    // This tool only generates the form structure
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
          name: "idBoard",
          label: "Board",
          type: "dynamic-select",
          required: true,
          options: [],
          dependsOn: null,
          description: "Select the board where the card will be created",
        },
        {
          name: "idList",
          label: "List",
          type: "dynamic-select",
          required: true,
          dependsOn: "idBoard",
          options: [],
          description: "Select the list where the card will be created",
          placeholder: "Select a board first...",
        },
        {
          name: "due",
          label: "Due Date",
          type: "datetime-local",
          required: false,
          description: "Due date for the card",
        },
      ],
    };
  },
});

export const createListFormTool = tool({
  description:
    "Generate an interactive form for creating a new Trello list. This tool should be called when the user wants to create a list and needs to fill out the details.",
  inputSchema: z.object({
    trigger: z
      .string()
      .describe("The user's request that triggered this form generation"),
  }),
  execute: async () => {
    // Note: Dynamic data fetching should be handled by the form component
    // This tool only generates the form structure
    const boardOptions: Array<{ value: string; label: string }> = [];

    return {
      formType: "createList",
      title: "Create New List",
      description: "Fill out the details below to create a new Trello list",
      fields: [
        {
          name: "idBoard",
          label: "Board",
          type: "select",
          required: true,
          options: boardOptions,
          description: "Select the board where the list will be created",
        },
        {
          name: "name",
          label: "List Name",
          type: "text",
          required: true,
          placeholder: "Enter list name...",
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          required: false,
          placeholder: "Enter list description (optional)...",
        },
      ],
    };
  },
});

export const createWorkspaceFormTool = tool({
  description:
    "Generate an interactive form for creating a new Trello workspace. This tool should be called when the user wants to create a workspace and needs to fill out the details.",
  inputSchema: z.object({
    trigger: z
      .string()
      .describe("The user's request that triggered this form generation"),
  }),
  execute: async () => {
    return {
      formType: "createWorkspace",
      title: "Create New Workspace",
      description:
        "Fill out the details below to create a new Trello workspace",
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
  description:
    "Generate an interactive form for creating a new Trello label. This tool should be called when the user wants to create a label and needs to fill out the details.",
  inputSchema: z.object({
    trigger: z
      .string()
      .describe("The user's request that triggered this form generation"),
  }),
  execute: async () => {
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
          placeholder:
            "Enter the board ID where this label should be created...",
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
          placeholder:
            "Enter card ID to add label to immediately (optional)...",
          description:
            "Optional: Add this label to a specific card immediately",
        },
      ],
    };
  },
});

export const createChecklistFormTool = tool({
  description:
    "Generate an interactive form for creating a new Trello checklist. This tool should be called when the user wants to create a checklist and needs to fill out the details.",
  inputSchema: z.object({
    trigger: z
      .string()
      .describe("The user's request that triggered this form generation"),
  }),
  execute: async () => {
    return {
      formType: "createChecklist",
      title: "Create New Checklist",
      description:
        "Fill out the details below to create a new Trello checklist",
      fields: [
        {
          name: "cardId",
          label: "Card ID",
          type: "text",
          required: true,
          placeholder:
            "Enter the card ID where this checklist should be created...",
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
  description:
    "Generate an interactive form for creating a new Trello attachment. This tool should be called when the user wants to create an attachment and needs to fill out the details.",
  inputSchema: z.object({
    trigger: z
      .string()
      .describe("The user's request that triggered this form generation"),
  }),
  execute: async () => {
    return {
      formType: "createAttachment",
      title: "Create New Attachment",
      description:
        "Fill out the details below to create a new Trello attachment",
      fields: [
        {
          name: "cardId",
          label: "Card ID",
          type: "text",
          required: true,
          placeholder:
            "Enter the card ID where this attachment should be added...",
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

// ============================================
// UPDATE FORM TOOLS
// ============================================

export const updateBoardFormTool = tool({
  description:
    "Generate an interactive form for updating an existing Trello board. This tool should be called when the user wants to update a board and needs to modify its details.",
  inputSchema: z.object({
    boardId: z.string().describe("The ID of the board to update"),
    currentName: z.string().optional().describe("Current board name"),
    currentDescription: z
      .string()
      .optional()
      .describe("Current board description"),
    currentVisibility: z
      .string()
      .optional()
      .describe("Current board visibility"),
  }),
  execute: async ({
    boardId,
    currentName,
    currentDescription,
    currentVisibility,
  }) => {
    return {
      formType: "updateBoard",
      title: "Update Board",
      description: `Update the details for board: ${currentName || boardId}`,
      fields: [
        {
          name: "boardId",
          type: "hidden",
          value: boardId,
        },
        {
          name: "name",
          label: "Board Name",
          type: "text",
          required: false,
          placeholder: "Enter new board name...",
          defaultValue: currentName || "",
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          required: false,
          placeholder: "Enter new board description...",
          defaultValue: currentDescription || "",
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
          defaultValue: currentVisibility || "private",
        },
        {
          name: "closed",
          label: "Archive Board",
          type: "checkbox",
          required: false,
          defaultValue: false,
          description: "Archive this board (can be unarchived later)",
        },
      ],
    };
  },
});

export const updateCardFormTool = tool({
  description:
    "Generate an interactive form for updating an existing Trello card. This tool should be called when the user wants to update a card and needs to modify its details.",
  inputSchema: z.object({
    cardId: z.string().describe("The ID of the card to update"),
    currentName: z.string().optional().describe("Current card name"),
    currentDescription: z
      .string()
      .optional()
      .describe("Current card description"),
    currentListId: z.string().optional().describe("Current list ID"),
    currentBoardId: z.string().optional().describe("Current board ID"),
    currentDue: z.string().optional().describe("Current due date"),
  }),
  execute: async ({
    cardId,
    currentName,
    currentDescription,
    currentListId,
    currentBoardId,
    currentDue,
  }) => {
    // Note: Dynamic data fetching should be handled by the form component
    // This tool only generates the form structure
    const boardOptions: Array<{ value: string; label: string }> = [];

    return {
      formType: "updateCard",
      title: "Update Card",
      description: `Update the details for card: ${currentName || cardId}`,
      fields: [
        {
          name: "cardId",
          type: "hidden",
          value: cardId,
        },
        {
          name: "name",
          label: "Card Name",
          type: "text",
          required: false,
          placeholder: "Enter new card name...",
          defaultValue: currentName || "",
        },
        {
          name: "desc",
          label: "Description",
          type: "textarea",
          required: false,
          placeholder: "Enter new card description...",
          defaultValue: currentDescription || "",
        },
        {
          name: "idBoard",
          label: "Board",
          type: "select",
          required: false,
          options: boardOptions,
          defaultValue: currentBoardId || "",
          description: "Move card to a different board (optional)",
        },
        {
          name: "idList",
          label: "List",
          type: "dynamic-select",
          required: false,
          dependsOn: "idBoard",
          description: "Move card to a different list",
          placeholder: "Select a board first...",
          defaultValue: currentListId || "",
        },
        {
          name: "due",
          label: "Due Date",
          type: "datetime-local",
          required: false,
          description: "Due date for the card",
          defaultValue: currentDue || "",
        },
        {
          name: "closed",
          label: "Archive Card",
          type: "checkbox",
          required: false,
          defaultValue: false,
          description: "Archive this card (can be unarchived later)",
        },
      ],
    };
  },
});

export const updateListFormTool = tool({
  description:
    "Generate an interactive form for updating an existing Trello list. This tool should be called when the user wants to update a list and needs to modify its details.",
  inputSchema: z.object({
    listId: z.string().describe("The ID of the list to update"),
    currentName: z.string().optional().describe("Current list name"),
  }),
  execute: async ({ listId, currentName }) => {
    return {
      formType: "updateList",
      title: "Update List",
      description: `Update the details for list: ${currentName || listId}`,
      fields: [
        {
          name: "listId",
          type: "hidden",
          value: listId,
        },
        {
          name: "name",
          label: "List Name",
          type: "text",
          required: false,
          placeholder: "Enter new list name...",
          defaultValue: currentName || "",
        },
        {
          name: "closed",
          label: "Archive List",
          type: "checkbox",
          required: false,
          defaultValue: false,
          description: "Archive this list (can be unarchived later)",
        },
        {
          name: "pos",
          label: "Position",
          type: "select",
          required: false,
          options: [
            { value: "top", label: "Move to Top" },
            { value: "bottom", label: "Move to Bottom" },
          ],
          description: "Position of the list on the board",
        },
      ],
    };
  },
});

export const updateLabelFormTool = tool({
  description:
    "Generate an interactive form for updating an existing Trello label. This tool should be called when the user wants to update a label and needs to modify its details.",
  inputSchema: z.object({
    labelId: z.string().describe("The ID of the label to update"),
    currentName: z.string().optional().describe("Current label name"),
    currentColor: z.string().optional().describe("Current label color"),
  }),
  execute: async ({ labelId, currentName, currentColor }) => {
    return {
      formType: "updateLabel",
      title: "Update Label",
      description: `Update the details for label: ${currentName || labelId}`,
      fields: [
        {
          name: "labelId",
          type: "hidden",
          value: labelId,
        },
        {
          name: "name",
          label: "Label Name",
          type: "text",
          required: false,
          placeholder: "Enter new label name...",
          defaultValue: currentName || "",
        },
        {
          name: "color",
          label: "Color",
          type: "select",
          required: false,
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
          defaultValue: currentColor || "blue",
          description: "Choose a new color for the label",
        },
      ],
    };
  },
});

export const updateChecklistFormTool = tool({
  description:
    "Generate an interactive form for updating an existing Trello checklist. This tool should be called when the user wants to update a checklist and needs to modify its details.",
  inputSchema: z.object({
    checklistId: z.string().describe("The ID of the checklist to update"),
    currentName: z.string().optional().describe("Current checklist name"),
  }),
  execute: async ({ checklistId, currentName }) => {
    return {
      formType: "updateChecklist",
      title: "Update Checklist",
      description: `Update the details for checklist: ${
        currentName || checklistId
      }`,
      fields: [
        {
          name: "checklistId",
          type: "hidden",
          value: checklistId,
        },
        {
          name: "name",
          label: "Checklist Name",
          type: "text",
          required: false,
          placeholder: "Enter new checklist name...",
          defaultValue: currentName || "",
        },
        {
          name: "pos",
          label: "Position",
          type: "select",
          required: false,
          options: [
            { value: "top", label: "Move to Top" },
            { value: "bottom", label: "Move to Bottom" },
          ],
          description: "Position of the checklist in the card",
        },
      ],
    };
  },
});

export const updateChecklistItemFormTool = tool({
  description:
    "Generate an interactive form for updating an existing Trello checklist item. This tool should be called when the user wants to update a checklist item and needs to modify its details.",
  inputSchema: z.object({
    checklistId: z
      .string()
      .describe("The ID of the checklist containing the item"),
    checkItemId: z.string().describe("The ID of the checklist item to update"),
    currentName: z.string().optional().describe("Current item name"),
    currentState: z
      .string()
      .optional()
      .describe("Current item state (complete/incomplete)"),
  }),
  execute: async ({ checklistId, checkItemId, currentName, currentState }) => {
    return {
      formType: "updateChecklistItem",
      title: "Update Checklist Item",
      description: `Update the details for checklist item: ${
        currentName || checkItemId
      }`,
      fields: [
        {
          name: "checklistId",
          type: "hidden",
          value: checklistId,
        },
        {
          name: "checkItemId",
          type: "hidden",
          value: checkItemId,
        },
        {
          name: "name",
          label: "Item Name",
          type: "text",
          required: false,
          placeholder: "Enter new item name...",
          defaultValue: currentName || "",
        },
        {
          name: "state",
          label: "State",
          type: "select",
          required: false,
          options: [
            { value: "complete", label: "Complete" },
            { value: "incomplete", label: "Incomplete" },
          ],
          defaultValue: currentState || "incomplete",
          description: "Mark item as complete or incomplete",
        },
        {
          name: "pos",
          label: "Position",
          type: "select",
          required: false,
          options: [
            { value: "top", label: "Move to Top" },
            { value: "bottom", label: "Move to Bottom" },
          ],
          description: "Position of the item in the checklist",
        },
      ],
    };
  },
});

export const updateWorkspaceFormTool = tool({
  description:
    "Generate an interactive form for updating an existing Trello workspace. This tool should be called when the user wants to update a workspace and needs to modify its details.",
  inputSchema: z.object({
    workspaceId: z.string().describe("The ID of the workspace to update"),
    currentDisplayName: z
      .string()
      .optional()
      .describe("Current workspace display name"),
    currentDescription: z
      .string()
      .optional()
      .describe("Current workspace description"),
    currentWebsite: z.string().optional().describe("Current workspace website"),
  }),
  execute: async ({
    workspaceId,
    currentDisplayName,
    currentDescription,
    currentWebsite,
  }) => {
    return {
      formType: "updateWorkspace",
      title: "Update Workspace",
      description: `Update the details for workspace: ${
        currentDisplayName || workspaceId
      }`,
      fields: [
        {
          name: "workspaceId",
          type: "hidden",
          value: workspaceId,
        },
        {
          name: "displayName",
          label: "Workspace Name",
          type: "text",
          required: false,
          placeholder: "Enter new workspace name...",
          defaultValue: currentDisplayName || "",
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          required: false,
          placeholder: "Enter new workspace description...",
          defaultValue: currentDescription || "",
        },
        {
          name: "website",
          label: "Website",
          type: "url",
          required: false,
          placeholder: "Enter new website URL...",
          defaultValue: currentWebsite || "",
        },
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
      ],
    };
  },
});

// ============================================
// DELETE FORM TOOLS
// ============================================

export const deleteBoardFormTool = tool({
  description:
    "Generate an interactive form for deleting a Trello board. This tool should be called when the user wants to delete a board and needs to confirm the action.",
  inputSchema: z.object({
    boardId: z.string().describe("The ID of the board to delete"),
    boardName: z
      .string()
      .optional()
      .describe("The name of the board to delete"),
  }),
  execute: async ({ boardId, boardName }) => {
    return {
      formType: "deleteBoard",
      title: "Delete Board",
      description: `Are you sure you want to delete the board "${
        boardName || boardId
      }"? This action cannot be undone.`,
      fields: [
        {
          name: "boardId",
          type: "hidden",
          value: boardId,
        },
        {
          name: "confirmation",
          label: "Type 'DELETE' to confirm",
          type: "text",
          required: true,
          placeholder: "Type DELETE to confirm deletion...",
          description:
            "This action will permanently delete the board and all its data.",
        },
        {
          name: "archiveAllCards",
          label: "Archive All Cards",
          type: "checkbox",
          required: false,
          defaultValue: true,
          description: "Archive all cards in the board before deletion",
        },
      ],
    };
  },
});

export const deleteCardFormTool = tool({
  description:
    "Generate an interactive form for deleting a Trello card. This tool should be called when the user wants to delete a card and needs to confirm the action.",
  inputSchema: z.object({
    cardId: z.string().describe("The ID of the card to delete"),
    cardName: z.string().optional().describe("The name of the card to delete"),
  }),
  execute: async ({ cardId, cardName }) => {
    return {
      formType: "deleteCard",
      title: "Delete Card",
      description: `Are you sure you want to delete the card "${
        cardName || cardId
      }"? This action cannot be undone.`,
      fields: [
        {
          name: "cardId",
          type: "hidden",
          value: cardId,
        },
        {
          name: "confirmation",
          label: "Type 'DELETE' to confirm",
          type: "text",
          required: true,
          placeholder: "Type DELETE to confirm deletion...",
          description:
            "This action will permanently delete the card and all its data.",
        },
      ],
    };
  },
});

export const deleteListFormTool = tool({
  description:
    "Generate an interactive form for deleting a Trello list. This tool should be called when the user wants to delete a list and needs to confirm the action.",
  inputSchema: z.object({
    listId: z.string().describe("The ID of the list to delete"),
    listName: z.string().optional().describe("The name of the list to delete"),
  }),
  execute: async ({ listId, listName }) => {
    return {
      formType: "deleteList",
      title: "Delete List",
      description: `Are you sure you want to delete the list "${
        listName || listId
      }"? This action cannot be undone.`,
      fields: [
        {
          name: "listId",
          type: "hidden",
          value: listId,
        },
        {
          name: "confirmation",
          label: "Type 'DELETE' to confirm",
          type: "text",
          required: true,
          placeholder: "Type DELETE to confirm deletion...",
          description:
            "This action will permanently delete the list and all its cards.",
        },
        {
          name: "archiveAllCards",
          label: "Archive All Cards",
          type: "checkbox",
          required: false,
          defaultValue: true,
          description: "Archive all cards in the list before deletion",
        },
      ],
    };
  },
});

export const deleteWorkspaceFormTool = tool({
  description:
    "Generate an interactive form for deleting a Trello workspace. This tool should be called when the user wants to delete a workspace and needs to confirm the action.",
  inputSchema: z.object({
    workspaceId: z.string().describe("The ID of the workspace to delete"),
    workspaceName: z
      .string()
      .optional()
      .describe("The name of the workspace to delete"),
  }),
  execute: async ({ workspaceId, workspaceName }) => {
    return {
      formType: "deleteWorkspace",
      title: "Delete Workspace",
      description: `Are you sure you want to delete the workspace "${
        workspaceName || workspaceId
      }"? This action cannot be undone.`,
      fields: [
        {
          name: "workspaceId",
          type: "hidden",
          value: workspaceId,
        },
        {
          name: "confirmation",
          label: "Type 'DELETE' to confirm",
          type: "text",
          required: true,
          placeholder: "Type DELETE to confirm deletion...",
          description:
            "This action will permanently delete the workspace and all its data.",
        },
      ],
    };
  },
});

// Archive/Unarchive List Form Tools
export const archiveListFormTool = tool({
  description:
    "Generate an interactive form for archiving a Trello list. This tool should be called when the user wants to archive a list.",
  inputSchema: z.object({
    listId: z.string().describe("The ID of the list to archive"),
    listName: z.string().optional().describe("The name of the list to archive"),
  }),
  execute: async ({ listId, listName }) => {
    return {
      formType: "archiveList",
      title: "Archive List",
      description: `Archive the list "${
        listName || listId
      }". Archived lists are hidden but can be restored later.`,
      fields: [
        {
          name: "listId",
          type: "hidden",
          value: listId,
        },
        {
          name: "confirmation",
          label: "Confirm Archive",
          type: "checkbox",
          required: true,
          defaultValue: false,
          description:
            "I understand that this list will be archived and hidden from the board.",
        },
      ],
    };
  },
});

export const unarchiveListFormTool = tool({
  description:
    "Generate an interactive form for unarchiving a Trello list. This tool should be called when the user wants to unarchive a list.",
  inputSchema: z.object({
    listId: z.string().describe("The ID of the list to unarchive"),
    listName: z
      .string()
      .optional()
      .describe("The name of the list to unarchive"),
  }),
  execute: async ({ listId, listName }) => {
    return {
      formType: "unarchiveList",
      title: "Unarchive List",
      description: `Unarchive the list "${
        listName || listId
      }". This will make the list visible on the board again.`,
      fields: [
        {
          name: "listId",
          type: "hidden",
          value: listId,
        },
        {
          name: "confirmation",
          label: "Confirm Unarchive",
          type: "checkbox",
          required: true,
          defaultValue: false,
          description:
            "I understand that this list will be restored and visible on the board.",
        },
      ],
    };
  },
});

// Member Form Tools
export const addMemberToBoardFormTool = tool({
  description:
    "Generate an interactive form for adding a member to a Trello board. This tool should be called when the user wants to add a member to a board.",
  inputSchema: z.object({
    boardId: z.string().describe("The ID of the board to add member to"),
    boardName: z.string().optional().describe("The name of the board"),
  }),
  execute: async ({ boardId, boardName }) => {
    // Note: Dynamic data fetching should be handled by the form component
    // This tool only generates the form structure
    const memberOptions: Array<{ value: string; label: string }> = [];

    return {
      formType: "addMemberToBoard",
      title: "Add Member to Board",
      description: `Add a member to the board "${boardName || boardId}".`,
      fields: [
        {
          name: "boardId",
          type: "hidden",
          value: boardId,
        },
        {
          name: "memberId",
          label: "Select Member",
          type: "select",
          required: true,
          options: memberOptions,
          placeholder: "Choose a member to add...",
          description: "Select the member you want to add to this board.",
        },
        {
          name: "type",
          label: "Member Type",
          type: "select",
          required: false,
          options: [
            { value: "normal", label: "Normal" },
            { value: "admin", label: "Admin" },
            { value: "observer", label: "Observer" },
          ],
          defaultValue: "normal",
          description: "Choose the permission level for this member.",
        },
      ],
    };
  },
});

export const removeMemberFromBoardFormTool = tool({
  description:
    "Generate an interactive form for removing a member from a Trello board. This tool should be called when the user wants to remove a member from a board.",
  inputSchema: z.object({
    boardId: z.string().describe("The ID of the board to remove member from"),
    boardName: z.string().optional().describe("The name of the board"),
  }),
  execute: async ({ boardId, boardName }) => {
    // Note: Dynamic data fetching should be handled by the form component
    // This tool only generates the form structure
    const memberOptions: Array<{ value: string; label: string }> = [];

    return {
      formType: "removeMemberFromBoard",
      title: "Remove Member from Board",
      description: `Remove a member from the board "${boardName || boardId}".`,
      fields: [
        {
          name: "boardId",
          type: "hidden",
          value: boardId,
        },
        {
          name: "memberId",
          label: "Select Member",
          type: "select",
          required: true,
          options: memberOptions,
          placeholder: "Choose a member to remove...",
          description: "Select the member you want to remove from this board.",
        },
        {
          name: "confirmation",
          label: "Confirm Removal",
          type: "checkbox",
          required: true,
          defaultValue: false,
          description:
            "I understand that this member will be removed from the board.",
        },
      ],
    };
  },
});

// Label Form Tools
export const addLabelToCardFormTool = tool({
  description:
    "Generate an interactive form for adding a label to a Trello card. This tool should be called when the user wants to add a label to a card.",
  inputSchema: z.object({
    cardId: z.string().describe("The ID of the card to add label to"),
    cardName: z.string().optional().describe("The name of the card"),
  }),
  execute: async ({ cardId, cardName }) => {
    // Note: Dynamic data fetching should be handled by the form component
    // This tool only generates the form structure
    const labelOptions: Array<{ value: string; label: string }> = [];

    return {
      formType: "addLabelToCard",
      title: "Add Label to Card",
      description: `Add a label to the card "${cardName || cardId}".`,
      fields: [
        {
          name: "cardId",
          type: "hidden",
          value: cardId,
        },
        {
          name: "labelId",
          label: "Select Label",
          type: "select",
          required: true,
          options: labelOptions,
          placeholder: "Choose a label to add...",
          description: "Select the label you want to add to this card.",
        },
      ],
    };
  },
});

export const removeLabelFromCardFormTool = tool({
  description:
    "Generate an interactive form for removing a label from a Trello card. This tool should be called when the user wants to remove a label from a card.",
  inputSchema: z.object({
    cardId: z.string().describe("The ID of the card to remove label from"),
    cardName: z.string().optional().describe("The name of the card"),
  }),
  execute: async ({ cardId, cardName }) => {
    // Note: Dynamic data fetching should be handled by the form component
    // This tool only generates the form structure
    const labelOptions: Array<{ value: string; label: string }> = [];

    return {
      formType: "removeLabelFromCard",
      title: "Remove Label from Card",
      description: `Remove a label from the card "${cardName || cardId}".`,
      fields: [
        {
          name: "cardId",
          type: "hidden",
          value: cardId,
        },
        {
          name: "labelId",
          label: "Select Label",
          type: "select",
          required: true,
          options: labelOptions,
          placeholder: "Choose a label to remove...",
          description: "Select the label you want to remove from this card.",
        },
        {
          name: "confirmation",
          label: "Confirm Removal",
          type: "checkbox",
          required: true,
          defaultValue: false,
          description:
            "I understand that this label will be removed from the card.",
        },
      ],
    };
  },
});

// Attachment Form Tools
export const deleteAttachmentFormTool = tool({
  description:
    "Generate an interactive form for deleting a Trello attachment. This tool should be called when the user wants to delete an attachment.",
  inputSchema: z.object({
    attachmentId: z.string().describe("The ID of the attachment to delete"),
    attachmentName: z
      .string()
      .optional()
      .describe("The name of the attachment"),
  }),
  execute: async ({ attachmentId, attachmentName }) => {
    return {
      formType: "deleteAttachment",
      title: "Delete Attachment",
      description: `Are you sure you want to delete the attachment "${
        attachmentName || attachmentId
      }"? This action cannot be undone.`,
      fields: [
        {
          name: "attachmentId",
          type: "hidden",
          value: attachmentId,
        },
        {
          name: "confirmation",
          label: "Type 'DELETE' to confirm",
          type: "text",
          required: true,
          placeholder: "Type DELETE to confirm deletion...",
          description: "This action will permanently delete the attachment.",
        },
      ],
    };
  },
});

// Checklist Item Form Tools
export const deleteChecklistItemFormTool = tool({
  description:
    "Generate an interactive form for deleting a Trello checklist item. This tool should be called when the user wants to delete a checklist item.",
  inputSchema: z.object({
    checklistItemId: z
      .string()
      .describe("The ID of the checklist item to delete"),
    checklistItemName: z
      .string()
      .optional()
      .describe("The name of the checklist item"),
  }),
  execute: async ({ checklistItemId, checklistItemName }) => {
    return {
      formType: "deleteChecklistItem",
      title: "Delete Checklist Item",
      description: `Are you sure you want to delete the checklist item "${
        checklistItemName || checklistItemId
      }"? This action cannot be undone.`,
      fields: [
        {
          name: "checklistItemId",
          type: "hidden",
          value: checklistItemId,
        },
        {
          name: "confirmation",
          label: "Type 'DELETE' to confirm",
          type: "text",
          required: true,
          placeholder: "Type DELETE to confirm deletion...",
          description:
            "This action will permanently delete the checklist item.",
        },
      ],
    };
  },
});

// Export all client-side form tools
export const clientSideFormTools = {
  // Create forms
  createBoardForm: createBoardFormTool,
  createCardForm: createCardFormTool,
  createListForm: createListFormTool,
  createWorkspaceForm: createWorkspaceFormTool,
  createLabelForm: createLabelFormTool,
  createChecklistForm: createChecklistFormTool,
  createAttachmentForm: createAttachmentFormTool,

  // Update forms
  updateBoardForm: updateBoardFormTool,
  updateCardForm: updateCardFormTool,
  updateListForm: updateListFormTool,
  updateLabelForm: updateLabelFormTool,
  updateChecklistForm: updateChecklistFormTool,
  updateChecklistItemForm: updateChecklistItemFormTool,
  updateWorkspaceForm: updateWorkspaceFormTool,

  // Delete forms
  deleteBoardForm: deleteBoardFormTool,
  deleteCardForm: deleteCardFormTool,
  deleteListForm: deleteListFormTool,
  deleteWorkspaceForm: deleteWorkspaceFormTool,
  deleteAttachmentForm: deleteAttachmentFormTool,
  deleteChecklistItemForm: deleteChecklistItemFormTool,

  // Archive/Unarchive forms
  archiveListForm: archiveListFormTool,
  unarchiveListForm: unarchiveListFormTool,

  // Member forms
  addMemberToBoardForm: addMemberToBoardFormTool,
  removeMemberFromBoardForm: removeMemberFromBoardFormTool,

  // Label forms
  addLabelToCardForm: addLabelToCardFormTool,
  removeLabelFromCardForm: removeLabelFromCardFormTool,
};
