import { tool } from "ai";
import { z } from "zod";

// Advanced Trello tools with complex input handling and sophisticated functionality

// Advanced Board Management Tools

export const bulkBoardOperationsTool = tool({
  description:
    "Perform bulk operations on multiple Trello boards. Supports creating, updating, or archiving multiple boards at once with advanced filtering and batch processing capabilities.",
  inputSchema: z.object({
    operation: z
      .enum(["create", "update", "archive", "unarchive", "delete"])
      .describe("The bulk operation to perform"),
    boards: z
      .array(
        z.object({
          name: z.string().describe("Board name"),
          description: z.string().optional().describe("Board description"),
          visibility: z
            .enum(["private", "workspace", "public"])
            .optional()
            .describe("Board visibility"),
          workspaceId: z
            .string()
            .optional()
            .describe("Workspace ID for the board"),
          template: z
            .string()
            .optional()
            .describe("Template to use for board creation"),
          labels: z
            .array(z.string())
            .optional()
            .describe("Pre-defined labels for the board"),
          lists: z
            .array(z.string())
            .optional()
            .describe("Pre-defined lists for the board"),
        })
      )
      .describe("Array of board configurations"),
    options: z
      .object({
        skipDuplicates: z
          .boolean()
          .optional()
          .describe("Skip boards that already exist"),
        continueOnError: z
          .boolean()
          .optional()
          .describe("Continue processing even if some operations fail"),
        batchSize: z
          .number()
          .min(1)
          .max(50)
          .optional()
          .describe("Number of boards to process in each batch"),
        delayBetweenBatches: z
          .number()
          .min(0)
          .max(5000)
          .optional()
          .describe("Delay in milliseconds between batches"),
      })
      .optional()
      .describe("Bulk operation options"),
  }),
  execute: async ({ operation, boards, options = {} }) => {
    return {
      formType: "bulkBoardOperations",
      title: `Bulk ${
        operation.charAt(0).toUpperCase() + operation.slice(1)
      } Boards`,
      description: `Perform ${operation} operation on ${boards.length} boards with advanced options`,
      fields: [
        {
          name: "operation",
          type: "hidden",
          value: operation,
        },
        {
          name: "boards",
          type: "hidden",
          value: boards,
        },
        {
          name: "skipDuplicates",
          label: "Skip Duplicates",
          type: "checkbox",
          defaultValue: options.skipDuplicates || false,
          description: "Skip boards that already exist with the same name",
        },
        {
          name: "continueOnError",
          label: "Continue on Error",
          type: "checkbox",
          defaultValue: options.continueOnError || true,
          description: "Continue processing even if some operations fail",
        },
        {
          name: "batchSize",
          label: "Batch Size",
          type: "select",
          required: true,
          defaultValue: options.batchSize || 5,
          options: [
            { value: "1", label: "1 board at a time" },
            { value: "5", label: "5 boards at a time" },
            { value: "10", label: "10 boards at a time" },
            { value: "20", label: "20 boards at a time" },
          ],
          description: "Number of boards to process in each batch",
        },
        {
          name: "delayBetweenBatches",
          label: "Delay Between Batches (ms)",
          type: "select",
          defaultValue: options.delayBetweenBatches || 1000,
          options: [
            { value: "0", label: "No delay" },
            { value: "500", label: "500ms" },
            { value: "1000", label: "1 second" },
            { value: "2000", label: "2 seconds" },
            { value: "5000", label: "5 seconds" },
          ],
          description: "Delay between processing batches to avoid rate limits",
        },
      ],
    };
  },
});

