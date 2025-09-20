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

export interface CardCreationData {
  listId: string;
  name: string;
  description?: string;
  position?: "top" | "bottom" | string;
  due?: string;
  idMembers?: string[];
  idLabels?: string[];
  urlSource?: string;
  keepFromSource?:
    | "all"
    | "none"
    | "attachments"
    | "checklists"
    | "comments"
    | "cover";
}

export interface CardCreationCardProps {
  onSubmit: (data: CardCreationData) => void;
  className?: string;
}

export function CardCreationCard({
  onSubmit,
  className,
}: CardCreationCardProps) {
  const { boards: availableBoards, loading: boardsLoading } = useBoards();
  const [selectedBoardId, setSelectedBoardId] = React.useState<string>("");
  const { lists: availableLists, loading: listsLoading } =
    useLists(selectedBoardId);

  const [formData, setFormData] = React.useState<CardCreationData>({
    listId: "",
    name: "",
    description: "",
    position: "bottom",
    due: "",
    idMembers: [],
    idLabels: [],
    urlSource: "",
    keepFromSource: "none",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.listId.trim() || !formData.name.trim()) {
      return; // Don't submit if required fields are empty
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        listId: "",
        name: "",
        description: "",
        position: "bottom",
        due: "",
        idMembers: [],
        idLabels: [],
        urlSource: "",
        keepFromSource: "none",
      });
      setSelectedBoardId("");
    } catch (error) {
      console.error("Error submitting card creation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof CardCreationData,
    value: string | string[]
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
    }));
  };

  return (
    <Card className={`w-full ${className || ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Create New Card</CardTitle>
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
                      : "Choose a list"
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
            <Label htmlFor="card-name" className="text-sm font-medium">
              Card Name *
            </Label>
            <Input
              id="card-name"
              type="text"
              placeholder="Enter card name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="card-description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="card-description"
              placeholder="Enter card description (optional)"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full min-h-[80px]"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="card-position" className="text-sm font-medium">
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

          <div className="space-y-1">
            <Label htmlFor="card-due" className="text-sm font-medium">
              Due Date
            </Label>
            <Input
              id="card-due"
              type="datetime-local"
              value={formData.due}
              onChange={(e) => handleInputChange("due", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="card-url-source" className="text-sm font-medium">
              Copy from URL (optional)
            </Label>
            <Input
              id="card-url-source"
              type="url"
              placeholder="Enter URL to copy card from"
              value={formData.urlSource}
              onChange={(e) => handleInputChange("urlSource", e.target.value)}
              className="w-full"
            />
          </div>

          {formData.urlSource && (
            <div className="space-y-1">
              <Label htmlFor="keep-from-source" className="text-sm font-medium">
                Keep from source
              </Label>
              <Select
                value={formData.keepFromSource}
                onValueChange={(value) =>
                  handleInputChange("keepFromSource", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select what to keep" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nothing</SelectItem>
                  <SelectItem value="all">Everything</SelectItem>
                  <SelectItem value="attachments">Attachments only</SelectItem>
                  <SelectItem value="checklists">Checklists only</SelectItem>
                  <SelectItem value="comments">Comments only</SelectItem>
                  <SelectItem value="cover">Cover only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={
              !formData.listId.trim() || !formData.name.trim() || isSubmitting
            }
          >
            {isSubmitting ? "Creating..." : "Create Card"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
