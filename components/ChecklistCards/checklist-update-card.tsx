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
import { useChecklists } from "@/hooks/use-checklists";

export interface ChecklistUpdateData {
  checklistId: string;
  name?: string;
  pos?: "top" | "bottom" | number;
}

export interface ChecklistUpdateCardProps {
  onSubmit: (data: ChecklistUpdateData) => void;
  className?: string;
}

export function ChecklistUpdateCard({
  onSubmit,
  className,
}: ChecklistUpdateCardProps) {
  const { boards: availableBoards, loading: boardsLoading } = useBoards();
  const [selectedBoardId, setSelectedBoardId] = React.useState<string>("");
  const { cards: availableCards, loading: cardsLoading } =
    useCards(selectedBoardId);
  const [selectedCardId, setSelectedCardId] = React.useState<string>("");
  const { checklists: availableChecklists, loading: checklistsLoading } =
    useChecklists(selectedCardId);

  const [formData, setFormData] = React.useState<ChecklistUpdateData>({
    checklistId: "",
    name: "",
    pos: "bottom",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Update form data when checklist selection changes
  React.useEffect(() => {
    if (formData.checklistId && availableChecklists.length > 0) {
      const selectedChecklist = availableChecklists.find(
        (checklist) => checklist.id === formData.checklistId
      );
      if (selectedChecklist) {
        setFormData((prev) => ({
          ...prev,
          name: selectedChecklist.name,
          pos: selectedChecklist.pos,
        }));
        setSelectedCardId(selectedChecklist.idCard);
        // Find the board ID from the card
        const card = availableCards.find(
          (c) => c.id === selectedChecklist.idCard
        );
        if (card && card.idBoard) {
          setSelectedBoardId(card.idBoard);
        }
      }
    }
  }, [formData.checklistId, availableChecklists, availableCards]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.checklistId.trim()) {
      return; // Don't submit if no checklist is selected
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        checklistId: "",
        name: "",
        pos: "bottom",
      });
      setSelectedBoardId("");
      setSelectedCardId("");
    } catch (error) {
      console.error("Error submitting checklist update:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof ChecklistUpdateData,
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
      checklistId: "",
    }));
  };

  const handleCardChange = (cardId: string) => {
    setSelectedCardId(cardId);
    setFormData((prev) => ({
      ...prev,
      checklistId: "",
    }));
  };

  const selectedChecklist = availableChecklists.find(
    (checklist) => checklist.id === formData.checklistId
  );

  const selectedCard = availableCards.find(
    (card) => card.id === selectedCardId
  );

  return (
    <Card className={`w-full ${className || ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Update Checklist</CardTitle>
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
            <Label htmlFor="checklist-select" className="text-sm font-medium">
              Select Checklist *
            </Label>
            <Select
              value={formData.checklistId}
              onValueChange={(value) => handleInputChange("checklistId", value)}
              disabled={checklistsLoading || !selectedCardId}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    !selectedCardId
                      ? "Select a card first"
                      : checklistsLoading
                      ? "Loading checklists..."
                      : availableChecklists.length === 0
                      ? "No checklists available"
                      : "Choose a checklist to update"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {!selectedCardId ? (
                  <SelectItem value="no-card" disabled>
                    Select a card first
                  </SelectItem>
                ) : checklistsLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading checklists...
                  </SelectItem>
                ) : availableChecklists.length > 0 ? (
                  availableChecklists.map((checklist) => (
                    <SelectItem key={checklist.id} value={checklist.id}>
                      <div className="flex items-center space-x-2">
                        <span>📋</span>
                        <span>{checklist.name}</span>
                        <span className="text-xs text-gray-500">
                          ({checklist.checkItems.length} items)
                        </span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-checklists" disabled>
                    No checklists available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="checklist-name" className="text-sm font-medium">
              Checklist Name
            </Label>
            <Input
              id="checklist-name"
              type="text"
              placeholder="Enter new checklist name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="checklist-position" className="text-sm font-medium">
              Position
            </Label>
            <Select
              value={formData.pos?.toString()}
              onValueChange={(value) => handleInputChange("pos", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Position 1</SelectItem>
                <SelectItem value="2">Position 2</SelectItem>
                <SelectItem value="3">Position 3</SelectItem>
                <SelectItem value="4">Position 4</SelectItem>
                <SelectItem value="5">Position 5</SelectItem>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedChecklist && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Current Checklist:</strong> {selectedChecklist.name}
                <div className="mt-2">
                  <div className="text-sm">
                    <strong>Items:</strong>{" "}
                    {selectedChecklist.checkItems.length}
                  </div>
                  <div className="text-sm">
                    <strong>Completed:</strong>{" "}
                    {
                      selectedChecklist.checkItems.filter(
                        (item) => item.state === "complete"
                      ).length
                    }
                  </div>
                  <div className="text-sm">
                    <strong>Remaining:</strong>{" "}
                    {
                      selectedChecklist.checkItems.filter(
                        (item) => item.state === "incomplete"
                      ).length
                    }
                  </div>
                </div>
                {selectedChecklist.checkItems.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs font-medium">Items:</div>
                    <div className="space-y-1 mt-1">
                      {selectedChecklist.checkItems
                        .slice(0, 3)
                        .map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 text-xs"
                          >
                            <span>{item.state === "complete" ? "☑" : "☐"}</span>
                            <span
                              className={
                                item.state === "complete"
                                  ? "line-through text-gray-500"
                                  : ""
                              }
                            >
                              {item.name}
                            </span>
                          </div>
                        ))}
                      {selectedChecklist.checkItems.length > 3 && (
                        <div className="text-xs text-gray-500">
                          ... and {selectedChecklist.checkItems.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </p>
            </div>
          )}

          {selectedCard && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                <strong>Card:</strong> {selectedCard.name}
                {selectedCard.desc && (
                  <span className="block mt-1">
                    <strong>Description:</strong> {selectedCard.desc}
                  </span>
                )}
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!formData.checklistId.trim() || isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Checklist"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
