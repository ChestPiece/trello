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

export interface ListDeleteData {
  listId: string;
  confirmationText: string;
}

export interface ListDeleteCardProps {
  onSubmit: (data: ListDeleteData) => void;
  className?: string;
}

export function ListDeleteCard({ onSubmit, className }: ListDeleteCardProps) {
  const { boards: availableBoards, loading: boardsLoading } = useBoards();
  const [selectedBoardId, setSelectedBoardId] = React.useState<string>("");
  const { lists: availableLists, loading: listsLoading } =
    useLists(selectedBoardId);

  const [formData, setFormData] = React.useState<ListDeleteData>({
    listId: "",
    confirmationText: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.listId.trim() || formData.confirmationText !== "DELETE") {
      return; // Don't submit if no list is selected or confirmation text is wrong
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        listId: "",
        confirmationText: "",
      });
      setSelectedBoardId("");
    } catch (error) {
      console.error("Error submitting list deletion:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ListDeleteData, value: string) => {
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

  return (
    <Card className={`w-full ${className || ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-red-600">Delete List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            <strong>Warning:</strong> This action will permanently delete the
            list and all its cards. This cannot be undone.
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
            <Label htmlFor="list-select" className="text-sm font-medium">
              Select List to Delete *
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
                      : "Choose a list to delete"
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

          {selectedList && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>List to delete:</strong> {selectedList.name}
                {selectedList.cards && selectedList.cards.length > 0 && (
                  <span className="block mt-1">
                    This list contains {selectedList.cards.length} card(s) that
                    will also be deleted.
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
              !formData.listId.trim() ||
              formData.confirmationText !== "DELETE" ||
              isSubmitting
            }
          >
            {isSubmitting ? "Deleting..." : "Delete List"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
