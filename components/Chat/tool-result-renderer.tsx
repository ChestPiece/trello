import React from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import {
  TrelloBoardCard,
  TrelloCardCard,
  TrelloListCard,
  TrelloWorkspaceCard,
} from "./generative-ui";

/**
 * AI SDK UI v5 Tool Result Renderer
 * 
 * This component handles rendering of tool results following Vercel AI SDK UI v5 patterns.
 * It's used as a fallback for tools that don't have specific UI components in chat-message.tsx.
 * 
 * Key patterns from AI SDK UI v5:
 * - Typed tool parts with specific states
 * - State-based rendering (input-streaming, input-available, output-available, output-error)
 * - Generative UI with React components
 */

// Type-safe tool data structure
type ToolData = Record<string, unknown>;

// AI SDK UI v5 tool invocation states
interface ToolResultRendererProps {
  toolName: string;
  input: ToolData;
  output: ToolData;
  state:
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error";
  errorText?: string;
}

/**
 * Main renderer component following AI SDK UI v5 state-based rendering pattern
 */
export function ToolResultRenderer({
  toolName,
  input,
  output,
  state,
  errorText,
}: ToolResultRendererProps) {
  // AI SDK UI v5 Pattern: State-based rendering
  switch (state) {
    // Input streaming state - tool is preparing
    case "input-streaming":
      return (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Preparing {getToolDisplayName(toolName)}...
          </span>
        </div>
      );

    // Input available state - tool is executing
    case "input-available":
      return (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Processing {getToolDisplayName(toolName)}...
          </span>
        </div>
      );

    // Output error state - tool execution failed
    case "output-error":
      return (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">
              Error in {getToolDisplayName(toolName)}
            </p>
            {errorText && (
              <p className="text-sm text-destructive/80 mt-1">{errorText}</p>
            )}
          </div>
        </div>
      );

    // Output available state - tool execution succeeded
    case "output-available":
      return (
        <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                {getToolDisplayName(toolName)} completed successfully
              </p>
              <div className="mt-2">
                {renderToolSpecificOutput(toolName, input, output)}
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}

function getToolDisplayName(toolName: string): string {
  const toolNames: Record<string, string> = {
    createBoard: "Board Creation",
    getBoard: "Board Retrieval",
    updateBoard: "Board Update",
    deleteBoard: "Board Deletion",
    listBoards: "Board Listing",
    createList: "List Creation",
    getList: "List Retrieval",
    updateList: "List Update",
    deleteList: "List Deletion",
    listLists: "List Listing",
    archiveList: "List Archiving",
    unarchiveList: "List Unarchiving",
    createCard: "Card Creation",
    getCard: "Card Retrieval",
    updateCard: "Card Update",
    deleteCard: "Card Deletion",
    listCards: "Card Listing",
    createLabel: "Label Creation",
    getLabel: "Label Retrieval",
    updateLabel: "Label Update",
    deleteLabel: "Label Deletion",
    addLabelToCard: "Label Assignment",
    removeLabelFromCard: "Label Removal",
    createAttachment: "Attachment Creation",
    getAttachment: "Attachment Retrieval",
    deleteAttachment: "Attachment Deletion",
    listAttachments: "Attachment Listing",
    createChecklist: "Checklist Creation",
    getChecklist: "Checklist Retrieval",
    updateChecklist: "Checklist Update",
    deleteChecklist: "Checklist Deletion",
    addMemberToBoard: "Member Addition",
    removeMemberFromBoard: "Member Removal",
    listMembers: "Member Listing",
    getMember: "Member Retrieval",
    createWorkspace: "Workspace Creation",
    getWorkspace: "Workspace Retrieval",
    updateWorkspace: "Workspace Update",
    deleteWorkspace: "Workspace Deletion",
    listWorkspaces: "Workspace Listing",
  };

  return toolNames[toolName] || toolName;
}

/**
 * AI SDK UI v5 Pattern: Generative UI based on tool type
 * 
 * This function routes tool outputs to specific UI components.
 * Following the pattern from cursor rule where each tool gets its own UI component.
 */
function renderToolSpecificOutput(
  toolName: string,
  input: ToolData,
  output: ToolData
): React.ReactNode {
  // Board operations - render with TrelloBoardCard
  if (
    toolName === "createBoard" ||
    toolName === "updateBoard" ||
    toolName === "getBoard"
  ) {
    return renderBoardOutput(output);
  }

  // List operations - render with TrelloListCard
  if (
    toolName === "createList" ||
    toolName === "updateList" ||
    toolName === "getList" ||
    toolName === "listLists"
  ) {
    return renderListOutput(output);
  }

  // Card operations - render with TrelloCardCard
  if (
    toolName === "createCard" ||
    toolName === "updateCard" ||
    toolName === "getCard" ||
    toolName === "listCards"
  ) {
    return renderCardOutput(output);
  }

  // Workspace operations - render with TrelloWorkspaceCard
  if (
    toolName === "createWorkspace" ||
    toolName === "updateWorkspace" ||
    toolName === "getWorkspace" ||
    toolName === "listWorkspaces"
  ) {
    return renderWorkspaceOutput(output);
  }

  // Board listing - render array of boards
  if (toolName === "listBoards") {
    return renderBoardListOutput(output);
  }

  // Label operations - render with simple UI
  if (
    toolName === "createLabel" ||
    toolName === "updateLabel" ||
    toolName === "getLabel" ||
    toolName === "addLabelToCard" ||
    toolName === "removeLabelFromCard"
  ) {
    return renderLabelOutput(output);
  }

  // Attachment operations - render with simple UI
  if (
    toolName === "createAttachment" ||
    toolName === "getAttachment" ||
    toolName === "listAttachments"
  ) {
    return renderAttachmentOutput(output);
  }

  // Checklist operations - render with simple UI
  if (
    toolName === "createChecklist" ||
    toolName === "updateChecklist" ||
    toolName === "getChecklist" ||
    toolName === "listChecklists"
  ) {
    return renderChecklistOutput(output);
  }

  // Member operations - render with simple UI
  if (
    toolName === "addMemberToBoard" ||
    toolName === "removeMemberFromBoard" ||
    toolName === "listMembers" ||
    toolName === "getMember"
  ) {
    return renderMemberOutput(output);
  }

  // Delete operations - render with confirmation message
  if (toolName.startsWith("delete") || toolName === "archiveList") {
    return renderDeleteOutput(toolName, output);
  }

  // Fallback - render generic output for unknown tools
  return renderGenericOutput(output);
}

/**
 * AI SDK UI v5 Generative UI: Board Component
 */
function renderBoardOutput(output: ToolData): React.ReactNode {
  return <TrelloBoardCard data={output} state="output-available" />;
}

/**
 * AI SDK UI v5 Generative UI: Board List Component (for listBoards)
 */
function renderBoardListOutput(output: ToolData): React.ReactNode {
  if (Array.isArray(output) && output.length > 0) {
    return (
      <div className="space-y-3">
        {output.slice(0, 5).map((board, idx: number) => (
          <TrelloBoardCard
            key={(board as ToolData).id?.toString() || idx.toString()}
            data={board as ToolData}
            state="output-available"
          />
        ))}
        {output.length > 5 && (
          <div className="text-sm text-muted-foreground text-center p-2 bg-muted/30 rounded">
            + {output.length - 5} more boards
          </div>
        )}
      </div>
    );
  }
  return renderBoardOutput(output);
}

/**
 * AI SDK UI v5 Generative UI: List Component
 */
function renderListOutput(output: ToolData): React.ReactNode {
  // Handle array of lists
  if (Array.isArray(output) && output.length > 0) {
    return (
      <div className="space-y-3">
        {output.slice(0, 5).map((list, idx: number) => (
          <TrelloListCard
            key={(list as ToolData).id?.toString() || idx.toString()}
            data={list as ToolData}
            state="output-available"
          />
        ))}
        {output.length > 5 && (
          <div className="text-sm text-muted-foreground text-center p-2 bg-muted/30 rounded">
            + {output.length - 5} more lists
          </div>
        )}
      </div>
    );
  }

  // Single list
  return <TrelloListCard data={output} state="output-available" />;
}

/**
 * AI SDK UI v5 Generative UI: Card Component
 */
function renderCardOutput(output: ToolData): React.ReactNode {
  // Handle array of cards
  if (Array.isArray(output) && output.length > 0) {
    return (
      <div className="space-y-3">
        {output.slice(0, 5).map((card, idx: number) => (
          <TrelloCardCard
            key={(card as ToolData).id?.toString() || idx.toString()}
            data={card as ToolData}
            state="output-available"
          />
        ))}
        {output.length > 5 && (
          <div className="text-sm text-muted-foreground text-center p-2 bg-muted/30 rounded">
            + {output.length - 5} more cards
          </div>
        )}
      </div>
    );
  }

  // Single card
  return <TrelloCardCard data={output} state="output-available" />;
}

/**
 * AI SDK UI v5 Generative UI: Workspace Component
 */
function renderWorkspaceOutput(output: ToolData): React.ReactNode {
  // Handle array of workspaces
  if (Array.isArray(output) && output.length > 0) {
    return (
      <div className="space-y-3">
        {output.slice(0, 5).map((workspace, idx: number) => (
          <TrelloWorkspaceCard
            key={(workspace as ToolData).id?.toString() || idx.toString()}
            data={workspace as ToolData}
            state="output-available"
          />
        ))}
        {output.length > 5 && (
          <div className="text-sm text-muted-foreground text-center p-2 bg-muted/30 rounded">
            + {output.length - 5} more workspaces
          </div>
        )}
      </div>
    );
  }

  // Single workspace
  return <TrelloWorkspaceCard data={output} state="output-available" />;
}

/**
 * Simple UI for label operations
 */
function renderLabelOutput(output: ToolData): React.ReactNode {
  return (
    <div className="space-y-2">
      {output?.id ? (
        <div className="text-xs text-green-700 dark:text-green-300">
          <strong>Label ID:</strong> {String(output.id)}
        </div>
      ) : null}
      {output?.name ? (
        <div className="text-xs text-green-700 dark:text-green-300">
          <strong>Name:</strong> {String(output.name)}
        </div>
      ) : null}
      {output?.color ? (
        <div className="text-xs text-green-700 dark:text-green-300 flex items-center gap-2">
          <strong>Color:</strong>
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: String(output.color) }}
          />
        </div>
      ) : null}
    </div>
  );
}

