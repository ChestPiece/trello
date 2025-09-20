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

export interface WorkspaceCreationData {
  displayName: string;
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

export interface WorkspaceCreationCardProps {
  onSubmit: (data: WorkspaceCreationData) => void;
  className?: string;
}

export function WorkspaceCreationCard({
  onSubmit,
  className,
}: WorkspaceCreationCardProps) {
  const [formData, setFormData] = React.useState<WorkspaceCreationData>({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.displayName.trim()) {
      return; // Don't submit if required fields are empty
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
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
      console.error("Error submitting workspace creation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof WorkspaceCreationData,
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
        <CardTitle className="text-base">Create New Workspace</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label
              htmlFor="workspace-display-name"
              className="text-sm font-medium"
            >
              Display Name *
            </Label>
            <Input
              id="workspace-display-name"
              type="text"
              placeholder="Enter workspace display name"
              value={formData.displayName}
              onChange={(e) => handleInputChange("displayName", e.target.value)}
              required
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
              placeholder="Enter workspace name for URL (optional)"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              If not provided, will be generated from display name
            </p>
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
              placeholder="Enter workspace description (optional)"
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

          <div className="space-y-1">
            <Label htmlFor="invitations" className="text-sm font-medium">
              Invitations
            </Label>
            <Select
              value={formData.invitations}
              onValueChange={(value: "disabled" | "enabled" | "members") =>
                handleInputChange("invitations", value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select invitation policy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disabled">Disabled</SelectItem>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="members">Members Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="voting" className="text-sm font-medium">
              Voting
            </Label>
            <Select
              value={formData.voting}
              onValueChange={(value: "disabled" | "enabled" | "members") =>
                handleInputChange("voting", value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select voting policy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disabled">Disabled</SelectItem>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="members">Members Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="comments" className="text-sm font-medium">
              Comments
            </Label>
            <Select
              value={formData.comments}
              onValueChange={(value: "disabled" | "enabled" | "members") =>
                handleInputChange("comments", value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select comment policy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disabled">Disabled</SelectItem>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="members">Members Only</SelectItem>
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

          <Button
            type="submit"
            className="w-full"
            disabled={!formData.displayName.trim() || isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Workspace"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
