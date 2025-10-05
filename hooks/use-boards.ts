"use client";

import { useTrelloList } from "./use-trello-resource";
import { Board } from "@/lib/types/trello";

export function useBoards() {
  const {
    data: boards,
    loading,
    error,
    refetch,
  } = useTrelloList<Board>(
    "listBoards",
    {
      filter: "all",
      fields: [
        "id",
        "name",
        "desc",
        "url",
        "shortUrl",
        "closed",
        "pinned",
        "starred",
        "idOrganization",
      ],
      organization: true,
      lists: "none", // Don't include lists for performance
    },
    {
      transform: (data: unknown[]) =>
        (data as Record<string, unknown>[]).map(
          (board: Record<string, unknown>) => ({
            id: board.id,
            name: board.name,
            description: board.description || board.desc,
            visibility: board.visibility || board.permissionLevel,
            url: board.url,
            shortUrl: board.shortUrl,
            closed: board.closed,
            pinned: board.pinned,
            starred: board.starred,
            organizationId: board.organizationId || board.idOrganization,
          })
        ),
    }
  );

  return {
    boards: boards || [],
    loading,
    error,
    refetch,
  };
}
