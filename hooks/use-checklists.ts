"use client";

import { useTrelloList } from "./use-trello-resource";
import { Checklist, ChecklistItem } from "@/lib/types/trello";

export function useChecklists(cardId?: string) {
  const {
    data: checklists,
    loading,
    error,
    refetch,
  } = useTrelloList<Checklist>(
    "listChecklists",
    {
      cardId: cardId || undefined,
      checkItems: "all",
      fields: ["id", "name", "idCard", "pos"],
      checkItemFields: ["id", "name", "state", "pos", "due", "idMember"],
    },
    {
      autoFetch: !!cardId,
      transform: (data: unknown[]) =>
        (data as Record<string, unknown>[]).map(
          (checklist: Record<string, unknown>) => ({
            id: checklist.id,
            name: checklist.name,
            idCard: checklist.idCard,
            pos: checklist.pos,
            checkItems: (
              (checklist.checkItems as Record<string, unknown>[]) || []
            ).map((item: Record<string, unknown>) => ({
              id: item.id,
              name: item.name,
              state: item.state,
              pos: item.pos,
              due: item.due,
              idMember: item.idMember,
            })),
          })
        ),
    }
  );

  return {
    checklists: checklists || [],
    loading,
    error,
    refetch,
  };
}