export const advancedCardSearchTool = tool({
  description:
    "Advanced card search with complex filtering, sorting, and grouping capabilities. Supports multiple search criteria, date ranges, member assignments, and custom field filtering.",
  inputSchema: z.object({
    query: z.string().optional().describe("Text search query"),
    filters: z
      .object({
        boards: z
          .array(z.string())
          .optional()
          .describe("Board IDs to search in"),
        lists: z.array(z.string()).optional().describe("List IDs to search in"),
        members: z
          .array(z.string())
          .optional()
          .describe("Member IDs assigned to cards"),
        labels: z.array(z.string()).optional().describe("Label IDs on cards"),
        dueDate: z
          .object({
            start: z.string().optional().describe("Start date (ISO format)"),
            end: z.string().optional().describe("End date (ISO format)"),
            overdue: z
              .boolean()
              .optional()
              .describe("Include only overdue cards"),
          })
          .optional()
          .describe("Due date filtering"),
        createdDate: z
          .object({
            start: z.string().optional().describe("Start date (ISO format)"),
            end: z.string().optional().describe("End date (ISO format)"),
          })
          .optional()
          .describe("Creation date filtering"),
        archived: z.boolean().optional().describe("Include archived cards"),
        subscribed: z
          .boolean()
          .optional()
          .describe("Include only subscribed cards"),
      })
      .optional()
      .describe("Advanced filtering options"),
    sorting: z
      .object({
        field: z
          .enum(["name", "dueDate", "created", "modified", "position"])
          .optional()
          .describe("Field to sort by"),
        order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
      })
      .optional()
      .describe("Sorting options"),
    grouping: z
      .enum(["board", "list", "member", "label", "dueDate", "none"])
      .optional()
      .describe("Group results by field"),
    limit: z
      .number()
      .min(1)
      .max(1000)
      .optional()
      .describe("Maximum number of results"),
  }),
  execute: async ({ query, filters, sorting, grouping, limit }) => {
    return {
      formType: "advancedCardSearch",
      title: "Advanced Card Search",
      description:
        "Search for cards with complex filtering and sorting options",
      fields: [
        {
          name: "query",
          label: "Search Query",
          type: "text",
          placeholder: "Enter search terms...",
          defaultValue: query || "",
          description: "Search in card names, descriptions, and comments",
        },
        {
          name: "boards",
          label: "Boards",
          type: "dynamic-select",
          multiple: true,
          dependsOn: "workspaceId",
          placeholder: "Select boards to search in...",
          description: "Choose specific boards to search in",
        },
        {
          name: "lists",
          label: "Lists",
          type: "dynamic-select",
          multiple: true,
          dependsOn: "boards",
          placeholder: "Select lists to search in...",
          description: "Choose specific lists to search in",
        },
        {
          name: "members",
          label: "Assigned Members",
          type: "dynamic-select",
          multiple: true,
          placeholder: "Select members...",
          description: "Filter by assigned members",
        },
        {
          name: "labels",
          label: "Labels",
          type: "dynamic-select",
          multiple: true,
          placeholder: "Select labels...",
          description: "Filter by card labels",
        },
        {
          name: "dueDateStart",
          label: "Due Date From",
          type: "datetime-local",
          description: "Filter cards due after this date",
        },
        {
          name: "dueDateEnd",
          label: "Due Date To",
          type: "datetime-local",
          description: "Filter cards due before this date",
        },
        {
          name: "overdue",
          label: "Include Overdue Cards",
          type: "checkbox",
          defaultValue: false,
          description: "Include cards that are past their due date",
        },
        {
          name: "archived",
          label: "Include Archived Cards",
          type: "checkbox",
          defaultValue: false,
          description: "Include archived cards in results",
        },
        {
          name: "subscribed",
          label: "Only Subscribed Cards",
          type: "checkbox",
          defaultValue: false,
          description: "Show only cards you're subscribed to",
        },
        {
          name: "sortField",
          label: "Sort By",
          type: "select",
          defaultValue: sorting?.field || "modified",
          options: [
            { value: "name", label: "Name" },
            { value: "dueDate", label: "Due Date" },
            { value: "created", label: "Created Date" },
            { value: "modified", label: "Modified Date" },
            { value: "position", label: "Position" },
          ],
          description: "Field to sort results by",
        },
        {
          name: "sortOrder",
          label: "Sort Order",
          type: "select",
          defaultValue: sorting?.order || "desc",
          options: [
            { value: "asc", label: "Ascending" },
            { value: "desc", label: "Descending" },
          ],
          description: "Order of sorted results",
        },
        {
          name: "grouping",
          label: "Group Results By",
          type: "select",
          defaultValue: grouping || "none",
          options: [
            { value: "none", label: "No Grouping" },
            { value: "board", label: "Board" },
            { value: "list", label: "List" },
            { value: "member", label: "Member" },
            { value: "label", label: "Label" },
            { value: "dueDate", label: "Due Date" },
          ],
          description: "Group search results by field",
        },
        {
          name: "limit",
          label: "Maximum Results",
          type: "select",
          defaultValue: limit || 100,
          options: [
            { value: "25", label: "25 results" },
            { value: "50", label: "50 results" },
            { value: "100", label: "100 results" },
            { value: "250", label: "250 results" },
            { value: "500", label: "500 results" },
            { value: "1000", label: "1000 results" },
          ],
          description: "Maximum number of results to return",
        },
      ],
    };
  },
});

