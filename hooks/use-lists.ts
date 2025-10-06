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
      transform: (data: unknown[]): List[] =>
        (data as Record<string, unknown>[]).map(
          (list: Record<string, unknown>) => ({
            id: list.id as string,
            name: list.name as string,
            closed: list.closed as boolean,
            idBoard: (list.boardId || list.idBoard) as string,
            pos: (list.position || list.pos) as number,
            subscribed: list.subscribed as boolean,
            cards: (list.cards || []) as Card[],
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
