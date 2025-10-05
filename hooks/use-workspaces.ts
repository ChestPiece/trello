"use client";

import { useTrelloList } from "./use-trello-resource";
import { Workspace } from "@/lib/types/trello";

export function useWorkspaces() {
  const {
    data: workspaces,
    loading,
    error,
    refetch,
  } = useTrelloList<Workspace>(
    "listWorkspaces",
    {
      fields: [
        "id",
        "name",
        "displayName",
        "desc",
        "url",
        "website",
        "logo",
        "prefs",
      ],
    },
    {
      transform: (data: unknown[]) =>
        (data as Record<string, unknown>[]).map(
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
        ),
    }
  );

  return {
    workspaces: workspaces || [],
    loading,
    error,
    refetch,
  };
}
