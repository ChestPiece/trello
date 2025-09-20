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
import { useWorkspaces } from "@/hooks/use-workspaces";

export interface WorkspaceDeleteData {
  workspaceId: string;
  confirmationText: string;
}

export interface WorkspaceDeleteCardProps {
  onSubmit: (data: WorkspaceDeleteData) => void;
  className?: string;
}

export function WorkspaceDeleteCard({
  onSubmit,
  className,
}: WorkspaceDeleteCardProps) {
  const { workspaces: availableWorkspaces, loading: workspacesLoading } =
    useWorkspaces();

  const [formData, setFormData] = React.useState<WorkspaceDeleteData>({
    workspaceId: "",
    confirmationText: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.workspaceId.trim() ||
      formData.confirmationText !== "DELETE"
    ) {
      return; // Don't submit if no workspace is selected or confirmation text is wrong
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        workspaceId: "",
        confirmationText: "",
      });
    } catch (error) {
      console.error("Error submitting workspace deletion:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof WorkspaceDeleteData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectedWorkspace = availableWorkspaces.find(
    (workspace) => workspace.id === formData.workspaceId
  );

  return (
    <Card className={`w-full ${className || ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-red-600">
          Delete Workspace
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            <strong>⚠️ EXTREME WARNING:</strong> This action will permanently
            delete the workspace and ALL its data including boards, lists,
            cards, members, and settings. This cannot be undone and will affect
            all workspace members.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="workspace-select" className="text-sm font-medium">
              Select Workspace to Delete *
            </Label>
            <Select
              value={formData.workspaceId}
              onValueChange={(value) => handleInputChange("workspaceId", value)}
              disabled={workspacesLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    workspacesLoading
                      ? "Loading workspaces..."
                      : availableWorkspaces.length === 0
                      ? "No workspaces available"
                      : "Choose a workspace to delete"
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
                      {workspace.displayName}
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

          {selectedWorkspace && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Workspace to delete:</strong>{" "}
                {selectedWorkspace.displayName}
                {selectedWorkspace.desc && (
                  <span className="block mt-1">
                    <strong>Description:</strong> {selectedWorkspace.desc}
                  </span>
                )}
                {selectedWorkspace.boards &&
                  selectedWorkspace.boards.length > 0 && (
                    <span className="block mt-1 text-red-600">
                      ⚠️ This workspace contains{" "}
                      {selectedWorkspace.boards.length} board(s) that will be
                      deleted.
                    </span>
                  )}
                {selectedWorkspace.members &&
                  selectedWorkspace.members.length > 0 && (
                    <span className="block mt-1 text-red-600">
                      ⚠️ This workspace has {selectedWorkspace.members.length}{" "}
                      member(s) that will lose access.
                    </span>
                  )}
                {selectedWorkspace.website && (
                  <span className="block mt-1">
                    <strong>Website:</strong> {selectedWorkspace.website}
                  </span>
                )}
              </p>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="confirmation-text" className="text-sm font-medium">
              Type &quot;DELETE&quot; to confirm *
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
              !formData.workspaceId.trim() ||
              formData.confirmationText !== "DELETE" ||
              isSubmitting
            }
          >
            {isSubmitting ? "Deleting..." : "Delete Workspace"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
