"use client";

import { useState, useEffect } from "react";

export interface Workspace {
  id: string;
  name: string;
  displayName: string;
  desc?: string;
  descData?: any;
  url?: string;
  website?: string;
  logo?: string;
  prefs?: {
    permissionLevel?: "private" | "public" | "org";
    externalMembersDisabled?: boolean;
    googleAppsVersion?: number;
    orgInviteRestrict?: string;
    boardVisibilityRestrict?: {
      private?: string;
      org?: string;
      public?: string;
    };
    boardDeleteRestrict?: {
      private?: string;
      org?: string;
      public?: string;
    };
    selfJoin?: boolean;
    cardCovers?: boolean;
    hideVotes?: boolean;
    invitations?: "disabled" | "enabled" | "members";
    voting?: "disabled" | "enabled" | "members";
    comments?: "disabled" | "enabled" | "members";
    background?: string;
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundImageScaled?: Array<{
      width: number;
      height: number;
      url: string;
    }>;
    backgroundTile?: boolean;
    backgroundBrightness?: "dark" | "light";
    backgroundBottomColor?: string;
    backgroundTopColor?: string;
    canBePublic?: boolean;
    canBeEnterprise?: boolean;
    canBeOrg?: boolean;
    canBePrivate?: boolean;
    canInvite?: boolean;
  };
  memberships?: Array<{
    id: string;
    idMember: string;
    memberType: "admin" | "normal" | "observer";
    unconfirmed: boolean;
    deactivated: boolean;
  }>;
  boards?: Array<{
    id: string;
    name: string;
    desc?: string;
    closed: boolean;
    url: string;
    shortUrl: string;
  }>;
  members?: Array<{
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
  }>;
}

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call the dedicated workspaces API
      const response = await fetch(
        `/api/workspaces?fields=id,name,displayName,desc,url,website,logo,prefs`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch workspaces");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch workspaces");
      }

      // Transform the API result to match our Workspace interface
      const transformedWorkspaces: Workspace[] = result.workspaces.map(
        (workspace: Record<string, unknown>) => ({
          id: workspace.id as string,
          name: workspace.name as string,
          displayName: workspace.displayName as string,
          desc: workspace.desc as string,
          descData: workspace.descData,
          url: workspace.url as string,
          website: workspace.website as string,
          logo: workspace.logo as string,
          prefs: workspace.prefs as Workspace["prefs"],
          memberships: workspace.memberships as Workspace["memberships"],
          boards: workspace.boards as Workspace["boards"],
          members: workspace.members as Workspace["members"],
        })
      );

      setWorkspaces(transformedWorkspaces);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch workspaces"
      );
      console.error("Error fetching workspaces:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  return {
    workspaces,
    loading,
    error,
    refetch: fetchWorkspaces,
  };
}
