import React from "react";
import { cn } from "@/lib/utils";
import { UIMessage } from "ai";
import { format } from "date-fns";
import {
  BoardCreationCard,
  BoardCreationData,
} from "../BoardCards/board-creation-card";
import {
  BoardUpdateCard,
  BoardUpdateData,
} from "../BoardCards/board-update-card";
import {
  BoardDeleteCard,
  BoardDeleteData,
} from "../BoardCards/board-delete-card";
import { BoardCloseCard, BoardCloseData } from "../BoardCards/board-close-card";
import {
  ListCreationCard,
  ListCreationData,
} from "../ListCards/list-creation-card";
import { ListUpdateCard, ListUpdateData } from "../ListCards/list-update-card";
import { ListDeleteCard, ListDeleteData } from "../ListCards/list-delete-card";
import { ListCloseCard, ListCloseData } from "../ListCards/list-close-card";
import {
  ListArchiveCard,
  ListArchiveData,
} from "../ListCards/list-archive-card";
import {
  CardCreationCard,
  CardCreationData,
} from "../Cards/card-creation-card";
import { CardUpdateCard, CardUpdateData } from "../Cards/card-update-card";
import { CardDeleteCard, CardDeleteData } from "../Cards/card-delete-card";
import {
  WorkspaceCreationCard,
  WorkspaceCreationData,
} from "../WorkspaceCards/workspace-creation-card";
import {
  WorkspaceUpdateCard,
  WorkspaceUpdateData,
} from "../WorkspaceCards/workspace-update-card";
import {
  WorkspaceDeleteCard,
  WorkspaceDeleteData,
} from "../WorkspaceCards/workspace-delete-card";
import {
  LabelCreationCard,
  LabelCreationData,
} from "../LabelCards/label-creation-card";
import {
  LabelUpdateCard,
  LabelUpdateData,
} from "../LabelCards/label-update-card";
import {
  LabelDeleteCard,
  LabelDeleteData,
} from "../LabelCards/label-delete-card";
import {
  AttachmentCreationCard,
  AttachmentCreationData,
} from "../AttachmentsCards/attachment-creation-card";
import {
  AttachmentDeleteCard,
  AttachmentDeleteData,
} from "../AttachmentsCards/attachment-delete-card";
import {
  ChecklistCreationCard,
  ChecklistCreationData,
} from "../ChecklistCards/checklist-creation-card";
import {
  ChecklistUpdateCard,
  ChecklistUpdateData,
} from "../ChecklistCards/checklist-update-card";
import {
  ChecklistDeleteCard,
  ChecklistDeleteData,
} from "../ChecklistCards/checklist-delete-card";

export interface ChatMessageProps {
  message: UIMessage;
  onFormSubmit?: (data: unknown, action: string) => void;
}

const formatDate = (timestamp: string) => {
  if (!timestamp) return "Time Stamp";

  const date = new Date(timestamp);
  return format(date, "yyyy-M-d");
};

