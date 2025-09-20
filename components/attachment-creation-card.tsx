"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useBoards } from "@/hooks/use-boards";
import { useLists } from "@/hooks/use-lists";
import { useCards } from "@/hooks/use-cards";

export interface AttachmentCreationData {
  cardId: string;
  name: string;
  url: string;
  mimeType?: string;
  setCover?: boolean;
}

export interface AttachmentCreationCardProps {
  onSubmit: (data: AttachmentCreationData) => void;
  className?: string;
}

const COMMON_MIME_TYPES = [
  { value: "image/jpeg", label: "JPEG Image" },
  { value: "image/png", label: "PNG Image" },
  { value: "image/gif", label: "GIF Image" },
  { value: "image/webp", label: "WebP Image" },
  { value: "application/pdf", label: "PDF Document" },
  { value: "application/msword", label: "Word Document (.doc)" },
  {
    value:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    label: "Word Document (.docx)",
  },
  { value: "application/vnd.ms-excel", label: "Excel Spreadsheet (.xls)" },
  {
    value: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    label: "Excel Spreadsheet (.xlsx)",
  },
  {
    value: "application/vnd.ms-powerpoint",
    label: "PowerPoint Presentation (.ppt)",
  },
  {
    value:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    label: "PowerPoint Presentation (.pptx)",
  },
  { value: "text/plain", label: "Text File" },
  { value: "text/csv", label: "CSV File" },
  { value: "application/zip", label: "ZIP Archive" },
  { value: "text/html", label: "Web Page" },
];

export function AttachmentCreationCard({
  onSubmit,
  className,
}: AttachmentCreationCardProps) {
  const { boards: availableBoards, loading: boardsLoading } = useBoards();
  const [selectedBoardId, setSelectedBoardId] = React.useState<string>("");
  const { lists: availableLists, loading: listsLoading } =
    useLists(selectedBoardId);
  const { cards: availableCards, loading: cardsLoading } =
    useCards(selectedBoardId);

  const [formData, setFormData] = React.useState<AttachmentCreationData>({
    cardId: "",
    name: "",
    url: "",
    mimeType: "",
    setCover: false,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.cardId.trim() ||
      !formData.name.trim() ||
      !formData.url.trim()
    ) {
      return; // Don't submit if required fields are empty
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        cardId: "",
        name: "",
        url: "",
        mimeType: "",
        setCover: false,
      });
      setSelectedBoardId("");
    } catch (error) {
      console.error("Error submitting attachment creation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof AttachmentCreationData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBoardChange = (boardId: string) => {
    setSelectedBoardId(boardId);
    setFormData((prev) => ({
      ...prev,
      cardId: "",
    }));
  };

  const selectedCard = availableCards.find(
    (card) => card.id === formData.cardId
  );

  return (
    <Card className={`w-full ${className || ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Add Attachment</CardTitle>
      </CardHeader>
      <CardContent>
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
              value={formData.cardId}
              onValueChange={(value) => handleInputChange("cardId", value)}
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
            <Label htmlFor="attachment-name" className="text-sm font-medium">
              Attachment Name *
            </Label>
            <Input
              id="attachment-name"
              type="text"
              placeholder="Enter attachment name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="attachment-url" className="text-sm font-medium">
              URL *
            </Label>
            <Input
              id="attachment-url"
              type="url"
              placeholder="https://example.com/file.pdf"
              value={formData.url}
              onChange={(e) => handleInputChange("url", e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="mime-type" className="text-sm font-medium">
              File Type
            </Label>
            <Select
              value={formData.mimeType}
              onValueChange={(value) => handleInputChange("mimeType", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select file type (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Auto-detect</SelectItem>
                {COMMON_MIME_TYPES.map((mimeType) => (
                  <SelectItem key={mimeType.value} value={mimeType.value}>
                    {mimeType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="set-cover"
              checked={formData.setCover}
              onChange={(e) => handleInputChange("setCover", e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="set-cover" className="text-sm">
              Set as card cover
            </Label>
          </div>

          {selectedCard && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Target Card:</strong> {selectedCard.name}
                {selectedCard.desc && (
                  <span className="block mt-1">
                    <strong>Description:</strong> {selectedCard.desc}
                  </span>
                )}
                {selectedCard.due && (
                  <span className="block mt-1">
                    <strong>Due:</strong>{" "}
                    {new Date(selectedCard.due).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
          )}

          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <strong>Attachment Preview:</strong>
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                  <span className="text-sm font-medium">
                    {formData.name || "Attachment Name"}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {formData.url || "https://example.com/file"}
                </div>
                {formData.mimeType && (
                  <div className="text-xs text-gray-500 mt-1">
                    Type:{" "}
                    {COMMON_MIME_TYPES.find(
                      (m) => m.value === formData.mimeType
                    )?.label || formData.mimeType}
                  </div>
                )}
              </div>
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              !formData.cardId.trim() ||
              !formData.name.trim() ||
              !formData.url.trim() ||
              isSubmitting
            }
          >
            {isSubmitting ? "Adding..." : "Add Attachment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


