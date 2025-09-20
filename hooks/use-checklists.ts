"use client";

import { useState, useEffect } from "react";

export interface ChecklistItem {
  id: string;
  name: string;
  state: "complete" | "incomplete";
  pos: number;
  due: string | null;
  idMember: string | null;
}

export interface Checklist {
  id: string;
  name: string;
  idCard: string;
  pos: number;
  checkItems: ChecklistItem[];
}

export function useChecklists(cardId?: string) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChecklists = async (targetCardId?: string) => {
    const cardToUse = targetCardId || cardId;

    if (!cardToUse) {
      setChecklists([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the dedicated checklists API
      const response = await fetch(
        `/api/checklists?cardId=${cardToUse}&checkItems=all&fields=id,name,idCard,pos&checkItemFields=id,name,state,pos,due,idMember`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch checklists");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch checklists");
      }

      // Transform the API result to match our Checklist interface
      const transformedChecklists: Checklist[] = result.checklists.map(
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
            due: item.due as string | null,
            idMember: item.idMember as string | null,
          })),
        })
      );

      setChecklists(transformedChecklists);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch checklists"
      );
      console.error("Error fetching checklists:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cardId) {
      fetchChecklists();
    }
  }, [cardId]);

  return {
    checklists,
    loading,
    error,
    refetch: fetchChecklists,
  };
}
