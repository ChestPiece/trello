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
import { Checkbox } from "@/components/ui/checkbox";
import { useBoards } from "@/hooks/use-boards";
import { useLists } from "@/hooks/use-lists";

export interface ListArchiveData {
  listId: string;
  action: "archive" | "unarchive";
  archiveAllCards?: boolean;
}

export interface ListArchiveCardProps {
  onSubmit: (data: ListArchiveData) => void;
  className?: string;
}

export function ListArchiveCard({ onSubmit, className }: ListArchiveCardProps) {
  const { boards: availableBoards, loading: boardsLoading } = useBoards();
  const [selectedBoardId, setSelectedBoardId] = React.useState<string>("");
  const { lists: availableLists, loading: listsLoading } =
    useLists(selectedBoardId);

  const [formData, setFormData] = React.useState<ListArchiveData>({
    listId: "",
    action: "archive",
    archiveAllCards: false,
  });

  const handleInputChange = (
    field: keyof ListArchiveData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.listId) return;
    onSubmit(formData);
  };

  // Filter lists based on action
  const filteredLists = availableLists.filter((list) => {
    if (formData.action === "archive") {
      return !list.closed; // Show only open lists for archiving
    } else {
      return list.closed; // Show only closed lists for unarchiving
    }
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          {formData.action === "archive" ? "Archive List" : "Unarchive List"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Action Selection */}
          <div className="space-y-1">
            <Label htmlFor="action" className="text-sm font-medium">
              Action
            </Label>
            <Select
              value={formData.action}
              onValueChange={(value) => handleInputChange("action", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="archive">Archive List</SelectItem>
                <SelectItem value="unarchive">Unarchive List</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Board Selection */}
          <div className="space-y-1">
            <Label htmlFor="board" className="text-sm font-medium">
              Board
            </Label>
            <Select
              value={selectedBoardId}
              onValueChange={(value) => {
                setSelectedBoardId(value);
                handleInputChange("listId", ""); // Reset list selection
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a board" />
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

          {/* List Selection */}
          <div className="space-y-1">
            <Label htmlFor="list" className="text-sm font-medium">
              List
            </Label>
            <Select
              value={formData.listId}
              onValueChange={(value) => handleInputChange("listId", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a list" />
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
                ) : filteredLists.length > 0 ? (
                  filteredLists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-lists" disabled>
                    {formData.action === "archive"
                      ? "No open lists available"
                      : "No archived lists available"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Archive All Cards Option (only for archive action) */}
          {formData.action === "archive" && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="archiveAllCards"
                checked={formData.archiveAllCards}
                onCheckedChange={(checked) =>
                  handleInputChange("archiveAllCards", checked)
                }
              />
              <Label
                htmlFor="archiveAllCards"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Archive all cards in the list
              </Label>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={!formData.listId || !selectedBoardId}
          >
            {formData.action === "archive" ? "Archive List" : "Unarchive List"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
