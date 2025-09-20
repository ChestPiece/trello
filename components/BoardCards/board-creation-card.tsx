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

export interface BoardCreationData {
  name: string;
  description: string;
  visibility: "private" | "public" | "org";
}

export interface BoardCreationCardProps {
  onSubmit: (data: BoardCreationData) => void;
  className?: string;
}

export function BoardCreationCard({
  onSubmit,
  className,
}: BoardCreationCardProps) {
  const [formData, setFormData] = React.useState<BoardCreationData>({
    name: "",
    description: "",
    visibility: "private",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return; // Don't submit if name is empty
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        name: "",
        description: "",
        visibility: "private",
      });
    } catch (error) {
      console.error("Error submitting board creation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof BoardCreationData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card className={`w-full ${className || ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Create New Board</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="board-name" className="text-sm font-medium">
              Board Name *
            </Label>
            <Input
              id="board-name"
              type="text"
              placeholder="Enter board name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="board-description" className="text-sm font-medium">
              Description
            </Label>
            <Input
              id="board-description"
              type="text"
              placeholder="Enter board description (optional)"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="board-visibility" className="text-sm font-medium">
              Visibility
            </Label>
            <Select
              value={formData.visibility}
              onValueChange={(value: "private" | "public" | "org") =>
                handleInputChange("visibility", value)
              }
            >
              <SelectTrigger className="w-full">
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
            className="w-full"
            disabled={!formData.name.trim() || isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Board"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
