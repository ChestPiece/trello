"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useBoards } from "@/hooks/use-boards";
import { useCards } from "@/hooks/use-cards";
import { useAttachments } from "@/hooks/use-attachments";

export interface AttachmentDeleteData {
  attachmentId: string;
  confirmationText: string;
}

export interface AttachmentDeleteCardProps {
  onSubmit: (data: AttachmentDeleteData) => void;
  className?: string;
}

export function AttachmentDeleteCard({
  onSubmit,
  className,
}: AttachmentDeleteCardProps) {
  const { boards: availableBoards, loading: boardsLoading } = useBoards();
  const [selectedBoardId, setSelectedBoardId] = React.useState<string>("");
  const { cards: availableCards, loading: cardsLoading } =
    useCards(selectedBoardId);
  const [selectedCardId, setSelectedCardId] = React.useState<string>("");
  const { attachments: availableAttachments, loading: attachmentsLoading } =
    useAttachments(selectedCardId);

  const [formData, setFormData] = React.useState<AttachmentDeleteData>({
    attachmentId: "",
    confirmationText: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.attachmentId.trim() ||
      formData.confirmationText !== "DELETE"
    ) {
      return; // Don't submit if no attachment is selected or confirmation text is wrong
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        attachmentId: "",
        confirmationText: "",
      });
      setSelectedBoardId("");
      setSelectedCardId("");
    } catch (error) {
      console.error("Error submitting attachment deletion:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof AttachmentDeleteData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBoardChange = (boardId: string) => {
    setSelectedBoardId(boardId);
    setSelectedCardId("");
    setFormData((prev) => ({
      ...prev,
      attachmentId: "",
    }));
  };

  const handleCardChange = (cardId: string) => {
    setSelectedCardId(cardId);
    setFormData((prev) => ({
      ...prev,
      attachmentId: "",
    }));
  };

  const selectedAttachment = availableAttachments.find(
    (attachment) => attachment.id === formData.attachmentId
  );

  const selectedCard = availableCards.find(
    (card) => card.id === selectedCardId
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.startsWith("video/")) return "🎥";
    if (mimeType.startsWith("audio/")) return "🎵";
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("word")) return "📝";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
      return "📊";
    if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
      return "📽️";
    if (mimeType.includes("zip") || mimeType.includes("archive")) return "📦";
    if (mimeType.includes("text/")) return "📄";
    return "📎";
  };

  return (
    <Card className={`w-full ${className || ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-red-600">
          Delete Attachment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            <strong>Warning:</strong> This action will permanently delete the
            attachment from the card. This cannot be undone.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="board-select" className="text-sm font-medium">
              Select Board *
            </Label>
            <Select
              value={selectedBoardId}
              onValueChange={handleBoardChange}
              disabled={boardsLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    boardsLoading
                      ? "Loading boards..."
                      : availableBoards.length === 0
                      ? "No boards available"
                      : "Choose a board"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {boardsLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading boards...
                  </SelectItem>
                ) : availableBoards.length > 0 ? (
                  availableBoards.map((board) => (
                    <SelectItem key={board.id} value={board.id}>
                      {board.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-boards" disabled>
                    No boards available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="card-select" className="text-sm font-medium">
              Select Card *
            </Label>
            <Select
              value={selectedCardId}
              onValueChange={handleCardChange}
              disabled={cardsLoading || !selectedBoardId}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    !selectedBoardId
                      ? "Select a board first"
                      : cardsLoading
                      ? "Loading cards..."
                      : availableCards.length === 0
                      ? "No cards available"
                      : "Choose a card"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {!selectedBoardId ? (
                  <SelectItem value="no-board" disabled>
                    Select a board first
                  </SelectItem>
                ) : cardsLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading cards...
                  </SelectItem>
                ) : availableCards.length > 0 ? (
                  availableCards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-cards" disabled>
                    No cards available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="attachment-select" className="text-sm font-medium">
              Select Attachment to Delete *
            </Label>
            <Select
              value={formData.attachmentId}
              onValueChange={(value) =>
                handleInputChange("attachmentId", value)
              }
              disabled={attachmentsLoading || !selectedCardId}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    !selectedCardId
                      ? "Select a card first"
                      : attachmentsLoading
                      ? "Loading attachments..."
                      : availableAttachments.length === 0
                      ? "No attachments available"
                      : "Choose an attachment to delete"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {!selectedCardId ? (
                  <SelectItem value="no-card" disabled>
                    Select a card first
                  </SelectItem>
                ) : attachmentsLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading attachments...
                  </SelectItem>
                ) : availableAttachments.length > 0 ? (
                  availableAttachments.map((attachment) => (
                    <SelectItem key={attachment.id} value={attachment.id}>
                      <div className="flex items-center space-x-2">
                        <span>{getFileIcon(attachment.mimeType)}</span>
                        <span className="truncate">{attachment.name}</span>
                        {attachment.size > 0 && (
                          <span className="text-xs text-gray-500">
                            ({formatFileSize(attachment.size)})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-attachments" disabled>
                    No attachments available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedAttachment && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Attachment to delete:</strong>
                <div className="flex items-center space-x-2 mt-2">
                  <span>{getFileIcon(selectedAttachment.mimeType)}</span>
                  <div>
                    <div className="font-medium">{selectedAttachment.name}</div>
                    <div className="text-xs text-gray-600">
                      {selectedAttachment.url}
                    </div>
                    {selectedAttachment.size > 0 && (
                      <div className="text-xs text-gray-500">
                        Size: {formatFileSize(selectedAttachment.size)}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Type: {selectedAttachment.mimeType}
                    </div>
                    <div className="text-xs text-gray-500">
                      Added:{" "}
                      {new Date(selectedAttachment.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <span className="block mt-2 text-red-600">
                  ⚠️ This attachment will be permanently removed from the card.
                </span>
              </p>
            </div>
          )}

          {selectedCard && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Card:</strong> {selectedCard.name}
                {selectedCard.desc && (
                  <span className="block mt-1">
                    <strong>Description:</strong> {selectedCard.desc}
                  </span>
                )}
              </p>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="confirmation-text" className="text-sm font-medium">
              Type "DELETE" to confirm *
            </Label>
            <Input
              id="confirmation-text"
              type="text"
              placeholder="Type DELETE to confirm"
              value={formData.confirmationText}
              onChange={(e) =>
                handleInputChange("confirmationText", e.target.value)
              }
              required
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            variant="destructive"
            className="w-full"
            disabled={
              !formData.attachmentId.trim() ||
              formData.confirmationText !== "DELETE" ||
              isSubmitting
            }
          >
            {isSubmitting ? "Deleting..." : "Delete Attachment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