export function ChatMessage({ message, onFormSubmit }: ChatMessageProps) {
  const renderToolOutput = (
    toolName: string,
    output: unknown,
    index: number
  ) => {
    // For creation/update/delete tools, render as components
    const creationTools = [
      "createBoard",
      "updateBoard",
      "deleteBoard",
      "closeBoard",
      "createList",
      "updateList",
      "deleteList",
      "closeList",
      "archiveList",
      "createCard",
      "updateCard",
      "deleteCard",
      "createWorkspace",
      "updateWorkspace",
      "deleteWorkspace",
      "createLabel",
      "updateLabel",
      "deleteLabel",
      "createAttachment",
      "deleteAttachment",
      "createChecklist",
      "updateChecklist",
      "deleteChecklist",
      // UI Generation Tools
      "generateBoardForm",
      "generateListForm",
      "generateCardForm",
      "generateWorkspaceForm",
      "generateLabelForm",
      "generateAttachmentForm",
      "generateChecklistForm",
    ];

    if (creationTools.includes(toolName)) {
      // Render as interactive components
      switch (toolName) {
        case "createBoard":
          return (
            <BoardCreationCard
              key={index}
              onSubmit={(data: BoardCreationData) => {
                console.log("Board creation submitted:", data);
              }}
              className="w-full"
            />
          );
        case "updateBoard":
          return (
            <BoardUpdateCard
              key={index}
              onSubmit={(data: BoardUpdateData) => {
                console.log("Board update submitted:", data);
              }}
              className="max-w-sm"
            />
          );
        case "deleteBoard":
          return (
            <BoardDeleteCard
              key={index}
              onSubmit={(data: BoardDeleteData) => {
                console.log("Board deletion submitted:", data);
              }}
              className="w-full"
            />
          );
        case "closeBoard":
          return (
            <BoardCloseCard
              key={index}
              onSubmit={(data: BoardCloseData) => {
                console.log("Board close submitted:", data);
              }}
              className="w-full"
            />
          );
        case "createList":
          return (
            <ListCreationCard
              key={index}
              onSubmit={(data: ListCreationData) => {
                console.log("List creation submitted:", data);
              }}
              className="w-full"
            />
          );
        case "updateList":
          return (
            <ListUpdateCard
              key={index}
              onSubmit={(data: ListUpdateData) => {
                console.log("List update submitted:", data);
              }}
              className="w-full"
            />
          );
        case "deleteList":
          return (
            <ListDeleteCard
              key={index}
              onSubmit={(data: ListDeleteData) => {
                console.log("List deletion submitted:", data);
              }}
              className="w-full"
            />
          );
        case "closeList":
          return (
            <ListCloseCard
              key={index}
              onSubmit={(data: ListCloseData) => {
                console.log("List close submitted:", data);
              }}
              className="w-full"
            />
          );
        case "archiveList":
          return (
            <ListArchiveCard
              key={index}
              onSubmit={(data: ListArchiveData) => {
                console.log("List archive submitted:", data);
              }}
              className="w-full"
            />
          );
        case "createCard":
          return (
            <CardCreationCard
              key={index}
              onSubmit={(data: CardCreationData) => {
                console.log("Card creation submitted:", data);
              }}
              className="w-full"
            />
          );
        case "updateCard":
          return (
            <CardUpdateCard
              key={index}
              onSubmit={(data: CardUpdateData) => {
                console.log("Card update submitted:", data);
              }}
              className="max-w-sm"
            />
          );
        case "deleteCard":
          return (
            <CardDeleteCard
              key={index}
              onSubmit={(data: CardDeleteData) => {
                console.log("Card deletion submitted:", data);
              }}
              className="w-full"
            />
          );
        case "createWorkspace":
          return (
            <WorkspaceCreationCard
              key={index}
              onSubmit={(data: WorkspaceCreationData) => {
                console.log("Workspace creation submitted:", data);
              }}
              className="w-full"
            />
          );
        case "updateWorkspace":
          return (
            <WorkspaceUpdateCard
              key={index}
              onSubmit={(data: WorkspaceUpdateData) => {
                console.log("Workspace update submitted:", data);
              }}
              className="w-full"
            />
          );
        case "deleteWorkspace":
          return (
            <WorkspaceDeleteCard
              key={index}
              onSubmit={(data: WorkspaceDeleteData) => {
                console.log("Workspace deletion submitted:", data);
              }}
              className="w-full"
            />
          );
        case "createLabel":
          return (
            <LabelCreationCard
              key={index}
              onSubmit={(data: LabelCreationData) => {
                console.log("Label creation submitted:", data);
              }}
              className="w-full"
            />
          );
        case "updateLabel":
          return (
            <LabelUpdateCard
              key={index}
              onSubmit={(data: LabelUpdateData) => {
                console.log("Label update submitted:", data);
              }}
              className="w-full"
            />
          );
        case "deleteLabel":
          return (
            <LabelDeleteCard
              key={index}
              onSubmit={(data: LabelDeleteData) => {
                console.log("Label deletion submitted:", data);
              }}
              className="w-full"
            />
          );
        case "createAttachment":
          return (
            <AttachmentCreationCard
              key={index}
              onSubmit={(data: AttachmentCreationData) => {
                console.log("Attachment creation submitted:", data);
              }}
              className="w-full"
            />
          );
        case "deleteAttachment":
          return (
            <AttachmentDeleteCard
              key={index}
              onSubmit={(data: AttachmentDeleteData) => {
                console.log("Attachment deletion submitted:", data);
              }}
              className="w-full"
            />
          );
        case "createChecklist":
          return (
            <ChecklistCreationCard
              key={index}
              onSubmit={(data: ChecklistCreationData) => {
                console.log("Checklist creation submitted:", data);
              }}
              className="w-full"
            />
          );
        case "updateChecklist":
          return (
            <ChecklistUpdateCard
              key={index}
              onSubmit={(data: ChecklistUpdateData) => {
                console.log("Checklist update submitted:", data);
              }}
              className="w-full"
            />
          );
        case "deleteChecklist":
          return (
            <ChecklistDeleteCard
              key={index}
              onSubmit={(data: ChecklistDeleteData) => {
                console.log("Checklist deletion submitted:", data);
              }}
              className="w-full"
            />
          );
        // UI Generation Tools
        case "generateBoardForm":
          const boardFormOutput = output as {
            ui: string;
            message: string;
            boardId?: string;
          };
          switch (boardFormOutput.ui) {
            case "BoardCreationCard":
              return (
                <BoardCreationCard
                  key={index}
                  onSubmit={(data: BoardCreationData) => {
                    onFormSubmit?.(data, "create");
                  }}
                  className="w-full"
                />
              );
            case "BoardUpdateCard":
              return (
                <BoardUpdateCard
                  key={index}
                  onSubmit={(data: BoardUpdateData) => {
                    onFormSubmit?.(data, "update");
                  }}
                  className="max-w-sm"
                />
              );
            case "BoardDeleteCard":
              return (
                <BoardDeleteCard
                  key={index}
                  onSubmit={(data: BoardDeleteData) => {
                    onFormSubmit?.(data, "delete");
                  }}
                  className="w-full"
                />
              );
            case "BoardCloseCard":
              return (
                <BoardCloseCard
                  key={index}
                  onSubmit={(data: BoardCloseData) => {
                    onFormSubmit?.(data, "close");
                  }}
                  className="w-full"
                />
              );
            default:
              return (
                <div key={index} className="p-4 border rounded-lg bg-muted">
                  <p className="text-sm">{boardFormOutput.message}</p>
                </div>
              );
          }
        case "generateListForm":
          const listFormOutput = output as {
            ui: string;
            message: string;
            listId?: string;
            boardId?: string;
          };
          switch (listFormOutput.ui) {
            case "ListCreationCard":
              return (
                <ListCreationCard
                  key={index}
                  onSubmit={(data: ListCreationData) => {
                    onFormSubmit?.(data, "create");
                  }}
                  className="w-full"
                />
              );
            case "ListUpdateCard":
              return (
                <ListUpdateCard
                  key={index}
                  onSubmit={(data: ListUpdateData) => {
                    onFormSubmit?.(data, "update");
                  }}
                  className="w-full"
                />
              );
            case "ListDeleteCard":
              return (
                <ListDeleteCard
                  key={index}
                  onSubmit={(data: ListDeleteData) => {
                    onFormSubmit?.(data, "delete");
                  }}
                  className="w-full"
                />
              );
            case "ListCloseCard":
              return (
                <ListCloseCard
                  key={index}
                  onSubmit={(data: ListCloseData) => {
                    onFormSubmit?.(data, "close");
                  }}
                  className="w-full"
                />
              );
            case "ListArchiveCard":
              return (
                <ListArchiveCard
                  key={index}
                  onSubmit={(data: ListArchiveData) => {
                    onFormSubmit?.(data, "archive");
                  }}
                  className="w-full"
                />
              );
            default:
              return (
                <div key={index} className="p-4 border rounded-lg bg-muted">
                  <p className="text-sm">{listFormOutput.message}</p>
                </div>
              );
          }
        case "generateCardForm":
          const cardFormOutput = output as {
            ui: string;
            message: string;
            cardId?: string;
            listId?: string;
          };
          switch (cardFormOutput.ui) {
            case "CardCreationCard":
              return (
                <CardCreationCard
                  key={index}
                  onSubmit={(data: CardCreationData) => {
                    onFormSubmit?.(data, "create");
                  }}
                  className="w-full"
                />
              );
            case "CardUpdateCard":
              return (
                <CardUpdateCard
                  key={index}
                  onSubmit={(data: CardUpdateData) => {
                    onFormSubmit?.(data, "update");
                  }}
                  className="max-w-sm"
                />
              );
            case "CardDeleteCard":
              return (
                <CardDeleteCard
                  key={index}
                  onSubmit={(data: CardDeleteData) => {
                    onFormSubmit?.(data, "delete");
                  }}
                  className="w-full"
                />
              );
            default:
              return (
                <div key={index} className="p-4 border rounded-lg bg-muted">
                  <p className="text-sm">{cardFormOutput.message}</p>
                </div>
              );
          }
        case "generateWorkspaceForm":
          const workspaceFormOutput = output as {
            ui: string;
            message: string;
            workspaceId?: string;
          };
          switch (workspaceFormOutput.ui) {
            case "WorkspaceCreationCard":
              return (
                <WorkspaceCreationCard
                  key={index}
                  onSubmit={(data: WorkspaceCreationData) => {
                    onFormSubmit?.(data, "create");
                  }}
                  className="w-full"
                />
              );
            case "WorkspaceUpdateCard":
              return (
                <WorkspaceUpdateCard
                  key={index}
                  onSubmit={(data: WorkspaceUpdateData) => {
                    onFormSubmit?.(data, "update");
                  }}
                  className="w-full"
                />
              );
            case "WorkspaceDeleteCard":
              return (
                <WorkspaceDeleteCard
                  key={index}
                  onSubmit={(data: WorkspaceDeleteData) => {
                    onFormSubmit?.(data, "delete");
                  }}
                  className="w-full"
                />
              );
            default:
              return (
                <div key={index} className="p-4 border rounded-lg bg-muted">
                  <p className="text-sm">{workspaceFormOutput.message}</p>
                </div>
              );
          }
        case "generateLabelForm":
          const labelFormOutput = output as {
            ui: string;
            message: string;
            labelId?: string;
            boardId?: string;
          };
          switch (labelFormOutput.ui) {
            case "LabelCreationCard":
              return (
                <LabelCreationCard
                  key={index}
                  onSubmit={(data: LabelCreationData) => {
                    onFormSubmit?.(data, "create");
                  }}
                  className="w-full"
                />
              );
            case "LabelUpdateCard":
              return (
                <LabelUpdateCard
                  key={index}
                  onSubmit={(data: LabelUpdateData) => {
                    onFormSubmit?.(data, "update");
                  }}
                  className="w-full"
                />
              );
            case "LabelDeleteCard":
              return (
                <LabelDeleteCard
                  key={index}
                  onSubmit={(data: LabelDeleteData) => {
                    onFormSubmit?.(data, "delete");
                  }}
                  className="w-full"
                />
              );
            default:
              return (
                <div key={index} className="p-4 border rounded-lg bg-muted">
                  <p className="text-sm">{labelFormOutput.message}</p>
                </div>
              );
          }
        case "generateAttachmentForm":
          const attachmentFormOutput = output as {
            ui: string;
            message: string;
            attachmentId?: string;
            cardId?: string;
          };
          switch (attachmentFormOutput.ui) {
            case "AttachmentCreationCard":
              return (
                <AttachmentCreationCard
                  key={index}
                  onSubmit={(data: AttachmentCreationData) => {
                    onFormSubmit?.(data, "create");
                  }}
                  className="w-full"
                />
              );
            case "AttachmentDeleteCard":
              return (
                <AttachmentDeleteCard
                  key={index}
                  onSubmit={(data: AttachmentDeleteData) => {
                    onFormSubmit?.(data, "delete");
                  }}
                  className="w-full"
                />
              );
            default:
              return (
                <div key={index} className="p-4 border rounded-lg bg-muted">
                  <p className="text-sm">{attachmentFormOutput.message}</p>
                </div>
              );
          }
        case "generateChecklistForm":
          const checklistFormOutput = output as {
            ui: string;
            message: string;
            checklistId?: string;
            cardId?: string;
          };
          switch (checklistFormOutput.ui) {
            case "ChecklistCreationCard":
              return (
                <ChecklistCreationCard
                  key={index}
                  onSubmit={(data: ChecklistCreationData) => {
                    onFormSubmit?.(data, "create");
                  }}
                  className="w-full"
                />
              );
            case "ChecklistUpdateCard":
              return (
                <ChecklistUpdateCard
                  key={index}
                  onSubmit={(data: ChecklistUpdateData) => {
                    onFormSubmit?.(data, "update");
                  }}
                  className="w-full"
                />
              );
            case "ChecklistDeleteCard":
              return (
                <ChecklistDeleteCard
                  key={index}
                  onSubmit={(data: ChecklistDeleteData) => {
                    onFormSubmit?.(data, "delete");
                  }}
                  className="w-full"
                />
              );
            default:
              return (
                <div key={index} className="p-4 border rounded-lg bg-muted">
                  <p className="text-sm">{checklistFormOutput.message}</p>
                </div>
              );
          }
        default:
          return (
            <div key={index} className="p-4 border rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">
                Tool call: {toolName}
              </p>
            </div>
          );
      }
    } else {
      // For data retrieval tools, render as formatted text
      return (
        <div key={index} className="p-4 border rounded-lg bg-muted">
          <div className="text-sm">
            <h4 className="font-semibold mb-2 capitalize">
              {toolName.replace(/([A-Z])/g, " $1").trim()}
            </h4>
            <pre className="whitespace-pre-wrap text-xs">
              {JSON.stringify(output, null, 2)}
            </pre>
          </div>
        </div>
      );
    }
  };

  const renderMessageContent = () => {
    if (message.role === "user") {
      // For user messages, render text content
      return (
        <div>
          {message.parts.map((part, index) => {
            if (part.type === "text") {
              return <span key={index}>{part.text}</span>;
            }
            return null;
          })}
        </div>
      );
    }

    // For assistant messages, render both text and UI components
    return (
      <div>
        {message.parts.map((part, index) => {
          if (part.type === "text") {
            return <div key={index}>{part.text}</div>;
          }

          // Handle tool invocations
          if (part.type.startsWith("tool-")) {
            const toolName = part.type.replace("tool-", "");

            // Check if this is a tool invocation part with state
            if ("state" in part) {
              // Handle different tool states
              switch (part.state) {
                case "input-streaming":
                  return (
                    <div key={index} className="p-4 border rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <span className="text-sm text-muted-foreground">
                          Preparing {toolName}...
                        </span>
                      </div>
                    </div>
                  );
                case "input-available":
                  return (
                    <div key={index} className="p-4 border rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <span className="text-sm text-muted-foreground">
                          Executing {toolName}...
                        </span>
                      </div>
                    </div>
                  );
                case "output-available":
                  if ("output" in part) {
                    return renderToolOutput(toolName, part.output, index);
                  }
                  break;
                case "output-error":
                  return (
                    <div
                      key={index}
                      className="p-4 border rounded-lg bg-destructive/10 border-destructive/20"
                    >
                      <div className="text-sm text-destructive">
                        <strong>Error executing {toolName}:</strong>
                      </div>
                      <div className="text-xs text-destructive/70 mt-1">
                        {"errorText" in part
                          ? part.errorText
                          : "An unknown error occurred"}
                      </div>
                    </div>
                  );
                default:
                  return (
                    <div key={index} className="p-4 border rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">
                        Tool call: {toolName}
                      </p>
                    </div>
                  );
              }
            }
          }

          return null;
        })}
      </div>
    );
  };

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
        <div className="text-sm">
          {renderMessageContent()}
          <span className="text-xs text-left">
            {formatDate(new Date().toISOString())}
          </span>
        </div>
      </div>
    </div>
  );
}
