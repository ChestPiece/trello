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
      transform: (data: unknown[]): Board[] =>
        (data as Record<string, unknown>[]).map(
          (board: Record<string, unknown>) => ({
            id: board.id as string,
            name: board.name as string,
            description: (board.description || board.desc) as string,
            visibility: (board.visibility || board.permissionLevel) as string,
            url: board.url as string,
            shortUrl: board.shortUrl as string,
            closed: board.closed as boolean,
            pinned: board.pinned as boolean,
            starred: board.starred as boolean,
            organizationId: (board.organizationId ||
              board.idOrganization) as string,
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
