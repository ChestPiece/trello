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
      transform: (data: unknown[]): Checklist[] =>
        (data as Record<string, unknown>[]).map(
          (checklist: Record<string, unknown>) => ({
            id: checklist.id as string,
            name: checklist.name as string,
            idCard: checklist.idCard as string,
            pos: checklist.pos as number,
            checkItems: (
              (checklist.checkItems as Record<string, unknown>[]) || []
            ).map((item: Record<string, unknown>) => ({
              id: item.id as string,
              name: item.name as string,
              state: item.state as "complete" | "incomplete",
              pos: item.pos as number,
              due: item.due as string,
              idMember: item.idMember as string,
              idChecklist: checklist.id as string, // Add the missing idChecklist property
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
