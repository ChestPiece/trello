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
import { useBoards } from "@/hooks/use-boards";
import { Lock, Unlock } from "lucide-react";

export interface BoardCloseData {
  boardId: string;
  action: "close" | "reopen";
}

export interface BoardCloseCardProps {
  onSubmit: (data: BoardCloseData) => void;
  className?: string;
}

export function BoardCloseCard({ onSubmit, className }: BoardCloseCardProps) {
  const { boards: availableBoards, loading: boardsLoading } = useBoards();
  const [formData, setFormData] = React.useState<BoardCloseData>({
    boardId: "",
    action: "close",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedBoardName, setSelectedBoardName] = React.useState<string>("");
  const [selectedBoardClosed, setSelectedBoardClosed] =
    React.useState<boolean>(false);

  // Update selected board info when board selection changes
  React.useEffect(() => {
    if (formData.boardId && availableBoards.length > 0) {
      const selectedBoard = availableBoards.find(
        (board) => board.id === formData.boardId
      );
      if (selectedBoard) {
        setSelectedBoardName(selectedBoard.name);
        setSelectedBoardClosed(selectedBoard.closed || false);
        // Auto-set action based on current board state
        setFormData((prev) => ({
          ...prev,
          action: selectedBoard.closed ? "reopen" : "close",
        }));
      }
    } else {
      setSelectedBoardName("");
      setSelectedBoardClosed(false);
    }
  }, [formData.boardId, availableBoards]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.boardId.trim()) {
      return; // Don't submit if no board is selected
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        boardId: "",
        action: "close",
      });
      setSelectedBoardName("");
      setSelectedBoardClosed(false);
    } catch (error) {
      console.error("Error submitting board close/reopen:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof BoardCloseData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid = formData.boardId.trim();

  return (
    <Card className={`w-full ${className || ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {formData.action === "close" ? (
            <>
              <Lock className="h-4 w-4" />
              Close Board
            </>
          ) : (
            <>
              <Unlock className="h-4 w-4" />
              Reopen Board
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-black font-medium">
            {formData.action === "close" ? (
              <>
                ℹ️ Closing a board will make it inactive but preserve all data.
              </>
            ) : (
              <>ℹ️ Reopening a board will make it active again.</>
            )}
          </p>
          <p className="text-xs text-black mt-1">
            {formData.action === "close"
              ? "You can reopen it later from your closed boards."
              : "All cards, lists, and data will be restored."}
          </p>
        </div>

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
                      {board.name} {board.closed ? "(Closed)" : "(Active)"}
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
              <p className="text-xs text-muted-foreground mt-1">
                Status: {selectedBoardClosed ? "Closed" : "Active"}
              </p>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="action-select" className="text-sm font-medium">
              Action *
            </Label>
            <Select
              value={formData.action}
              onValueChange={(value: "close" | "reopen") =>
                handleInputChange("action", value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="close">
                  <div className="flex items-center gap-2">
                    <Lock className="h-3 w-3" />
                    Close Board
                  </div>
                </SelectItem>
                <SelectItem value="reopen">
                  <div className="flex items-center gap-2">
                    <Unlock className="h-3 w-3" />
                    Reopen Board
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            variant={formData.action === "close" ? "secondary" : "default"}
            className="w-full"
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              formData.action === "close" ? (
                "Closing..."
              ) : (
                "Reopening..."
              )
            ) : (
              <>
                {formData.action === "close" ? (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Close Board
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Reopen Board
                  </>
                )}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


