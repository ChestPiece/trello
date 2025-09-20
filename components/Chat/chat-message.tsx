import React from "react";
import { cn } from "@/lib/utils";
import { Message } from "ai";
import { FormattedText } from "../formatted-text";
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
import { useConversation } from "../conversation-provider";
import { useDataRefresh } from "../data-refresh-provider";
import { detectFormType, shouldShowAnyForm } from "../form-detection";

export interface ChatMessageProps {
  message: Message;
}

const formatDate = (timestamp: string) => {
  if (!timestamp) return "Time Stamp";

  const date = new Date(timestamp);
  return format(date, "yyyy-M-d");
};

export function ChatMessage({ message }: ChatMessageProps) {
  const { append } = useConversation();
  const { refreshLists, refreshBoards, refreshCards } = useDataRefresh();

  // Use enhanced form detection logic
  const formDetection = detectFormType(message.content, message.role);

  const handleBoardCreation = async (data: BoardCreationData) => {
    try {
      // Send a message to the AI to create the board using the Trello tools
      await append({
        id: Date.now().toString(),
        role: "user",
        content: `Create a board with name: "${data.name}", description: "${data.description}", visibility: "${data.visibility}"`,
      });
      // Trigger data refresh for boards
      refreshBoards();
    } catch (error) {
      console.error("Error creating board:", error);
    }
  };

  const handleBoardUpdate = async (data: BoardUpdateData) => {
    try {
      // Send a message to the AI to update the board using the Trello tools
      const updateMessage = `Update board with ID: "${data.boardId}"${
        data.name ? `, name: "${data.name}"` : ""
      }${data.description ? `, description: "${data.description}"` : ""}${
        data.visibility ? `, visibility: "${data.visibility}"` : ""
      }`;

      await append({
        id: Date.now().toString(),
        role: "user",
        content: updateMessage,
      });
      // Trigger data refresh for boards
      refreshBoards();
    } catch (error) {
      console.error("Error updating board:", error);
    }
  };

  const handleBoardDelete = async (data: BoardDeleteData) => {
    try {
      // Send a message to the AI to delete the board using the Trello tools
      await append({
        id: Date.now().toString(),
        role: "user",
        content: `Delete board with ID: "${data.boardId}"`,
      });
      // Trigger data refresh for boards
      refreshBoards();
    } catch (error) {
      console.error("Error deleting board:", error);
    }
  };

  const handleBoardClose = async (data: BoardCloseData) => {
    try {
      // Send a message to the AI to close/reopen the board using the Trello tools
      const action = data.action === "close" ? "close" : "reopen";
      await append({
        id: Date.now().toString(),
        role: "user",
        content: `${action} board with ID: "${data.boardId}"`,
      });
      // Trigger data refresh for boards
      refreshBoards();
    } catch (error) {
      console.error("Error closing/reopening board:", error);
    }
  };

  const handleListCreation = async (data: ListCreationData) => {
    try {
      // Send a message to the AI to create the list using the Trello tools
      await append({
        id: Date.now().toString(),
        role: "user",
        content: `Create a list in board "${data.boardId}" with name: "${data.name}", position: "${data.position}", closed: ${data.closed}, subscribe: ${data.subscribe}`,
      });
      // Trigger data refresh for lists
      refreshLists(data.boardId);
    } catch (error) {
      console.error("Error creating list:", error);
    }
  };

  const handleListUpdate = async (data: ListUpdateData) => {
    try {
      // Send a message to the AI to update the list using the Trello tools
      const updateMessage = `Update list with ID: "${data.listId}"${
        data.name ? `, name: "${data.name}"` : ""
      }${data.closed !== undefined ? `, closed: ${data.closed}` : ""}${
        data.position ? `, position: "${data.position}"` : ""
      }${data.subscribe !== undefined ? `, subscribe: ${data.subscribe}` : ""}${
        data.idBoard ? `, move to board: "${data.idBoard}"` : ""
      }`;
      await append({
        id: Date.now().toString(),
        role: "user",
        content: updateMessage,
      });
      // Trigger data refresh for lists
      refreshLists(data.idBoard);
    } catch (error) {
      console.error("Error updating list:", error);
    }
  };

  const handleListDelete = async (data: ListDeleteData) => {
    try {
      // Send a message to the AI to delete the list using the Trello tools
      await append({
        id: Date.now().toString(),
        role: "user",
        content: `Delete list with ID: "${data.listId}"`,
      });
      // Trigger data refresh for lists
      refreshLists();
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

  const handleListClose = async (data: ListCloseData) => {
    try {
      // Send a message to the AI to close/reopen the list using the Trello tools
      const action = data.action === "close" ? "close" : "reopen";
      await append({
        id: Date.now().toString(),
        role: "user",
        content: `${action} list with ID: "${data.listId}"`,
      });
      // Trigger data refresh for lists
      refreshLists();
    } catch (error) {
      console.error("Error closing/reopening list:", error);
    }
  };

  const handleListArchive = async (data: ListArchiveData) => {
    try {
      // Send a message to the AI to archive/unarchive the list using the Trello tools
      const action = data.action === "archive" ? "archive" : "unarchive";
      const archiveCards = data.archiveAllCards ? " and archive all cards" : "";
      await append({
        id: Date.now().toString(),
        role: "user",
        content: `${action} list with ID: "${data.listId}"${archiveCards}`,
      });
      // Trigger data refresh for lists
      refreshLists();
    } catch (error) {
      console.error("Error archiving/unarchiving list:", error);
    }
  };

  const handleCardCreation = async (data: CardCreationData) => {
    try {
      // Send a message to the AI to create the card using the Trello tools
      await append({
        id: Date.now().toString(),
        role: "user",
        content: `Create a card in list "${data.listId}" with name: "${
          data.name
        }"${data.description ? `, description: "${data.description}"` : ""}${
          data.position ? `, position: "${data.position}"` : ""
        }${data.due ? `, due: "${data.due}"` : ""}${
          data.urlSource ? `, copy from: "${data.urlSource}"` : ""
        }`,
      });
      // Trigger data refresh for cards
      refreshCards(undefined, data.listId);
    } catch (error) {
      console.error("Error creating card:", error);
    }
  };

  const handleCardUpdate = async (data: CardUpdateData) => {
    try {
      // Send a message to the AI to update the card using the Trello tools
      const updateMessage = `Update card with ID: "${data.cardId}"${
        data.name ? `, name: "${data.name}"` : ""
      }${data.description ? `, description: "${data.description}"` : ""}${
        data.closed !== undefined ? `, closed: ${data.closed}` : ""
      }${data.idList ? `, move to list: "${data.idList}"` : ""}${
        data.position ? `, position: "${data.position}"` : ""
      }${data.due ? `, due: "${data.due}"` : ""}${
        data.dueComplete !== undefined
          ? `, due complete: ${data.dueComplete}`
          : ""
      }${data.urlSource ? `, copy from: "${data.urlSource}"` : ""}`;
      await append({
        id: Date.now().toString(),
        role: "user",
        content: updateMessage,
      });
      // Trigger data refresh for cards
      refreshCards();
    } catch (error) {
      console.error("Error updating card:", error);
    }
  };

  const handleCardDelete = async (data: CardDeleteData) => {
    try {
      // Send a message to the AI to delete the card using the Trello tools
      await append({
        id: Date.now().toString(),
        role: "user",
        content: `Delete card with ID: "${data.cardId}"`,
      });
      // Trigger data refresh for cards
      refreshCards();
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };

  const handleWorkspaceCreation = async (data: WorkspaceCreationData) => {
    try {
      // Send a message to the AI to create the workspace using the Trello tools
      await append({
        id: Date.now().toString(),
        role: "user",
        content: `Create a workspace with display name: "${data.displayName}"${
          data.description ? `, description: "${data.description}"` : ""
        }${data.name ? `, name: "${data.name}"` : ""}${
          data.website ? `, website: "${data.website}"` : ""
        }${data.logo ? `, logo: "${data.logo}"` : ""}${
          data.permissionLevel
            ? `, permission level: "${data.permissionLevel}"`
            : ""
        }`,
      });
    } catch (error) {
      console.error("Error creating workspace:", error);
    }
  };

  const handleWorkspaceUpdate = async (data: WorkspaceUpdateData) => {
    try {
      // Send a message to the AI to update the workspace using the Trello tools
      const updateMessage = `Update workspace with ID: "${data.workspaceId}"${
        data.displayName ? `, display name: "${data.displayName}"` : ""
      }${data.description ? `, description: "${data.description}"` : ""}${
        data.name ? `, name: "${data.name}"` : ""
      }${data.website ? `, website: "${data.website}"` : ""}${
        data.logo ? `, logo: "${data.logo}"` : ""
      }${
        data.permissionLevel
          ? `, permission level: "${data.permissionLevel}"`
          : ""
      }`;
      await append({
        id: Date.now().toString(),
        role: "user",
        content: updateMessage,
      });
    } catch (error) {
      console.error("Error updating workspace:", error);
    }
  };

  const handleWorkspaceDelete = async (data: WorkspaceDeleteData) => {
    try {
      // Send a message to the AI to delete the workspace using the Trello tools
      await append({
        id: Date.now().toString(),
        role: "user",
        content: `Delete workspace with ID: "${data.workspaceId}"`,
      });
    } catch (error) {
      console.error("Error deleting workspace:", error);
    }
  };

  const handleLabelCreation = async (data: LabelCreationData) => {
    try {
      // Send a message to the AI to create the label using the Trello tools
      await append({
        id: Date.now().toString(),
        role: "user",
        content: `Create a label in board "${data.boardId}" with name: "${data.name}" and color: "${data.color}"`,
      });
    } catch (error) {
      console.error("Error creating label:", error);
    }
  };

  const handleLabelUpdate = async (data: LabelUpdateData) => {
    try {
      // Send a message to the AI to update the label using the Trello tools
      const updateMessage = `Update label with ID: "${data.labelId}"${
        data.name ? `, name: "${data.name}"` : ""
      }${data.color ? `, color: "${data.color}"` : ""}`;
      await append({
        id: Date.now().toString(),
        role: "user",
        content: updateMessage,
      });
    } catch (error) {
      console.error("Error updating label:", error);
    }
  };

  const handleLabelDelete = async (data: LabelDeleteData) => {
    try {
      // Send a message to the AI to delete the label using the Trello tools
      await append({
        id: Date.now().toString(),
        role: "user",
        content: `Delete label with ID: "${data.labelId}"`,
      });
    } catch (error) {
      console.error("Error deleting label:", error);
    }
  };

  const handleAttachmentCreation = async (data: AttachmentCreationData) => {
    try {
      // Send a message to the AI to create the attachment using the Trello tools
      const attachmentMessage = `Add attachment to card "${
        data.cardId
      }" with name: "${data.name}" and URL: "${data.url}"${
        data.mimeType ? `, mime type: "${data.mimeType}"` : ""
      }${data.setCover ? ", set as cover" : ""}`;
      await append({
        id: Date.now().toString(),
        role: "user",
        content: attachmentMessage,
      });
    } catch (error) {
      console.error("Error creating attachment:", error);
    }
  };

  const handleAttachmentDelete = async (data: AttachmentDeleteData) => {
    try {
      // Send a message to the AI to delete the attachment using the Trello tools
      await append({
        id: Date.now().toString(),
        role: "user",
        content: `Delete attachment with ID: "${data.attachmentId}"`,
      });
    } catch (error) {
      console.error("Error deleting attachment:", error);
    }
  };

  const handleChecklistCreation = async (data: ChecklistCreationData) => {
    try {
      // Send a message to the AI to create the checklist using the Trello tools
      const checklistMessage = `Create checklist in card "${
        data.cardId
      }" with name: "${data.name}"${
        data.pos ? `, position: "${data.pos}"` : ""
      }${
        data.idChecklistSource ? `, copy from: "${data.idChecklistSource}"` : ""
      }${
        data.checkItems && data.checkItems.length > 0
          ? `, with items: ${data.checkItems
              .map((item) => item.name)
              .join(", ")}`
          : ""
      }`;
      await append({
        id: Date.now().toString(),
        role: "user",
        content: checklistMessage,
      });
    } catch (error) {
      console.error("Error creating checklist:", error);
    }
  };

  const handleChecklistUpdate = async (data: ChecklistUpdateData) => {
    try {
      // Send a message to the AI to update the checklist using the Trello tools
      const updateMessage = `Update checklist with ID: "${data.checklistId}"${
        data.name ? `, name: "${data.name}"` : ""
      }${data.pos ? `, position: "${data.pos}"` : ""}`;
      await append({
        id: Date.now().toString(),
        role: "user",
        content: updateMessage,
      });
    } catch (error) {
      console.error("Error updating checklist:", error);
    }
  };

  const handleChecklistDelete = async (data: ChecklistDeleteData) => {
    try {
      // Send a message to the AI to delete the checklist using the Trello tools
      await append({
        id: Date.now().toString(),
        role: "user",
        content: `Delete checklist with ID: "${data.checklistId}"`,
      });
    } catch (error) {
      console.error("Error deleting checklist:", error);
    }
  };

  return (
    <div
      className={cn(
        "chat-message flex w-full items-start gap-4 py-4",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      {/* User Message */}
      <div
        className={cn(
          "flex flex-col gap-2 rounded-lg px-4 py-2",
          message.role === "user"
            ? "bg-primary text-primary-foreground max-w-[80%]"
            : shouldShowAnyForm(formDetection)
            ? "bg-muted w-full max-w-lg"
            : "bg-muted max-w-[80%]"
        )}
      >
        <div className="text-sm">
          {formDetection.shouldShowBoardCreationForm ? (
            <BoardCreationCard
              onSubmit={handleBoardCreation}
              className="w-full"
            />
          ) : formDetection.shouldShowBoardUpdateForm ? (
            <BoardUpdateCard
              onSubmit={handleBoardUpdate}
              className="max-w-sm"
            />
          ) : formDetection.shouldShowBoardDeleteForm ? (
            <BoardDeleteCard onSubmit={handleBoardDelete} className="w-full" />
          ) : formDetection.shouldShowBoardCloseForm ? (
            <BoardCloseCard onSubmit={handleBoardClose} className="w-full" />
          ) : formDetection.shouldShowListCreationForm ? (
            <ListCreationCard
              onSubmit={handleListCreation}
              className="w-full"
            />
          ) : formDetection.shouldShowListUpdateForm ? (
            <ListUpdateCard onSubmit={handleListUpdate} className="w-full" />
          ) : formDetection.shouldShowListDeleteForm ? (
            <ListDeleteCard onSubmit={handleListDelete} className="w-full" />
          ) : formDetection.shouldShowListCloseForm ? (
            <ListCloseCard onSubmit={handleListClose} className="w-full" />
          ) : formDetection.shouldShowListArchiveForm ? (
            <ListArchiveCard onSubmit={handleListArchive} className="w-full" />
          ) : formDetection.shouldShowCardCreationForm ? (
            <CardCreationCard
              onSubmit={handleCardCreation}
              className="w-full"
            />
          ) : formDetection.shouldShowCardUpdateForm ? (
            <CardUpdateCard onSubmit={handleCardUpdate} className="max-w-sm" />
          ) : formDetection.shouldShowCardDeleteForm ? (
            <CardDeleteCard onSubmit={handleCardDelete} className="w-full" />
          ) : formDetection.shouldShowWorkspaceCreationForm ? (
            <WorkspaceCreationCard
              onSubmit={handleWorkspaceCreation}
              className="w-full"
            />
          ) : formDetection.shouldShowWorkspaceUpdateForm ? (
            <WorkspaceUpdateCard
              onSubmit={handleWorkspaceUpdate}
              className="w-full"
            />
          ) : formDetection.shouldShowWorkspaceDeleteForm ? (
            <WorkspaceDeleteCard
              onSubmit={handleWorkspaceDelete}
              className="w-full"
            />
          ) : formDetection.shouldShowLabelCreationForm ? (
            <LabelCreationCard
              onSubmit={handleLabelCreation}
              className="w-full"
            />
          ) : formDetection.shouldShowLabelUpdateForm ? (
            <LabelUpdateCard onSubmit={handleLabelUpdate} className="w-full" />
          ) : formDetection.shouldShowLabelDeleteForm ? (
            <LabelDeleteCard onSubmit={handleLabelDelete} className="w-full" />
          ) : formDetection.shouldShowAttachmentCreationForm ? (
            <AttachmentCreationCard
              onSubmit={handleAttachmentCreation}
              className="w-full"
            />
          ) : formDetection.shouldShowAttachmentDeleteForm ? (
            <AttachmentDeleteCard
              onSubmit={handleAttachmentDelete}
              className="w-full"
            />
          ) : formDetection.shouldShowChecklistCreationForm ? (
            <ChecklistCreationCard
              onSubmit={handleChecklistCreation}
              className="w-full"
            />
          ) : formDetection.shouldShowChecklistUpdateForm ? (
            <ChecklistUpdateCard
              onSubmit={handleChecklistUpdate}
              className="w-full"
            />
          ) : formDetection.shouldShowChecklistDeleteForm ? (
            <ChecklistDeleteCard
              onSubmit={handleChecklistDelete}
              className="w-full"
            />
          ) : (
            <>
              {message.content.split("\n").map((text, i) => (
                <React.Fragment key={i}>
                  <p className={i > 0 ? "mt-2" : ""}>
                    <FormattedText content={text} />
                  </p>
                </React.Fragment>
              ))}
              <span className="text-xs text-left">
                {formatDate(new Date().toISOString())}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
