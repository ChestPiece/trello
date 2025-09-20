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
      // Call the listWorkspaces tool through the chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: "List all my workspaces with their details",
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch workspaces");
      }

      // Parse the streaming response to extract workspace data
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      let result = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        result += chunk;
      }

      // Try to extract workspace data from the response
      try {
        // Look for workspace data in the response
        const workspaceMatches = result.match(/"workspaces":\s*\[([\s\S]*?)\]/);
        if (workspaceMatches) {
          const workspacesJson = `[${workspaceMatches[1]}]`;
          const workspacesData = JSON.parse(workspacesJson);

          const formattedWorkspaces: Workspace[] = workspacesData.map(
            (workspace: Record<string, unknown>) => ({
              id: workspace.id,
              name: workspace.name,
              displayName: workspace.displayName,
              desc: workspace.desc,
              descData: workspace.descData,
              url: workspace.url,
              website: workspace.website,
              logo: workspace.logo,
              prefs: workspace.prefs,
              memberships: workspace.memberships,
              boards: workspace.boards,
              members: workspace.members,
            })
          );

          setWorkspaces(formattedWorkspaces);
        } else {
          // Fallback: try to parse the entire response as JSON
          const responseData = JSON.parse(result);
          if (responseData.workspaces) {
            setWorkspaces(responseData.workspaces);
          } else {
            throw new Error("No workspaces found in response");
          }
        }
      } catch (parseError) {
        console.error("Error parsing workspace data:", parseError);
        // If parsing fails, show an error but don't crash
        setError("Failed to parse workspace data from Trello API");
      }
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
