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

export interface ListUpdateData {
  listId: string;
  name?: string;
  closed?: boolean;
  position?: string;
  subscribe?: boolean;
  idBoard?: string;
}

export interface ListUpdateCardProps {
  onSubmit: (data: ListUpdateData) => void;
  className?: string;
}

export function ListUpdateCard({ onSubmit, className }: ListUpdateCardProps) {
  const { boards: availableBoards, loading: boardsLoading } = useBoards();
  const [selectedBoardId, setSelectedBoardId] = React.useState<string>("");
  const { lists: availableLists, loading: listsLoading } =
    useLists(selectedBoardId);

  const [formData, setFormData] = React.useState<ListUpdateData>({
    listId: "",
    name: "",
    closed: false,
    position: "1",
    subscribe: false,
    idBoard: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Update form data when list selection changes
  React.useEffect(() => {
    if (formData.listId && availableLists.length > 0) {
      const selectedList = availableLists.find(
        (list) => list.id === formData.listId
      );
      if (selectedList) {
        setFormData((prev) => ({
          ...prev,
          name: selectedList.name,
          closed: selectedList.closed,
          position: selectedList.pos.toString(),
          subscribe: selectedList.subscribed,
          idBoard: selectedList.idBoard,
        }));
        setSelectedBoardId(selectedList.idBoard);
      }
    }
  }, [formData.listId, availableLists]);

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
        name: "",
        closed: false,
        position: "1",
        subscribe: false,
        idBoard: "",
      });
      setSelectedBoardId("");
    } catch (error) {
      console.error("Error submitting list update:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof ListUpdateData,
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
      listId: "",
      idBoard: boardId,
    }));
  };

  return (
    <Card className={`w-full ${className || ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Update List</CardTitle>
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
                      : "Choose a list to update"
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

          <div className="space-y-1">
            <Label htmlFor="list-name" className="text-sm font-medium">
              List Name
            </Label>
            <Input
              id="list-name"
              type="text"
              placeholder="Enter new list name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="list-position" className="text-sm font-medium">
              Position
            </Label>
            <Select
              value={formData.position}
              onValueChange={(value) => handleInputChange("position", value)}
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

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="list-closed"
                checked={formData.closed}
                onChange={(e) => handleInputChange("closed", e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="list-closed" className="text-sm">
                Close list
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="list-subscribe"
                checked={formData.subscribe}
                onChange={(e) =>
                  handleInputChange("subscribe", e.target.checked)
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="list-subscribe" className="text-sm">
                Subscribe to list
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!formData.listId.trim() || isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update List"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
