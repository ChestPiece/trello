"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useBoards } from "@/hooks/use-boards";
import { AlertTriangle } from "lucide-react";

export interface BoardDeleteData {
  boardId: string;
  confirmationText: string;
}

export interface BoardDeleteCardProps {
  onSubmit: (data: BoardDeleteData) => void;
  className?: string;
}

export function BoardDeleteCard({ onSubmit, className }: BoardDeleteCardProps) {
  const { boards: availableBoards, loading: boardsLoading } = useBoards();
  const [formData, setFormData] = React.useState<BoardDeleteData>({
    boardId: "",
    confirmationText: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedBoardName, setSelectedBoardName] = React.useState<string>("");

  // Update selected board name when board selection changes
  React.useEffect(() => {
    if (formData.boardId && availableBoards.length > 0) {
      const selectedBoard = availableBoards.find(
        (board) => board.id === formData.boardId
      );
      if (selectedBoard) {
        setSelectedBoardName(selectedBoard.name);
      }
    } else {
      setSelectedBoardName("");
    }
  }, [formData.boardId, availableBoards]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.boardId.trim()) {
      return; // Don't submit if no board is selected
    }

    if (formData.confirmationText !== "DELETE") {
      return; // Don't submit if confirmation text is incorrect
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        boardId: "",
        confirmationText: "",
      });
      setSelectedBoardName("");
    } catch (error) {
      console.error("Error submitting board deletion:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof BoardDeleteData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid =
    formData.boardId.trim() && formData.confirmationText === "DELETE";

  return (
    <Card className={`w-full ${className || ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          Delete Board
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive font-medium">
            ⚠️ Warning: This action cannot be undone!
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Deleting a board will permanently remove all cards, lists, and data
            associated with it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="board-select" className="text-sm font-medium">
              Select Board to Delete *
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
                      : "Choose a board to delete"
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

          {selectedBoardName && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Selected Board:</p>
              <p className="text-sm text-muted-foreground">
                {selectedBoardName}
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
              placeholder="Type DELETE to confirm deletion"
              value={formData.confirmationText}
              onChange={(e) =>
                handleInputChange("confirmationText", e.target.value)
              }
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              You must type &quot;DELETE&quot; exactly to confirm this action.
            </p>
          </div>

          <Button
            type="submit"
            variant="destructive"
            className="w-full"
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? "Deleting..." : "Delete Board Permanently"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
