"use client";

import { useTrelloList } from "./use-trello-resource";
import { Label } from "@/lib/types/trello";

export function useLabels(boardId?: string) {
  const {
    data: labels,
    loading,
    error,
    refetch,
  } = useTrelloList<Label>(
    "listLabels",
    {
      boardId: boardId || undefined,
      fields: ["id", "name", "color", "idBoard"],
    },
    {
      autoFetch: !!boardId,
      transform: (data: unknown[]) =>
        (data as Record<string, unknown>[]).map(
          (label: Record<string, unknown>) => ({
            id: label.id,
            name: label.name,
            color: label.color,
            idBoard: label.idBoard,
          })
        ),
    }
  );

  return {
    labels: labels || [],
    loading,
    error,
    refetch,
  };
}
