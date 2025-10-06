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
      transform: (data: unknown[]): Workspace[] =>
        (data as Record<string, unknown>[]).map(
          (workspace: Record<string, unknown>) => ({
            id: workspace.id as string,
            name: workspace.name as string,
            displayName: workspace.displayName as string,
            desc: workspace.desc as string,
            descData: workspace.descData as any,
            url: workspace.url as string,
            website: workspace.website as string,
            logo: workspace.logo as string,
            prefs: workspace.prefs as any,
            memberships: workspace.memberships as any,
            boards: workspace.boards as any,
            members: workspace.members as any,
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