export const smartCardCreationTool = tool({
  description:
    "Intelligent card creation with AI-powered suggestions, templates, and automatic field population based on context and existing patterns.",
  inputSchema: z.object({
    context: z
      .string()
      .describe("Context or description of what the card should accomplish"),
    boardId: z.string().optional().describe("Target board ID"),
    listId: z.string().optional().describe("Target list ID"),
    template: z
      .string()
      .optional()
      .describe("Template to use for card creation"),
    autoSuggest: z
      .boolean()
      .optional()
      .describe("Enable AI-powered suggestions"),
    copyFromCard: z
      .string()
      .optional()
      .describe("Card ID to copy structure from"),
  }),
  execute: async ({
    context,
    boardId,
    listId,
    template,
    autoSuggest,
    copyFromCard,
  }) => {
    return {
      formType: "smartCardCreation",
      title: "Smart Card Creation",
      description:
        "Create a card with AI-powered suggestions and intelligent defaults",
      fields: [
        {
          name: "context",
          label: "Card Context",
          type: "textarea",
          required: true,
          defaultValue: context || "",
          placeholder: "Describe what this card should accomplish...",
          description:
            "Provide context to help generate intelligent suggestions",
        },
        {
          name: "boardId",
          label: "Target Board",
          type: "dynamic-select",
          required: true,
          dependsOn: "workspaceId",
          placeholder: "Select a board...",
          defaultValue: boardId || "",
          description: "Choose the board for this card",
        },
        {
          name: "listId",
          label: "Target List",
          type: "dynamic-select",
          required: true,
          dependsOn: "boardId",
          placeholder: "Select a list...",
          defaultValue: listId || "",
          description: "Choose the list for this card",
        },
        {
          name: "name",
          label: "Card Name",
          type: "text",
          required: true,
          placeholder: "Enter card name...",
          description: "Name of the card (AI will suggest based on context)",
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          placeholder: "Enter card description...",
          description: "Detailed description of the card",
        },
        {
          name: "template",
          label: "Use Template",
          type: "select",
          placeholder: "Choose a template...",
          defaultValue: template || "",
          options: [
            { value: "", label: "No template" },
            { value: "task", label: "Task Template" },
            { value: "bug", label: "Bug Report Template" },
            { value: "feature", label: "Feature Request Template" },
            { value: "meeting", label: "Meeting Notes Template" },
            { value: "project", label: "Project Template" },
          ],
          description: "Apply a predefined template to the card",
        },
        {
          name: "copyFromCard",
          label: "Copy Structure From Card",
          type: "dynamic-select",
          dependsOn: "boardId",
          placeholder: "Select a card to copy from...",
          defaultValue: copyFromCard || "",
          description:
            "Copy checklist, labels, and other structure from another card",
        },
        {
          name: "dueDate",
          label: "Due Date",
          type: "datetime-local",
          description: "When should this card be completed?",
        },
        {
          name: "members",
          label: "Assign Members",
          type: "dynamic-select",
          multiple: true,
          placeholder: "Select members...",
          description: "Assign members to this card",
        },
        {
          name: "labels",
          label: "Add Labels",
          type: "dynamic-select",
          multiple: true,
          dependsOn: "boardId",
          placeholder: "Select labels...",
          description: "Add labels to categorize the card",
        },
        {
          name: "autoSuggest",
          label: "Enable AI Suggestions",
          type: "checkbox",
          defaultValue: autoSuggest || true,
          description:
            "Get AI-powered suggestions for name, description, and assignments",
        },
        {
          name: "createChecklist",
          label: "Create Checklist",
          type: "checkbox",
          defaultValue: false,
          description: "Automatically create a checklist for this card",
        },
        {
          name: "checklistItems",
          label: "Checklist Items",
          type: "textarea",
          dependsOn: "createChecklist",
          placeholder: "Enter checklist items (one per line)...",
          description: "Initial checklist items (one per line)",
        },
      ],
    };
  },
});

