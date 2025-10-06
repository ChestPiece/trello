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
      transform: (data: unknown[]): Label[] =>
        (data as Record<string, unknown>[]).map(
          (label: Record<string, unknown>) => ({
            id: label.id as string,
            name: label.name as string,
            color: label.color as string,
            idBoard: label.idBoard as string,
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
