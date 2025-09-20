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

export interface CardDeleteData {
  cardId: string;
  confirmationText: string;
}

export interface CardDeleteCardProps {
  onSubmit: (data: CardDeleteData) => void;
  className?: string;
}

export function CardDeleteCard({ onSubmit, className }: CardDeleteCardProps) {
  const { boards: availableBoards, loading: boardsLoading } = useBoards();
  const [selectedBoardId, setSelectedBoardId] = React.useState<string>("");
  const { cards: availableCards, loading: cardsLoading } =
    useCards(selectedBoardId);

  const [formData, setFormData] = React.useState<CardDeleteData>({
    cardId: "",
    confirmationText: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cardId.trim() || formData.confirmationText !== "DELETE") {
      return; // Don't submit if no card is selected or confirmation text is wrong
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        cardId: "",
        confirmationText: "",
      });
      setSelectedBoardId("");
    } catch (error) {
      console.error("Error submitting card deletion:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CardDeleteData, value: string) => {
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
        <CardTitle className="text-base text-red-600">Delete Card</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            <strong>Warning:</strong> This action will permanently delete the
            card and all its data including attachments, comments, and
            checklists. This cannot be undone.
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
              Select Card to Delete *
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
                      : "Choose a card to delete"
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

          {selectedCard && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Card to delete:</strong> {selectedCard.name}
                {selectedCard.desc && (
                  <span className="block mt-1">
                    <strong>Description:</strong> {selectedCard.desc}
                  </span>
                )}
                {selectedCard.due && (
                  <span className="block mt-1">
                    <strong>Due Date:</strong>{" "}
                    {new Date(selectedCard.due).toLocaleDateString()}
                  </span>
                )}
                {selectedCard.attachments &&
                  selectedCard.attachments.length > 0 && (
                    <span className="block mt-1">
                      This card has {selectedCard.attachments.length}{" "}
                      attachment(s) that will be deleted.
                    </span>
                  )}
                {selectedCard.checklists &&
                  selectedCard.checklists.length > 0 && (
                    <span className="block mt-1">
                      This card has {selectedCard.checklists.length}{" "}
                      checklist(s) that will be deleted.
                    </span>
                  )}
                {selectedCard.members && selectedCard.members.length > 0 && (
                  <span className="block mt-1">
                    This card has {selectedCard.members.length} member(s)
                    assigned.
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
              !formData.cardId.trim() ||
              formData.confirmationText !== "DELETE" ||
              isSubmitting
            }
          >
            {isSubmitting ? "Deleting..." : "Delete Card"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
