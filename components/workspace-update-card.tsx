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
import { useWorkspaces } from "@/hooks/use-workspaces";

export interface WorkspaceUpdateData {
  workspaceId: string;
  displayName?: string;
  description?: string;
  name?: string;
  website?: string;
  logo?: string;
  permissionLevel?: "private" | "public" | "org";
  externalMembersDisabled?: boolean;
  selfJoin?: boolean;
  cardCovers?: boolean;
  hideVotes?: boolean;
  invitations?: "disabled" | "enabled" | "members";
  voting?: "disabled" | "enabled" | "members";
  comments?: "disabled" | "enabled" | "members";
}

export interface WorkspaceUpdateCardProps {
  onSubmit: (data: WorkspaceUpdateData) => void;
  className?: string;
}

export function WorkspaceUpdateCard({
  onSubmit,
  className,
}: WorkspaceUpdateCardProps) {
  const { workspaces: availableWorkspaces, loading: workspacesLoading } =
    useWorkspaces();

  const [formData, setFormData] = React.useState<WorkspaceUpdateData>({
    workspaceId: "",
    displayName: "",
    description: "",
    name: "",
    website: "",
    logo: "",
    permissionLevel: "private",
    externalMembersDisabled: false,
    selfJoin: false,
    cardCovers: true,
    hideVotes: false,
    invitations: "members",
    voting: "members",
    comments: "members",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Update form data when workspace selection changes
  React.useEffect(() => {
    if (formData.workspaceId && availableWorkspaces.length > 0) {
      const selectedWorkspace = availableWorkspaces.find(
        (workspace) => workspace.id === formData.workspaceId
      );
      if (selectedWorkspace) {
        setFormData((prev) => ({
          ...prev,
          displayName: selectedWorkspace.displayName,
          description: selectedWorkspace.desc || "",
          name: selectedWorkspace.name,
          website: selectedWorkspace.website || "",
          logo: selectedWorkspace.logo || "",
          permissionLevel:
            selectedWorkspace.prefs?.permissionLevel || "private",
          externalMembersDisabled:
            selectedWorkspace.prefs?.externalMembersDisabled || false,
          selfJoin: selectedWorkspace.prefs?.selfJoin || false,
          cardCovers: selectedWorkspace.prefs?.cardCovers || true,
          hideVotes: selectedWorkspace.prefs?.hideVotes || false,
          invitations: selectedWorkspace.prefs?.invitations || "members",
          voting: selectedWorkspace.prefs?.voting || "members",
          comments: selectedWorkspace.prefs?.comments || "members",
        }));
      }
    }
  }, [formData.workspaceId, availableWorkspaces]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.workspaceId.trim()) {
      return; // Don't submit if no workspace is selected
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        workspaceId: "",
        displayName: "",
        description: "",
        name: "",
        website: "",
        logo: "",
        permissionLevel: "private",
        externalMembersDisabled: false,
        selfJoin: false,
        cardCovers: true,
        hideVotes: false,
        invitations: "members",
        voting: "members",
        comments: "members",
      });
    } catch (error) {
      console.error("Error submitting workspace update:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof WorkspaceUpdateData,
    value: string | boolean
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
        <CardTitle className="text-base">Update Workspace</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="workspace-select" className="text-sm font-medium">
              Select Workspace *
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
                      : "Choose a workspace to update"
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

          <div className="space-y-1">
            <Label
              htmlFor="workspace-display-name"
              className="text-sm font-medium"
            >
              Display Name
            </Label>
            <Input
              id="workspace-display-name"
              type="text"
              placeholder="Enter new display name"
              value={formData.displayName}
              onChange={(e) => handleInputChange("displayName", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="workspace-name" className="text-sm font-medium">
              Workspace Name (URL)
            </Label>
            <Input
              id="workspace-name"
              type="text"
              placeholder="Enter new workspace name for URL"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="workspace-description"
              className="text-sm font-medium"
            >
              Description
            </Label>
            <Textarea
              id="workspace-description"
              placeholder="Enter new workspace description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full min-h-[80px]"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="workspace-website" className="text-sm font-medium">
              Website URL
            </Label>
            <Input
              id="workspace-website"
              type="url"
              placeholder="https://example.com"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="workspace-logo" className="text-sm font-medium">
              Logo URL
            </Label>
            <Input
              id="workspace-logo"
              type="url"
              placeholder="https://example.com/logo.png"
              value={formData.logo}
              onChange={(e) => handleInputChange("logo", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="permission-level" className="text-sm font-medium">
              Permission Level
            </Label>
            <Select
              value={formData.permissionLevel}
              onValueChange={(value: "private" | "public" | "org") =>
                handleInputChange("permissionLevel", value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select permission level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="org">Organization</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="external-members-disabled"
                checked={formData.externalMembersDisabled}
                onChange={(e) =>
                  handleInputChange("externalMembersDisabled", e.target.checked)
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="external-members-disabled" className="text-sm">
                Disable external members
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="self-join"
                checked={formData.selfJoin}
                onChange={(e) =>
                  handleInputChange("selfJoin", e.target.checked)
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="self-join" className="text-sm">
                Allow self-join
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="card-covers"
                checked={formData.cardCovers}
                onChange={(e) =>
                  handleInputChange("cardCovers", e.target.checked)
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="card-covers" className="text-sm">
                Enable card covers
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hide-votes"
                checked={formData.hideVotes}
                onChange={(e) =>
                  handleInputChange("hideVotes", e.target.checked)
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="hide-votes" className="text-sm">
                Hide votes
              </Label>
            </div>
          </div>

          {selectedWorkspace && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Workspace:</strong> {selectedWorkspace.displayName}
                {selectedWorkspace.desc && (
                  <span className="block mt-1">
                    <strong>Description:</strong> {selectedWorkspace.desc}
                  </span>
                )}
                {selectedWorkspace.website && (
                  <span className="block mt-1">
                    <strong>Website:</strong> {selectedWorkspace.website}
                  </span>
                )}
                {selectedWorkspace.boards && (
                  <span className="block mt-1">
                    <strong>Boards:</strong> {selectedWorkspace.boards.length}
                  </span>
                )}
                {selectedWorkspace.members && (
                  <span className="block mt-1">
                    <strong>Members:</strong> {selectedWorkspace.members.length}
                  </span>
                )}
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!formData.workspaceId.trim() || isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Workspace"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
