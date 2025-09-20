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
import { useLists } from "@/hooks/use-lists";

export interface ListCloseData {
  listId: string;
  action: "close" | "reopen";
}

export interface ListCloseCardProps {
  onSubmit: (data: ListCloseData) => void;
  className?: string;
}

export function ListCloseCard({ onSubmit, className }: ListCloseCardProps) {
  const { boards: availableBoards, loading: boardsLoading } = useBoards();
  const [selectedBoardId, setSelectedBoardId] = React.useState<string>("");
  const { lists: availableLists, loading: listsLoading } =
    useLists(selectedBoardId);

  const [formData, setFormData] = React.useState<ListCloseData>({
    listId: "",
    action: "close",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.listId.trim()) {
      return; // Don't submit if no list is selected
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        listId: "",
        action: "close",
      });
      setSelectedBoardId("");
    } catch (error) {
      console.error("Error submitting list close/reopen:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ListCloseData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBoardChange = (boardId: string) => {
    setSelectedBoardId(boardId);
    setFormData((prev) => ({
      ...prev,
      listId: "",
    }));
  };

  const selectedList = availableLists.find(
    (list) => list.id === formData.listId
  );
  const isClosing = formData.action === "close";

  return (
    <Card className={`w-full ${className || ""}`}>
      <CardHeader className="pb-3">
        <CardTitle
          className={`text-base ${
            isClosing ? "text-orange-600" : "text-green-600"
          }`}
        >
          {isClosing ? "Close List" : "Reopen List"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`mb-4 p-3 border rounded-md ${
            isClosing
              ? "bg-orange-50 border-orange-200"
              : "bg-green-50 border-green-200"
          }`}
        >
          <p
            className={`text-sm ${
              isClosing ? "text-orange-800" : "text-green-800"
            }`}
          >
            {isClosing ? (
              <>
                <strong>Close List:</strong> This will hide the list from the
                board view. The list and its cards will be preserved and can be
                reopened later.
              </>
            ) : (
              <>
                <strong>Reopen List:</strong> This will make the list visible
                again on the board.
              </>
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
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
                <SelectItem value="close">Close List</SelectItem>
                <SelectItem value="reopen">Reopen List</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
            <Label htmlFor="list-select" className="text-sm font-medium">
              Select List *
            </Label>
            <Select
              value={formData.listId}
              onValueChange={(value) => handleInputChange("listId", value)}
              disabled={listsLoading || !selectedBoardId}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    !selectedBoardId
                      ? "Select a board first"
                      : listsLoading
                      ? "Loading lists..."
                      : availableLists.length === 0
                      ? "No lists available"
                      : isClosing
                      ? "Choose a list to close"
                      : "Choose a list to reopen"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {!selectedBoardId ? (
                  <SelectItem value="no-board" disabled>
                    Select a board first
                  </SelectItem>
                ) : listsLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading lists...
                  </SelectItem>
                ) : availableLists.length > 0 ? (
                  availableLists
                    .filter((list) => (isClosing ? !list.closed : list.closed))
                    .map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name} {list.closed ? "(Closed)" : ""}
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

          {selectedList && (
            <div
              className={`p-3 border rounded-md ${
                isClosing
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <p
                className={`text-sm ${
                  isClosing ? "text-yellow-800" : "text-blue-800"
                }`}
              >
                <strong>List:</strong> {selectedList.name}
                {selectedList.cards && selectedList.cards.length > 0 && (
                  <span className="block mt-1">
                    This list contains {selectedList.cards.length} card(s).
                  </span>
                )}
              </p>
            </div>
          )}

          <Button
            type="submit"
            className={`w-full ${
              isClosing
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
            disabled={!formData.listId.trim() || isSubmitting}
          >
            {isSubmitting
              ? isClosing
                ? "Closing..."
                : "Reopening..."
              : isClosing
              ? "Close List"
              : "Reopen List"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
