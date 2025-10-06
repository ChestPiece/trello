import { tool } from "ai";
import { z } from "zod";

const generateWorkspaceFormSchema = z.object({
  action: z
    .enum(["create", "update", "delete"])
    .describe(
      "The specific workspace operation to perform. Use 'create' for new workspaces, 'update' for modifying existing workspace settings, or 'delete' for permanent removal."
    ),
  workspaceId: z
    .string()
    .optional()
    .describe(
      "The unique identifier of the workspace. Required for update and delete operations. Not needed for create operations."
    ),
  initialData: z
    .object({
      name: z
        .string()
        .optional()
        .describe(
          "The workspace name. Required for create operations, optional for updates."
        ),
      description: z
        .string()
        .optional()
        .describe(
          "A detailed description of the workspace's purpose and scope."
        ),
      displayName: z
        .string()
        .optional()
        .describe(
          "The display name shown to users. If not provided, the name will be used."
        ),
    })
    .optional()
    .describe(
      "Pre-filled data for the form. Used primarily for update operations to populate existing values."
    ),
});

export const generateWorkspaceFormTool = tool({
  description:
    "Generate an interactive workspace management form component. Use this tool when users want to create new workspaces, update existing workspace settings, or delete workspaces permanently. The tool returns a specific UI component name that the frontend will render.",
  inputSchema: generateWorkspaceFormSchema,
  execute: async ({ action, workspaceId, initialData }) => {
    // Map action to specific UI component names that the frontend expects
    const componentMap = {
      create: "WorkspaceCreationCard",
      update: "WorkspaceUpdateCard",
      delete: "WorkspaceDeleteCard",
    };

    return {
      ui: componentMap[action],
      message: `Generated ${action} workspace form`,
      action,
      workspaceId,
      initialData,
      metadata: {
        timestamp: Date.now(),
        generatedBy: "generateWorkspaceFormTool",
      },
    };
  },
});
