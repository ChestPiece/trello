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
import { useBoardsByWorkspace } from "@/hooks/use-boards-by-workspace";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useLists } from "@/hooks/use-lists";
import { useCards } from "@/hooks/use-cards";

export interface CardUpdateData {
  cardId: string;
  name?: string;
  description?: string;
  closed?: boolean;
  idList?: string;
  position?: string;
  due?: string;
  dueComplete?: boolean;
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

export interface CardUpdateCardProps {
  onSubmit: (data: CardUpdateData) => void;
  className?: string;
}

export function CardUpdateCard({ onSubmit, className }: CardUpdateCardProps) {
  const { workspaces: availableWorkspaces, loading: workspacesLoading } =
    useWorkspaces();
  const [selectedWorkspaceId, setSelectedWorkspaceId] =
    React.useState<string>("");
  const { boards: availableBoards, loading: boardsLoading } =
    useBoardsByWorkspace(selectedWorkspaceId);
  const [selectedBoardId, setSelectedBoardId] = React.useState<string>("");
  const { lists: availableLists, loading: listsLoading } =
    useLists(selectedBoardId);
  const { cards: availableCards, loading: cardsLoading } =
    useCards(selectedBoardId);

  const [formData, setFormData] = React.useState<CardUpdateData>({
    cardId: "",
    name: "",
    description: "",
    closed: false,
    idList: "",
    position: "1",
    due: "",
    dueComplete: false,
    idMembers: [],
    idLabels: [],
    urlSource: "",
    keepFromSource: "none",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Update form data when card selection changes
  React.useEffect(() => {
    if (formData.cardId && availableCards.length > 0) {
      const selectedCard = availableCards.find(
        (card) => card.id === formData.cardId
      );
      if (selectedCard) {
        setFormData((prev) => ({
          ...prev,
          name: selectedCard.name,
          description: selectedCard.desc || "",
          closed: selectedCard.closed,
          idList: selectedCard.idList,
          position: selectedCard.pos.toString(),
          due: selectedCard.due || "",
          dueComplete: selectedCard.dueComplete || false,
          idMembers: selectedCard.idMembers || [],
          idLabels: selectedCard.idLabels || [],
        }));
        setSelectedBoardId(selectedCard.idBoard || "");
      }
    }
  }, [formData.cardId, availableCards]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cardId.trim()) {
      return; // Don't submit if no card is selected
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        cardId: "",
        name: "",
        description: "",
        closed: false,
        idList: "",
        position: "1",
        due: "",
        dueComplete: false,
        idMembers: [],
        idLabels: [],
        urlSource: "",
        keepFromSource: "none",
      });
      setSelectedWorkspaceId("");
      setSelectedBoardId("");
    } catch (error) {
      console.error("Error submitting card update:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof CardUpdateData,
    value: string | boolean | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWorkspaceChange = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    setSelectedBoardId("");
    setFormData((prev) => ({
      ...prev,
      cardId: "",
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
    <Card className={`w-full max-w-md mx-auto ${className || ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Update Card</CardTitle>
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
              <SelectTrigger className="w-full">
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
            <Label htmlFor="board-select" className="text-sm font-medium">
              Select Board *
            </Label>
            <Select
              value={selectedBoardId}
              onValueChange={handleBoardChange}
              disabled={boardsLoading || !selectedWorkspaceId}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    !selectedWorkspaceId
                      ? "Select a workspace first"
                      : boardsLoading
                      ? "Loading boards..."
                      : availableBoards.length === 0
                      ? "No boards available in this workspace"
                      : "Choose a board"
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
            <Label htmlFor="card-select" className="text-sm font-medium">
              Select Card *
            </Label>
            <Select
              value={formData.cardId}
              onValueChange={(value) => handleInputChange("cardId", value)}
              disabled={
                cardsLoading || !selectedBoardId || !selectedWorkspaceId
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    !selectedWorkspaceId
                      ? "Select a workspace first"
                      : !selectedBoardId
                      ? "Select a board first"
                      : cardsLoading
                      ? "Loading cards..."
                      : availableCards.length === 0
                      ? "No cards available"
                      : "Choose a card to update"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {!selectedWorkspaceId ? (
                  <SelectItem value="no-workspace" disabled>
                    Select a workspace first
                  </SelectItem>
                ) : !selectedBoardId ? (
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
            <Label htmlFor="card-name" className="text-sm font-medium">
              Card Name
            </Label>
            <Input
              id="card-name"
              type="text"
              placeholder="Enter new card name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="card-description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="card-description"
              placeholder="Enter new card description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full min-h-[80px]"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="list-select" className="text-sm font-medium">
              Move to List
            </Label>
            <Select
              value={formData.idList}
              onValueChange={(value) => handleInputChange("idList", value)}
              disabled={
                listsLoading || !selectedBoardId || !selectedWorkspaceId
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    !selectedWorkspaceId
                      ? "Select a workspace first"
                      : !selectedBoardId
                      ? "Select a board first"
                      : listsLoading
                      ? "Loading lists..."
                      : availableLists.length === 0
                      ? "No lists available"
                      : "Choose a list to move to"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {!selectedWorkspaceId ? (
                  <SelectItem value="no-workspace" disabled>
                    Select a workspace first
                  </SelectItem>
                ) : !selectedBoardId ? (
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

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="card-closed"
                checked={formData.closed}
                onChange={(e) => handleInputChange("closed", e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="card-closed" className="text-sm">
                Close card
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="card-due-complete"
                checked={formData.dueComplete}
                onChange={(e) =>
                  handleInputChange("dueComplete", e.target.checked)
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="card-due-complete" className="text-sm">
                Mark due date as complete
              </Label>
            </div>
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

          {selectedCard && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Card:</strong> {selectedCard.name}
                {selectedCard.desc && (
                  <span className="block mt-1">
                    <strong>Description:</strong> {selectedCard.desc}
                  </span>
                )}
                {selectedCard.due && (
                  <span className="block mt-1">
                    <strong>Due:</strong>{" "}
                    {new Date(selectedCard.due).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={
              !selectedWorkspaceId ||
              !selectedBoardId ||
              !formData.cardId.trim() ||
              isSubmitting
            }
          >
            {isSubmitting ? "Updating..." : "Update Card"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
