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
                const toolPart = part as any;
                return (
                  <div key={index} className="mt-3">
                    <TrelloBoardCard
                      data={
                        toolPart.state === "output-available"
                          ? toolPart.output
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
                const toolPart = part as any;
                return (
                  <div key={index} className="mt-3">
                    <TrelloCardCard
                      data={
                        toolPart.state === "output-available"
                          ? toolPart.output
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
                const toolPart = part as any;
                return (
                  <div key={index} className="mt-3">
                    <TrelloListCard
                      data={
                        toolPart.state === "output-available"
                          ? toolPart.output
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
                const toolPart = part as any;
                return (
                  <div key={index} className="mt-3">
                    <TrelloWorkspaceCard
                      data={
                        toolPart.state === "output-available"
                          ? toolPart.output
                          : {}
                      }
                      state={toolPart.state}
                    />
                  </div>
                );
              }

              // List operation tools - render arrays of items
              case "tool-listBoards": {
                const toolPart = part as any;
                // Handle output based on tool state (AI SDK v5 pattern)
                const outputData =
                  toolPart.state === "output-available" ? toolPart.output : [];

                if (Array.isArray(outputData) && outputData.length > 0) {
                  return (
                    <div key={index} className="mt-3 space-y-3">
                      {outputData.slice(0, 5).map((board: any, idx: number) => (
                        <TrelloBoardCard
                          key={board.id || idx}
                          data={board}
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
                const toolPart = part as any;
                // Handle output based on tool state (AI SDK v5 pattern)
                const outputData =
                  toolPart.state === "output-available" ? toolPart.output : [];

                if (Array.isArray(outputData) && outputData.length > 0) {
                  return (
                    <div key={index} className="mt-3 space-y-3">
                      {outputData.slice(0, 5).map((card: any, idx: number) => (
                        <TrelloCardCard
                          key={card.id || idx}
                          data={card}
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
                const toolPart = part as any;
                // Handle output based on tool state (AI SDK v5 pattern)
                const outputData =
                  toolPart.state === "output-available" ? toolPart.output : [];

                if (Array.isArray(outputData) && outputData.length > 0) {
                  return (
                    <div key={index} className="mt-3 space-y-3">
                      {outputData.slice(0, 5).map((list: any, idx: number) => (
                        <TrelloListCard
                          key={list.id || idx}
                          data={list}
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
                const toolPart = part as any;
                // Handle output based on tool state (AI SDK v5 pattern)
                const outputData =
                  toolPart.state === "output-available" ? toolPart.output : [];

                if (Array.isArray(outputData) && outputData.length > 0) {
                  return (
                    <div key={index} className="mt-3 space-y-3">
                      {outputData
                        .slice(0, 5)
                        .map((workspace: any, idx: number) => (
                          <TrelloWorkspaceCard
                            key={workspace.id || idx}
                            data={workspace}
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
                    input?: any;
                    output?: any;
                    errorText?: string;
                  };

                  return (
                    <div key={index} className="tool-result mt-2">
                      <ToolResultRenderer
                        toolName={toolName}
                        input={toolPart.input}
                        output={toolPart.output}
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