/**
 * Simple UI for attachment operations
 */
function renderAttachmentOutput(output: ToolData): React.ReactNode {
  return (
    <div className="space-y-2">
      {output?.id ? (
        <div className="text-xs text-green-700 dark:text-green-300">
          <strong>Attachment ID:</strong> {String(output.id)}
        </div>
      ) : null}
      {output?.name ? (
        <div className="text-xs text-green-700 dark:text-green-300">
          <strong>Name:</strong> {String(output.name)}
        </div>
      ) : null}
      {output?.url ? (
        <div className="text-xs text-green-700 dark:text-green-300">
          <strong>URL:</strong>
          <a
            href={String(output.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 underline hover:text-green-600 dark:hover:text-green-400"
          >
            View Attachment
          </a>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Simple UI for checklist operations
 */
function renderChecklistOutput(output: ToolData): React.ReactNode {
  return (
    <div className="space-y-2">
      {output?.id ? (
        <div className="text-xs text-green-700 dark:text-green-300">
          <strong>Checklist ID:</strong> {String(output.id)}
        </div>
      ) : null}
      {output?.name ? (
        <div className="text-xs text-green-700 dark:text-green-300">
          <strong>Name:</strong> {String(output.name)}
        </div>
      ) : null}
      {output?.checkItems && Array.isArray(output.checkItems) ? (
        <div className="text-xs text-green-700 dark:text-green-300">
          <strong>Items:</strong> {output.checkItems.length} tasks
        </div>
      ) : null}
    </div>
  );
}

/**
 * Simple UI for member operations
 */
function renderMemberOutput(output: ToolData): React.ReactNode {
  // Handle array of members
  if (Array.isArray(output) && output.length > 0) {
    return (
      <div className="space-y-2">
        {output.map((member, idx: number) => (
          <div
            key={(member as ToolData).id?.toString() || idx.toString()}
            className="text-xs text-green-700 dark:text-green-300 p-2 bg-green-50 dark:bg-green-950/20 rounded"
          >
            <div>
              <strong>Name:</strong> {String((member as ToolData).fullName)}
            </div>
            {(member as ToolData).username ? (
              <div>
                <strong>Username:</strong>{" "}
                {String((member as ToolData).username)}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  // Single member
  return (
    <div className="space-y-2">
      {output?.id ? (
        <div className="text-xs text-green-700 dark:text-green-300">
          <strong>Member ID:</strong> {String(output.id)}
        </div>
      ) : null}
      {output?.fullName ? (
        <div className="text-xs text-green-700 dark:text-green-300">
          <strong>Name:</strong> {String(output.fullName)}
        </div>
      ) : null}
      {output?.username ? (
        <div className="text-xs text-green-700 dark:text-green-300">
          <strong>Username:</strong> {String(output.username)}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Simple UI for delete/archive operations
 */
function renderDeleteOutput(
  toolName: string,
  output: ToolData
): React.ReactNode {
  const action = toolName.includes("archive") ? "archived" : "deleted";
  return (
    <div className="text-xs text-green-700 dark:text-green-300">
      <strong>Success:</strong> Item {action} successfully
      {output?.id ? (
        <div className="mt-1 text-muted-foreground">ID: {String(output.id)}</div>
      ) : null}
    </div>
  );
}

/**
 * Fallback UI for unknown tool types
 */
function renderGenericOutput(output: ToolData): React.ReactNode {
  return (
    <div className="space-y-2">
      <div className="text-xs text-green-700 dark:text-green-300">
        <strong>Result:</strong> Operation completed successfully
      </div>
      {output && typeof output === "object" ? (
        <details className="text-xs">
          <summary className="cursor-pointer text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200">
            View Details
          </summary>
          <pre className="mt-1 p-2 bg-green-50 dark:bg-green-950/20 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(output, null, 2)}
          </pre>
        </details>
      ) : null}
    </div>
  );
}
