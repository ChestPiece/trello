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

export interface LabelCreationData {
  boardId: string;
  name: string;
  color: string;
}

export interface LabelCreationCardProps {
  onSubmit: (data: LabelCreationData) => void;
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

export function LabelCreationCard({
  onSubmit,
  className,
}: LabelCreationCardProps) {
  const { boards: availableBoards, loading: boardsLoading } = useBoards();

  const [formData, setFormData] = React.useState<LabelCreationData>({
    boardId: "",
    name: "",
    color: "red",
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
        color: "red",
      });
    } catch (error) {
      console.error("Error submitting label creation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof LabelCreationData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card className={`w-full ${className || ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Create New Label</CardTitle>
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
            <Label htmlFor="label-name" className="text-sm font-medium">
              Label Name *
            </Label>
            <Input
              id="label-name"
              type="text"
              placeholder="Enter label name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="label-color" className="text-sm font-medium">
              Label Color *
            </Label>
            <Select
              value={formData.color}
              onValueChange={(value) => handleInputChange("color", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a color" />
              </SelectTrigger>
              <SelectContent>
                {LABEL_COLORS.map((colorOption) => (
                  <SelectItem key={colorOption.value} value={colorOption.value}>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-4 h-4 rounded-full ${colorOption.color}`}
                      />
                      <span>{colorOption.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Preview:</strong>
              <div className="flex items-center space-x-2 mt-2">
                <div
                  className={`w-4 h-4 rounded-full ${
                    LABEL_COLORS.find((c) => c.value === formData.color)
                      ?.color || "bg-red-500"
                  }`}
                />
                <span className="text-sm font-medium">
                  {formData.name || "Label Name"}
                </span>
              </div>
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              !formData.boardId.trim() || !formData.name.trim() || isSubmitting
            }
          >
            {isSubmitting ? "Creating..." : "Create Label"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
