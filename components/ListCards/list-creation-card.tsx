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

export interface ListCreationData {
  boardId: string;
  name: string;
  position: "top" | "bottom" | string;
  closed: boolean;
  subscribe: boolean;
}

export interface ListCreationCardProps {
  onSubmit: (data: ListCreationData) => void;
  className?: string;
}

export function ListCreationCard({
  onSubmit,
  className,
}: ListCreationCardProps) {
  const { boards: availableBoards, loading: boardsLoading } = useBoards();
  const [formData, setFormData] = React.useState<ListCreationData>({
    boardId: "",
    name: "",
    position: "bottom",
    closed: false,
    subscribe: false,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.boardId.trim() || !formData.name.trim()) {
      return; // Don't submit if required fields are empty
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        boardId: "",
        name: "",
        position: "bottom",
        closed: false,
        subscribe: false,
      });
    } catch (error) {
      console.error("Error submitting list creation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof ListCreationData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card className={`w-full ${className || ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Create New List</CardTitle>
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

          <div className="space-y-1">
            <Label htmlFor="list-name" className="text-sm font-medium">
              List Name *
            </Label>
            <Input
              id="list-name"
              type="text"
              placeholder="Enter list name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
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
                Create as closed
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
            disabled={
              !formData.boardId.trim() || !formData.name.trim() || isSubmitting
            }
          >
            {isSubmitting ? "Creating..." : "Create List"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
