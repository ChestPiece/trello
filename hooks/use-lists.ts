"use client";

import { useTrelloList } from "./use-trello-resource";
import { List, Card } from "@/lib/types/trello";

export function useLists(boardId?: string) {
  const {
    data: lists,
    loading,
    error,
    refetch,
  } = useTrelloList<List>(
    "listLists",
    {
      boardId: boardId || undefined,
      filter: "all",
      fields: ["id", "name", "closed", "idBoard", "pos", "subscribed"],
      cards: "none", // Don't include cards for performance
    },
    {
      autoFetch: !!boardId,
      transform: (data: unknown[]) =>
        (data as Record<string, unknown>[]).map(
          (list: Record<string, unknown>) => ({
            id: list.id,
            name: list.name,
            closed: list.closed,
            idBoard: list.boardId || list.idBoard,
            pos: list.position || list.pos,
            subscribed: list.subscribed,
            cards: list.cards || [],
          })
        ),
    }
  );

  return {
    lists: lists || [],
    loading,
    error,
    refetch,
  };
}