export const workspaceAnalyticsTool = tool({
  description:
    "Generate comprehensive analytics and insights for Trello workspaces, including productivity metrics, team performance, and project health indicators.",
  inputSchema: z.object({
    workspaceId: z.string().optional().describe("Workspace ID to analyze"),
    dateRange: z
      .object({
        start: z.string().describe("Start date (ISO format)"),
        end: z.string().describe("End date (ISO format)"),
      })
      .optional()
      .describe("Date range for analysis"),
    metrics: z
      .array(
        z.enum([
          "cardActivity",
          "memberProductivity",
          "boardHealth",
          "labelUsage",
          "dueDateCompliance",
          "listDistribution",
          "archivedItems",
          "collaborationMetrics",
        ])
      )
      .optional()
      .describe("Specific metrics to include"),
    includeCharts: z
      .boolean()
      .optional()
      .describe("Include visual charts and graphs"),
    exportFormat: z
      .enum(["json", "csv", "pdf"])
      .optional()
      .describe("Export format for results"),
  }),
  execute: async ({
    workspaceId,
    dateRange,
    metrics,
    includeCharts,
    exportFormat,
  }) => {
    return {
      formType: "workspaceAnalytics",
      title: "Workspace Analytics",
      description:
        "Generate comprehensive analytics and insights for your Trello workspace",
      fields: [
        {
          name: "workspaceId",
          label: "Workspace",
          type: "dynamic-select",
          required: true,
          placeholder: "Select workspace...",
          defaultValue: workspaceId || "",
          description: "Choose the workspace to analyze",
        },
        {
          name: "dateRangeStart",
          label: "Analysis Start Date",
          type: "date",
          required: true,
          defaultValue: dateRange?.start || "",
          description: "Start date for the analysis period",
        },
        {
          name: "dateRangeEnd",
          label: "Analysis End Date",
          type: "date",
          required: true,
          defaultValue: dateRange?.end || "",
          description: "End date for the analysis period",
        },
        {
          name: "metrics",
          label: "Metrics to Include",
          type: "checkbox-group",
          options: [
            { value: "cardActivity", label: "Card Activity Trends" },
            { value: "memberProductivity", label: "Member Productivity" },
            { value: "boardHealth", label: "Board Health Indicators" },
            { value: "labelUsage", label: "Label Usage Statistics" },
            { value: "dueDateCompliance", label: "Due Date Compliance" },
            { value: "listDistribution", label: "List Distribution" },
            { value: "archivedItems", label: "Archived Items Analysis" },
            { value: "collaborationMetrics", label: "Collaboration Metrics" },
          ],
          defaultValue: metrics || [
            "cardActivity",
            "memberProductivity",
            "boardHealth",
          ],
          description: "Select which metrics to include in the analysis",
        },
        {
          name: "includeCharts",
          label: "Include Visual Charts",
          type: "checkbox",
          defaultValue: includeCharts || true,
          description: "Generate visual charts and graphs for better insights",
        },
        {
          name: "exportFormat",
          label: "Export Format",
          type: "select",
          defaultValue: exportFormat || "json",
          options: [
            { value: "json", label: "JSON Data" },
            { value: "csv", label: "CSV Spreadsheet" },
            { value: "pdf", label: "PDF Report" },
          ],
          description: "Choose the format for exporting results",
        },
        {
          name: "emailReport",
          label: "Email Report",
          type: "checkbox",
          defaultValue: false,
          description: "Email the analytics report to workspace members",
        },
        {
          name: "scheduleRecurring",
          label: "Schedule Recurring Reports",
          type: "checkbox",
          defaultValue: false,
          description: "Set up automatic recurring analytics reports",
        },
        {
          name: "reportFrequency",
          label: "Report Frequency",
          type: "select",
          dependsOn: "scheduleRecurring",
          options: [
            { value: "daily", label: "Daily" },
            { value: "weekly", label: "Weekly" },
            { value: "monthly", label: "Monthly" },
            { value: "quarterly", label: "Quarterly" },
          ],
          description: "How often to generate recurring reports",
        },
      ],
    };
  },
});

