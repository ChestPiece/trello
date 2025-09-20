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
import { useLabels } from "@/hooks/use-labels";

export interface LabelDeleteData {
  labelId: string;
  confirmationText: string;
}

export interface LabelDeleteCardProps {
  onSubmit: (data: LabelDeleteData) => void;
  className?: string;
}

const LABEL_COLORS = [
  { value: "red", label: "Red", color: "bg-red-500" },
  { value: "yellow", label: "Yellow", color: "bg-yellow-500" },
  { value: "orange", label: "Orange", color: "bg-orange-500" },
  { value: "green", label: "Green", color: "bg-green-500" },
  { value: "blue", label: "Blue", color: "bg-blue-500" },
  { value: "purple", label: "Purple", color: "bg-purple-500" },
  { value: "pink", label: "Pink", color: "bg-pink-500" },
  { value: "sky", label: "Sky", color: "bg-sky-500" },
  { value: "lime", label: "Lime", color: "bg-lime-500" },
  { value: "gray", label: "Gray", color: "bg-gray-500" },
];

export function LabelDeleteCard({ onSubmit, className }: LabelDeleteCardProps) {
  const { boards: availableBoards, loading: boardsLoading } = useBoards();
  const [selectedBoardId, setSelectedBoardId] = React.useState<string>("");
  const { labels: availableLabels, loading: labelsLoading } =
    useLabels(selectedBoardId);

  const [formData, setFormData] = React.useState<LabelDeleteData>({
    labelId: "",
    confirmationText: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.labelId.trim() || formData.confirmationText !== "DELETE") {
      return; // Don't submit if no label is selected or confirmation text is wrong
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        labelId: "",
        confirmationText: "",
      });
      setSelectedBoardId("");
    } catch (error) {
      console.error("Error submitting label deletion:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof LabelDeleteData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBoardChange = (boardId: string) => {
    setSelectedBoardId(boardId);
    setFormData((prev) => ({
      ...prev,
      labelId: "",
    }));
  };

  const selectedLabel = availableLabels.find(
    (label) => label.id === formData.labelId
  );

  return (
    <Card className={`w-full ${className || ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-red-600">Delete Label</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            <strong>Warning:</strong> This action will permanently delete the
            label from the board. All cards using this label will lose the label
            association. This cannot be undone.
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
            <Label htmlFor="label-select" className="text-sm font-medium">
              Select Label to Delete *
            </Label>
            <Select
              value={formData.labelId}
              onValueChange={(value) => handleInputChange("labelId", value)}
              disabled={labelsLoading || !selectedBoardId}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    !selectedBoardId
                      ? "Select a board first"
                      : labelsLoading
                      ? "Loading labels..."
                      : availableLabels.length === 0
                      ? "No labels available"
                      : "Choose a label to delete"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {!selectedBoardId ? (
                  <SelectItem value="no-board" disabled>
                    Select a board first
                  </SelectItem>
                ) : labelsLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading labels...
                  </SelectItem>
                ) : availableLabels.length > 0 ? (
                  availableLabels.map((label) => (
                    <SelectItem key={label.id} value={label.id}>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            LABEL_COLORS.find((c) => c.value === label.color)
                              ?.color || "bg-gray-500"
                          }`}
                        />
                        <span>{label.name}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-labels" disabled>
                    No labels available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedLabel && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Label to delete:</strong>
                <div className="flex items-center space-x-2 mt-2">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      LABEL_COLORS.find((c) => c.value === selectedLabel.color)
                        ?.color || "bg-gray-500"
                    }`}
                  />
                  <span className="text-sm font-medium">
                    {selectedLabel.name}
                  </span>
                </div>
                <span className="block mt-2 text-red-600">
                  ⚠️ All cards using this label will lose the label association.
                </span>
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
              !formData.labelId.trim() ||
              formData.confirmationText !== "DELETE" ||
              isSubmitting
            }
          >
            {isSubmitting ? "Deleting..." : "Delete Label"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
