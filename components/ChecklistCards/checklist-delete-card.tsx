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

export interface ChecklistDeleteData {
  checklistId: string;
  confirmationText: string;
}

export interface ChecklistDeleteCardProps {
  onSubmit: (data: ChecklistDeleteData) => void;
  className?: string;
}

export function ChecklistDeleteCard({
  onSubmit,
  className,
}: ChecklistDeleteCardProps) {
  const { boards: availableBoards, loading: boardsLoading } = useBoards();
  const [selectedBoardId, setSelectedBoardId] = React.useState<string>("");
  const { cards: availableCards, loading: cardsLoading } =
    useCards(selectedBoardId);
  const [selectedCardId, setSelectedCardId] = React.useState<string>("");
  const { checklists: availableChecklists, loading: checklistsLoading } =
    useChecklists(selectedCardId);

  const [formData, setFormData] = React.useState<ChecklistDeleteData>({
    checklistId: "",
    confirmationText: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.checklistId.trim() ||
      formData.confirmationText !== "DELETE"
    ) {
      return; // Don't submit if no checklist is selected or confirmation text is wrong
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        checklistId: "",
        confirmationText: "",
      });
      setSelectedBoardId("");
      setSelectedCardId("");
    } catch (error) {
      console.error("Error submitting checklist deletion:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof ChecklistDeleteData,
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
        <CardTitle className="text-base text-red-600">
          Delete Checklist
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            <strong>Warning:</strong> This action will permanently delete the
            checklist and all its items from the card. This cannot be undone.
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
            <Label htmlFor="checklist-select" className="text-sm font-medium">
              Select Checklist to Delete *
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
                      : "Choose a checklist to delete"
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
                          ({checklist.checkItems?.length || 0} items)
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

          {selectedChecklist && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Checklist to delete:</strong> {selectedChecklist.name}
                <div className="mt-2">
                  <div className="text-sm">
                    <strong>Total Items:</strong>{" "}
                    {selectedChecklist.checkItems?.length || 0}
                  </div>
                  <div className="text-sm">
                    <strong>Completed:</strong>{" "}
                    {selectedChecklist.checkItems?.filter(
                      (item) => item.state === "complete"
                    ).length || 0}
                  </div>
                  <div className="text-sm">
                    <strong>Remaining:</strong>{" "}
                    {selectedChecklist.checkItems?.filter(
                      (item) => item.state === "incomplete"
                    ).length || 0}
                  </div>
                </div>
                {(selectedChecklist.checkItems?.length || 0) > 0 && (
                  <div className="mt-2">
                    <div className="text-xs font-medium">
                      Items that will be deleted:
                    </div>
                    <div className="space-y-1 mt-1">
                      {selectedChecklist.checkItems
                        ?.slice(0, 5)
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
                      {(selectedChecklist.checkItems?.length || 0) > 5 && (
                        <div className="text-xs text-gray-500">
                          ... and{" "}
                          {(selectedChecklist.checkItems?.length || 0) - 5} more
                          items
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <span className="block mt-2 text-red-600">
                  ⚠️ All checklist items will be permanently deleted.
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
              Type &quot;DELETE&quot; to confirm *
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
              !formData.checklistId.trim() ||
              formData.confirmationText !== "DELETE" ||
              isSubmitting
            }
          >
            {isSubmitting ? "Deleting..." : "Delete Checklist"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
