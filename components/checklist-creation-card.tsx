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

export interface ChecklistItemData {
  name: string;
  pos?: number;
  due?: string;
  idMember?: string;
}

export interface ChecklistCreationData {
  cardId: string;
  name: string;
  pos?: "top" | "bottom" | number;
  idChecklistSource?: string;
  checkItems?: ChecklistItemData[];
}

export interface ChecklistCreationCardProps {
  onSubmit: (data: ChecklistCreationData) => void;
  className?: string;
}

export function ChecklistCreationCard({
  onSubmit,
  className,
}: ChecklistCreationCardProps) {
  const { boards: availableBoards, loading: boardsLoading } = useBoards();
  const [selectedBoardId, setSelectedBoardId] = React.useState<string>("");
  const { lists: availableLists, loading: listsLoading } =
    useLists(selectedBoardId);
  const { cards: availableCards, loading: cardsLoading } =
    useCards(selectedBoardId);

  const [formData, setFormData] = React.useState<ChecklistCreationData>({
    cardId: "",
    name: "",
    pos: "bottom",
    idChecklistSource: "",
    checkItems: [],
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [newItemName, setNewItemName] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cardId.trim() || !formData.name.trim()) {
      return; // Don't submit if required fields are empty
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        cardId: "",
        name: "",
        pos: "bottom",
        idChecklistSource: "",
        checkItems: [],
      });
      setSelectedBoardId("");
      setNewItemName("");
    } catch (error) {
      console.error("Error submitting checklist creation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof ChecklistCreationData,
    value: string | ChecklistItemData[]
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

  const addChecklistItem = () => {
    if (newItemName.trim()) {
      const newItem: ChecklistItemData = {
        name: newItemName.trim(),
        pos: (formData.checkItems?.length || 0) + 1,
      };

      setFormData((prev) => ({
        ...prev,
        checkItems: [...(prev.checkItems || []), newItem],
      }));
      setNewItemName("");
    }
  };

  const removeChecklistItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      checkItems: prev.checkItems?.filter((_, i) => i !== index) || [],
    }));
  };

  const selectedCard = availableCards.find(
    (card) => card.id === formData.cardId
  );

  return (
    <Card className={`w-full ${className || ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Create New Checklist</CardTitle>
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
            <Label htmlFor="checklist-name" className="text-sm font-medium">
              Checklist Name *
            </Label>
            <Input
              id="checklist-name"
              type="text"
              placeholder="Enter checklist name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="checklist-position" className="text-sm font-medium">
              Position
            </Label>
            <Select
              value={formData.pos}
              onValueChange={(value) => handleInputChange("pos", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
                <SelectItem value="1">Position 1</SelectItem>
                <SelectItem value="2">Position 2</SelectItem>
                <SelectItem value="3">Position 3</SelectItem>
                <SelectItem value="4">Position 4</SelectItem>
                <SelectItem value="5">Position 5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="checklist-source" className="text-sm font-medium">
              Copy from Checklist (optional)
            </Label>
            <Input
              id="checklist-source"
              type="text"
              placeholder="Enter checklist ID to copy from"
              value={formData.idChecklistSource}
              onChange={(e) =>
                handleInputChange("idChecklistSource", e.target.value)
              }
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Checklist Items (optional)
            </Label>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter checklist item name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addChecklistItem();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addChecklistItem}
                disabled={!newItemName.trim()}
              >
                Add
              </Button>
            </div>

            {formData.checkItems && formData.checkItems.length > 0 && (
              <div className="space-y-1">
                {formData.checkItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm">☐</span>
                    <span className="text-sm flex-1">{item.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeChecklistItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
              <strong>Checklist Preview:</strong>
              <div className="mt-2">
                <div className="font-medium">
                  {formData.name || "Checklist Name"}
                </div>
                {formData.checkItems && formData.checkItems.length > 0 ? (
                  <div className="mt-1 space-y-1">
                    {formData.checkItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <span>☐</span>
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 mt-1">
                    No items added yet
                  </div>
                )}
              </div>
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              !formData.cardId.trim() || !formData.name.trim() || isSubmitting
            }
          >
            {isSubmitting ? "Creating..." : "Create Checklist"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


