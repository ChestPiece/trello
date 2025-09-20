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
import { useBoardsByWorkspace } from "@/hooks/use-boards-by-workspace";
import { useWorkspaces } from "@/hooks/use-workspaces";

export interface BoardUpdateData {
  boardId: string;
  name?: string;
  description?: string;
  visibility?: "private" | "public" | "org";
}

export interface BoardUpdateCardProps {
  onSubmit: (data: BoardUpdateData) => void;
  className?: string;
}

export function BoardUpdateCard({ onSubmit, className }: BoardUpdateCardProps) {
  const { workspaces: availableWorkspaces, loading: workspacesLoading } =
    useWorkspaces();
  const [selectedWorkspaceId, setSelectedWorkspaceId] =
    React.useState<string>("");
  const { boards: availableBoards, loading: boardsLoading } =
    useBoardsByWorkspace(selectedWorkspaceId);
  const [formData, setFormData] = React.useState<BoardUpdateData>({
    boardId: "",
    name: "",
    description: "",
    visibility: "private",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Update form data when board selection changes
  React.useEffect(() => {
    if (formData.boardId && availableBoards.length > 0) {
      const selectedBoard = availableBoards.find(
        (board) => board.id === formData.boardId
      );
      if (selectedBoard) {
        setFormData((prev) => ({
          ...prev,
          name: selectedBoard.name,
          description: selectedBoard.description || "",
          visibility:
            (selectedBoard.visibility as "private" | "public" | "org") ||
            "private",
        }));
      }
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
        name: "",
        description: "",
        visibility: "private",
      });
      setSelectedWorkspaceId("");
    } catch (error) {
      console.error("Error submitting board update:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWorkspaceChange = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    setFormData((prev) => ({
      ...prev,
      boardId: "",
    }));
  };

  const handleInputChange = (field: keyof BoardUpdateData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${className || ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Update Board</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="workspace-select" className="text-xs font-medium">
              Select Workspace *
            </Label>
            <Select
              value={selectedWorkspaceId}
              onValueChange={handleWorkspaceChange}
              disabled={workspacesLoading}
            >
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue
                  placeholder={
                    workspacesLoading
                      ? "Loading workspaces..."
                      : availableWorkspaces.length === 0
                      ? "No workspaces available"
                      : "Choose a workspace"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {workspacesLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading workspaces...
                  </SelectItem>
                ) : availableWorkspaces.length > 0 ? (
                  availableWorkspaces.map((workspace) => (
                    <SelectItem key={workspace.id} value={workspace.id}>
                      {workspace.displayName || workspace.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-workspaces" disabled>
                    No workspaces available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="board-select" className="text-xs font-medium">
              Select Board *
            </Label>
            {selectedWorkspaceId && (
              <div className="text-xs text-gray-400">
                <p>
                  Workspace: {selectedWorkspaceId} | Boards:{" "}
                  {availableBoards.length}
                </p>
                {availableBoards.length === 0 && !boardsLoading && (
                  <p className="text-red-400">No boards found</p>
                )}
              </div>
            )}
            <Select
              value={formData.boardId}
              onValueChange={(value) => handleInputChange("boardId", value)}
              disabled={boardsLoading || !selectedWorkspaceId}
            >
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue
                  placeholder={
                    !selectedWorkspaceId
                      ? "Select a workspace first"
                      : boardsLoading
                      ? "Loading boards..."
                      : availableBoards.length === 0
                      ? "No boards available in this workspace"
                      : "Choose a board to update"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {!selectedWorkspaceId ? (
                  <SelectItem value="no-workspace" disabled>
                    Select a workspace first
                  </SelectItem>
                ) : boardsLoading ? (
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
                    No boards available in this workspace
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="board-name" className="text-xs font-medium">
              Board Name
            </Label>
            <Input
              id="board-name"
              type="text"
              placeholder="Enter new board name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="board-description" className="text-xs font-medium">
              Description
            </Label>
            <Input
              id="board-description"
              type="text"
              placeholder="Enter new board description (optional)"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="board-visibility" className="text-xs font-medium">
              Visibility
            </Label>
            <Select
              value={formData.visibility}
              onValueChange={(value: "private" | "public" | "org") =>
                handleInputChange("visibility", value)
              }
            >
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="org">Organization</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full h-8 text-xs"
            disabled={
              !selectedWorkspaceId || !formData.boardId.trim() || isSubmitting
            }
          >
            {isSubmitting ? "Updating..." : "Update Board"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
