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
import { useLists } from "@/hooks/use-lists";
import { useCards } from "@/hooks/use-cards";

export interface LabelCreationData {
  boardId: string;
  name: string;
  color: string;
  listId?: string;
  cardId?: string;
}

export interface LabelCreationCardProps {
  onSubmit: (data: LabelCreationData) => void;
  className?: string;
}

const LABEL_COLORS = [
  { value: "red", label: "Red", color: "bg-red-500" },
  { value: "yellow", label: "Yellow", color: "bg-yellow-500" },
  { value: "orange", label: "Orange", color: "bg-orange-500" },
  { value: "green", label: "Green", color: "bg-green-500" },
  { value: "blue", label: "Blue", color: "bg-blue-500" },
  { value: "purple", label: "Purple", color: "bg-purple-500" },
  { value: "pink", label: "Pink", color: "bg-pink-500" },
  { value: "sky", label: "Sky", color: "bg-sky-500" },
  { value: "lime", label: "Lime", color: "bg-lime-500" },
  { value: "gray", label: "Gray", color: "bg-gray-500" },
];

export function LabelCreationCard({
  onSubmit,
  className,
}: LabelCreationCardProps) {
  const [formData, setFormData] = React.useState<LabelCreationData>({
    boardId: "",
    name: "",
    color: "red",
    listId: "",
    cardId: "",
  });

  const { boards: availableBoards, loading: boardsLoading } = useBoards();

  // Use useMemo to avoid dependency issues
  const boardId = React.useMemo(() => formData.boardId, [formData.boardId]);
  const listId = React.useMemo(() => formData.listId, [formData.listId]);

  const { lists: availableLists, loading: listsLoading } = useLists(boardId);
  const { cards: availableCards, loading: cardsLoading } = useCards(
    boardId,
    listId
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.boardId.trim() || !formData.name.trim()) {
      return; // Don't submit if required fields are empty
    }

    setIsSubmitting(true);

    try {
      // Clean up the data - remove empty optional fields
      const submitData = {
        ...formData,
        listId: formData.listId || undefined,
        cardId: formData.cardId || undefined,
      };

      await onSubmit(submitData);
      // Reset form after successful submission
      setFormData({
        boardId: "",
        name: "",
        color: "red",
        listId: "",
        cardId: "",
      });
    } catch (error) {
      console.error("Error submitting label creation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof LabelCreationData, value: string) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // If board changes, reset list and card selections
      if (field === "boardId") {
        newData.listId = "";
        newData.cardId = "";
      }
      // If list changes, reset card selection
      else if (field === "listId") {
        newData.cardId = "";
      }

      return newData;
    });
  };

  return (
    <Card className={`w-full ${className || ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Create New Label</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="board-select" className="text-sm font-medium">
              Select Board *
            </Label>
            <Select
              value={formData.boardId}
              onValueChange={(value) => handleInputChange("boardId", value)}
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

          {/* List Selection - only show if board is selected */}
          {formData.boardId && (
            <div className="space-y-1">
              <Label htmlFor="list-select" className="text-sm font-medium">
                Select List (Optional)
              </Label>
              <Select
                value={formData.listId}
                onValueChange={(value) => handleInputChange("listId", value)}
                disabled={listsLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      listsLoading
                        ? "Loading lists..."
                        : availableLists.length === 0
                        ? "No lists available"
                        : "Choose a list (optional)"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific list</SelectItem>
                  {listsLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading lists...
                    </SelectItem>
                  ) : availableLists.length > 0 ? (
                    availableLists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-lists" disabled>
                      No lists available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Card Selection - only show if list is selected */}
          {formData.listId && (
            <div className="space-y-1">
              <Label htmlFor="card-select" className="text-sm font-medium">
                Select Card (Optional)
              </Label>
              <Select
                value={formData.cardId}
                onValueChange={(value) => handleInputChange("cardId", value)}
                disabled={cardsLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      cardsLoading
                        ? "Loading cards..."
                        : availableCards.length === 0
                        ? "No cards available"
                        : "Choose a card (optional)"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific card</SelectItem>
                  {cardsLoading ? (
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
          )}

          <div className="space-y-1">
            <Label htmlFor="label-name" className="text-sm font-medium">
              Label Name *
            </Label>
            <Input
              id="label-name"
              type="text"
              placeholder="Enter label name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="label-color" className="text-sm font-medium">
              Label Color *
            </Label>
            <Select
              value={formData.color}
              onValueChange={(value) => handleInputChange("color", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a color" />
              </SelectTrigger>
              <SelectContent>
                {LABEL_COLORS.map((colorOption) => (
                  <SelectItem key={colorOption.value} value={colorOption.value}>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-4 h-4 rounded-full ${colorOption.color}`}
                      />
                      <span>{colorOption.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Preview:</strong>
              <div className="flex items-center space-x-2 mt-2">
                <div
                  className={`w-4 h-4 rounded-full ${
                    LABEL_COLORS.find((c) => c.value === formData.color)
                      ?.color || "bg-red-500"
                  }`}
                />
                <span className="text-sm font-medium">
                  {formData.name || "Label Name"}
                </span>
              </div>
              {formData.listId && (
                <div className="mt-2 text-xs text-blue-600">
                  <strong>Context:</strong> Will be associated with the selected
                  list
                  {formData.cardId && " and added to the selected card"}
                </div>
              )}
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              !formData.boardId.trim() || !formData.name.trim() || isSubmitting
            }
          >
            {isSubmitting ? "Creating..." : "Create Label"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
