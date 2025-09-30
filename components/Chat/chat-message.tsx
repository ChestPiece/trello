import React from "react";
import { cn } from "@/lib/utils";
import { UIMessage } from "ai";
import { FormattedText } from "../formatted-text";
import { ToolResultRenderer } from "./tool-result-renderer";
import {
  TrelloBoardCard,
  TrelloCardCard,
  TrelloListCard,
  TrelloWorkspaceCard,
  TrelloFormCard,
} from "./generative-ui";

export interface ChatMessageProps {
  message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "chat-message flex w-full items-start gap-4 py-4",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-2 rounded-lg px-4 py-2",
          message.role === "user"
            ? "bg-primary text-primary-foreground max-w-[80%]"
            : "bg-muted max-w-[80%]"
        )}
      >
        <div className="text-sm space-y-2">
          {message.parts.map((part, index) => {
            switch (part.type) {
              case "text":
                return part.text.split("\n").map((text, i) => (
                  <React.Fragment key={`${index}-${i}`}>
                    <p className={i > 0 ? "mt-2" : ""}>
                      <FormattedText content={text} />
                    </p>
                  </React.Fragment>
                ));

              // ✅ AI SDK UI Pattern: Handle typed tool parts for real-time generative UI
              // Each tool type gets specific rendering based on its state

              // Board tools - render TrelloBoardCard component
              case "tool-createBoard":
              case "tool-getBoard":
              case "tool-updateBoard": {
                // Using proper state-based rendering for tools in AI SDK v5
                const toolPart = part as {
                  state:
                    | "input-streaming"
                    | "input-available"
                    | "output-available"
                    | "output-error";
                  output?: unknown;
                  errorText?: string;
                };

                if (toolPart.state === "output-error") {
                  return (
                    <div
                      key={index}
                      className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                    >
                      <p className="text-sm text-destructive font-semibold">
                        Error creating/fetching board
                      </p>
                      <p className="text-xs text-destructive/80 mt-1">
                        {toolPart.errorText || "Unknown error occurred"}
                      </p>
                    </div>
                  );
                }

                return (
                  <div key={index} className="mt-3">
                    <TrelloBoardCard
                      data={
                        toolPart.state === "output-available"
                          ? (toolPart.output as Record<string, unknown>)
                          : {}
                      }
                      state={toolPart.state}
                    />
                  </div>
                );
              }

              // Card tools - render TrelloCardCard component
              case "tool-createCard":
              case "tool-getCard":
              case "tool-updateCard": {
                const toolPart = part as {
                  state:
                    | "input-streaming"
                    | "input-available"
                    | "output-available"
                    | "output-error";
                  output?: unknown;
                  errorText?: string;
                };

                if (toolPart.state === "output-error") {
                  return (
                    <div
                      key={index}
                      className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                    >
                      <p className="text-sm text-destructive font-semibold">
                        Error creating/fetching card
                      </p>
                      <p className="text-xs text-destructive/80 mt-1">
                        {toolPart.errorText || "Unknown error occurred"}
                      </p>
                    </div>
                  );
                }

                return (
                  <div key={index} className="mt-3">
                    <TrelloCardCard
                      data={
                        toolPart.state === "output-available"
                          ? (toolPart.output as Record<string, unknown>)
                          : {}
                      }
                      state={toolPart.state}
                    />
                  </div>
                );
              }

              // List tools - render TrelloListCard component
              case "tool-createList":
              case "tool-getList":
              case "tool-updateList": {
                const toolPart = part as {
                  state:
                    | "input-streaming"
                    | "input-available"
                    | "output-available"
                    | "output-error";
                  output?: unknown;
                  errorText?: string;
                };

                if (toolPart.state === "output-error") {
                  return (
                    <div
                      key={index}
                      className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                    >
                      <p className="text-sm text-destructive font-semibold">
                        Error creating/fetching list
                      </p>
                      <p className="text-xs text-destructive/80 mt-1">
                        {toolPart.errorText || "Unknown error occurred"}
                      </p>
                    </div>
                  );
                }

                return (
                  <div key={index} className="mt-3">
                    <TrelloListCard
                      data={
                        toolPart.state === "output-available"
                          ? (toolPart.output as Record<string, unknown>)
                          : {}
                      }
                      state={toolPart.state}
                    />
                  </div>
                );
              }

              // Workspace tools - render TrelloWorkspaceCard component
              case "tool-createWorkspace":
              case "tool-getWorkspace":
              case "tool-updateWorkspace": {
                const toolPart = part as {
                  state:
                    | "input-streaming"
                    | "input-available"
                    | "output-available"
                    | "output-error";
                  output?: unknown;
                  errorText?: string;
                };

                if (toolPart.state === "output-error") {
                  return (
                    <div
                      key={index}
                      className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                    >
                      <p className="text-sm text-destructive font-semibold">
                        Error creating/fetching workspace
                      </p>
                      <p className="text-xs text-destructive/80 mt-1">
                        {toolPart.errorText || "Unknown error occurred"}
                      </p>
                    </div>
                  );
                }

                return (
                  <div key={index} className="mt-3">
                    <TrelloWorkspaceCard
                      data={
                        toolPart.state === "output-available"
                          ? (toolPart.output as Record<string, unknown>)
                          : {}
                      }
                      state={toolPart.state}
                    />
                  </div>
                );
              }

              // List operation tools - render arrays of items
              case "tool-listBoards": {
                const toolPart = part as {
                  state:
                    | "input-streaming"
                    | "input-available"
                    | "output-available"
                    | "output-error";
                  output?: unknown;
                  errorText?: string;
                };

                // Handle error state first
                if (toolPart.state === "output-error") {
                  return (
                    <div
                      key={index}
                      className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                    >
                      <p className="text-sm text-destructive font-semibold">
                        Error loading boards
                      </p>
                      <p className="text-xs text-destructive/80 mt-1">
                        {toolPart.errorText || "Unknown error occurred"}
                      </p>
                    </div>
                  );
                }

                // Handle output based on tool state (AI SDK v5 pattern)
                const outputData =
                  toolPart.state === "output-available" ? toolPart.output : [];

                if (Array.isArray(outputData) && outputData.length > 0) {
                  return (
                    <div key={index} className="mt-3 space-y-3">
                      {outputData
                        .slice(0, 5)
                        .map((board: unknown, idx: number) => (
                          <TrelloBoardCard
                            key={(board as { id?: string })?.id || idx}
                            data={board as Record<string, unknown>}
                            state="output-available"
                          />
                        ))}
                      {outputData.length > 5 && (
                        <div className="text-sm text-muted-foreground text-center p-2 bg-muted/50 rounded">
                          + {outputData.length - 5} more boards
                        </div>
                      )}
                    </div>
                  );
                } else if (
                  toolPart.state === "input-streaming" ||
                  toolPart.state === "input-available"
                ) {
                  return (
                    <div
                      key={index}
                      className="mt-3 p-2 bg-muted/50 rounded flex items-center gap-2"
                    >
                      <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
                      <span className="text-sm">Loading boards...</span>
                    </div>
                  );
                }
                break;
              }

              case "tool-listCards": {
                const toolPart = part as {
                  state:
                    | "input-streaming"
                    | "input-available"
                    | "output-available"
                    | "output-error";
                  output?: unknown;
                  errorText?: string;
                };

                // Handle error state first
                if (toolPart.state === "output-error") {
                  return (
                    <div
                      key={index}
                      className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                    >
                      <p className="text-sm text-destructive font-semibold">
                        Error loading cards
                      </p>
                      <p className="text-xs text-destructive/80 mt-1">
                        {toolPart.errorText || "Unknown error occurred"}
                      </p>
                    </div>
                  );
                }

                // Handle output based on tool state (AI SDK v5 pattern)
                const outputData =
                  toolPart.state === "output-available" ? toolPart.output : [];

                if (Array.isArray(outputData) && outputData.length > 0) {
                  return (
                    <div key={index} className="mt-3 space-y-3">
                      {outputData
                        .slice(0, 5)
                        .map((card: unknown, idx: number) => (
                          <TrelloCardCard
                            key={(card as { id?: string })?.id || idx}
                            data={card as Record<string, unknown>}
                            state="output-available"
                          />
                        ))}
                      {outputData.length > 5 && (
                        <div className="text-sm text-muted-foreground text-center p-2 bg-muted/50 rounded">
                          + {outputData.length - 5} more cards
                        </div>
                      )}
                    </div>
                  );
                } else if (
                  toolPart.state === "input-streaming" ||
                  toolPart.state === "input-available"
                ) {
                  return (
                    <div
                      key={index}
                      className="mt-3 p-2 bg-muted/50 rounded flex items-center gap-2"
                    >
                      <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
                      <span className="text-sm">Loading cards...</span>
                    </div>
                  );
                }
                break;
              }

              case "tool-listLists": {
                const toolPart = part as {
                  state:
                    | "input-streaming"
                    | "input-available"
                    | "output-available"
                    | "output-error";
                  output?: unknown;
                  errorText?: string;
                };

                // Handle error state first
                if (toolPart.state === "output-error") {
                  return (
                    <div
                      key={index}
                      className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                    >
                      <p className="text-sm text-destructive font-semibold">
                        Error loading lists
                      </p>
                      <p className="text-xs text-destructive/80 mt-1">
                        {toolPart.errorText || "Unknown error occurred"}
                      </p>
                    </div>
                  );
                }

                // Handle output based on tool state (AI SDK v5 pattern)
                const outputData =
                  toolPart.state === "output-available" ? toolPart.output : [];

                if (Array.isArray(outputData) && outputData.length > 0) {
                  return (
                    <div key={index} className="mt-3 space-y-3">
                      {outputData
                        .slice(0, 5)
                        .map((list: unknown, idx: number) => (
                          <TrelloListCard
                            key={(list as { id?: string })?.id || idx}
                            data={list as Record<string, unknown>}
                            state="output-available"
                          />
                        ))}
                      {outputData.length > 5 && (
                        <div className="text-sm text-muted-foreground text-center p-2 bg-muted/50 rounded">
                          + {outputData.length - 5} more lists
                        </div>
                      )}
                    </div>
                  );
                } else if (
                  toolPart.state === "input-streaming" ||
                  toolPart.state === "input-available"
                ) {
                  return (
                    <div
                      key={index}
                      className="mt-3 p-2 bg-muted/50 rounded flex items-center gap-2"
                    >
                      <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
                      <span className="text-sm">Loading lists...</span>
                    </div>
                  );
                }
                break;
              }

              case "tool-listWorkspaces": {
                const toolPart = part as {
                  state:
                    | "input-streaming"
                    | "input-available"
                    | "output-available"
                    | "output-error";
                  output?: unknown;
                  errorText?: string;
                };

                // Handle error state first
                if (toolPart.state === "output-error") {
                  return (
                    <div
                      key={index}
                      className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                    >
                      <p className="text-sm text-destructive font-semibold">
                        Error loading workspaces
                      </p>
                      <p className="text-xs text-destructive/80 mt-1">
                        {toolPart.errorText || "Unknown error occurred"}
                      </p>
                    </div>
                  );
                }

                // Handle output based on tool state (AI SDK v5 pattern)
                const outputData =
                  toolPart.state === "output-available" ? toolPart.output : [];

                if (Array.isArray(outputData) && outputData.length > 0) {
                  return (
                    <div key={index} className="mt-3 space-y-3">
                      {outputData
                        .slice(0, 5)
                        .map((workspace: unknown, idx: number) => (
                          <TrelloWorkspaceCard
                            key={(workspace as { id?: string })?.id || idx}
                            data={workspace as Record<string, unknown>}
                            state="output-available"
                          />
                        ))}
                      {outputData.length > 5 && (
                        <div className="text-sm text-muted-foreground text-center p-2 bg-muted/50 rounded">
                          + {outputData.length - 5} more workspaces
                        </div>
                      )}
                    </div>
                  );
                } else if (
                  toolPart.state === "input-streaming" ||
                  toolPart.state === "input-available"
                ) {
                  return (
                    <div
                      key={index}
                      className="mt-3 p-2 bg-muted/50 rounded flex items-center gap-2"
                    >
                      <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
                      <span className="text-sm">Loading workspaces...</span>
                    </div>
                  );
                }
                break;
              }

              // Form Tools - render interactive forms for CRUD operations
              case "tool-createBoardForm":
              case "tool-createCardForm":
              case "tool-createListForm":
              case "tool-createWorkspaceForm":
              case "tool-createLabelForm":
              case "tool-createChecklistForm":
              case "tool-createAttachmentForm": {
                const toolPart = part as {
                  state:
                    | "input-streaming"
                    | "input-available"
                    | "output-available"
                    | "output-error";
                  toolCallId: string;
                  input?: unknown;
                  output?: unknown;
                  errorText?: string;
                };

                if (toolPart.state === "output-error") {
                  return (
                    <div
                      key={index}
                      className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                    >
                      <p className="text-sm text-destructive font-semibold">
                        Error with form
                      </p>
                      <p className="text-xs text-destructive/80 mt-1">
                        {toolPart.errorText || "Unknown error occurred"}
                      </p>
                    </div>
                  );
                }

                return (
                  <div key={index} className="mt-3">
                    <TrelloFormCard
                      toolCallId={toolPart.toolCallId}
                      formType={part.type.replace("tool-", "")}
                      input={toolPart.input as Record<string, unknown>}
                      state={toolPart.state}
                    />
                  </div>
                );
              }

              // Fallback: Other tools use the generic renderer for AI SDK v5 tool structure
              default:
                if (part.type.startsWith("tool-")) {
                  const toolName = part.type.replace("tool-", "");
                  const toolPart = part as {
                    state:
                      | "input-streaming"
                      | "input-available"
                      | "output-available"
                      | "output-error";
                    toolCallId: string;
                    input?: unknown;
                    output?: unknown;
                    errorText?: string;
                  };

                  return (
                    <div key={index} className="tool-result mt-2">
                      <ToolResultRenderer
                        toolName={toolName}
                        input={toolPart.input as Record<string, unknown>}
                        output={toolPart.output as Record<string, unknown>}
                        state={toolPart.state}
                        errorText={toolPart.errorText}
                      />
                    </div>
                  );
                }
                return null;
            }
          })}
        </div>
      </div>
    </div>
  );
}