export const automatedWorkflowTool = tool({
  description:
    "Create and manage automated workflows for Trello boards, including rule-based actions, triggers, and complex automation scenarios.",
  inputSchema: z.object({
    workflowName: z.string().describe("Name of the workflow"),
    trigger: z
      .object({
        type: z
          .enum([
            "cardCreated",
            "cardMoved",
            "cardUpdated",
            "dueDateApproaching",
            "memberAdded",
            "labelAdded",
            "custom",
          ])
          .describe("Type of trigger"),
        conditions: z
          .array(
            z.object({
              field: z.string().describe("Field to check"),
              operator: z
                .enum([
                  "equals",
                  "contains",
                  "startsWith",
                  "endsWith",
                  "greaterThan",
                  "lessThan",
                  "isEmpty",
                  "isNotEmpty",
                ])
                .describe("Comparison operator"),
              value: z.string().describe("Value to compare against"),
            })
          )
          .optional()
          .describe("Conditions that must be met"),
      })
      .describe("Workflow trigger configuration"),
    actions: z
      .array(
        z.object({
          type: z
            .enum([
              "moveCard",
              "addLabel",
              "assignMember",
              "setDueDate",
              "addComment",
              "createChecklist",
              "archiveCard",
              "sendNotification",
            ])
            .describe("Type of action"),
          parameters: z.record(z.unknown()).describe("Action parameters"),
        })
      )
      .describe("Actions to perform when triggered"),
    enabled: z.boolean().optional().describe("Whether the workflow is enabled"),
  }),
  execute: async ({ workflowName, trigger, actions, enabled }) => {
    return {
      formType: "automatedWorkflow",
      title: "Automated Workflow",
      description: "Create intelligent automation rules for your Trello boards",
      fields: [
        {
          name: "workflowName",
          label: "Workflow Name",
          type: "text",
          required: true,
          defaultValue: workflowName || "",
          placeholder: "Enter workflow name...",
          description: "A descriptive name for this workflow",
        },
        {
          name: "boardId",
          label: "Target Board",
          type: "dynamic-select",
          required: true,
          dependsOn: "workspaceId",
          placeholder: "Select a board...",
          description: "Board where this workflow will be active",
        },
        {
          name: "triggerType",
          label: "Trigger Type",
          type: "select",
          required: true,
          defaultValue: trigger?.type || "cardCreated",
          options: [
            { value: "cardCreated", label: "Card Created" },
            { value: "cardMoved", label: "Card Moved" },
            { value: "cardUpdated", label: "Card Updated" },
            { value: "dueDateApproaching", label: "Due Date Approaching" },
            { value: "memberAdded", label: "Member Added" },
            { label: "Label Added", value: "labelAdded" },
            { value: "custom", label: "Custom Trigger" },
          ],
          description: "What event should trigger this workflow?",
        },
        {
          name: "enabled",
          label: "Enable Workflow",
          type: "checkbox",
          defaultValue: enabled !== false,
          description: "Whether this workflow is currently active",
        },
        {
          name: "advancedMode",
          label: "Advanced Configuration",
          type: "checkbox",
          defaultValue: false,
          description: "Enable advanced configuration options",
        },
      ],
    };
  },
});

// Export all advanced tools
export const advancedTools = {
  bulkBoardOperations: bulkBoardOperationsTool,
  advancedCardSearch: advancedCardSearchTool,
  smartCardCreation: smartCardCreationTool,
  workspaceAnalytics: workspaceAnalyticsTool,
  automatedWorkflow: automatedWorkflowTool,
};

