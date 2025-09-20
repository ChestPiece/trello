"use client";

import { useState, useEffect } from "react";
import { useDataRefresh } from "@/components/data-refresh-provider";

export interface List {
  id: string;
  name: string;
  closed: boolean;
  idBoard: string;
  pos: number;
  subscribed: boolean;
  cards?: Card[];
}

export interface Card {
  id: string;
  name: string;
  desc?: string;
  closed: boolean;
  idList: string;
  pos: number;
  due?: string;
  dueComplete?: boolean;
  idMembers?: string[];
  idLabels?: string[];
  url?: string;
  shortUrl?: string;
}

export function useLists(boardId?: string) {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshLists, refreshListsState } = useDataRefresh();

  const fetchLists = async (targetBoardId?: string) => {
    const boardToUse = targetBoardId || boardId;
    if (!boardToUse) {
      setLists([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the API route instead of the tool directly
      const response = await fetch(
        `/api/lists?boardId=${boardToUse}&filter=all`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch lists from API");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch lists from Trello");
      }

      // Transform the API result to match our List interface
      const transformedLists: List[] = result.lists.map((list: any) => ({
        id: list.id,
        name: list.name,
        closed: list.closed,
        idBoard: list.boardId,
        pos: list.position,
        subscribed: list.subscribed,
        cards: list.cards || [],
      }));

      setLists(transformedLists);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch lists");
      console.error("Error fetching lists:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (boardId) {
      fetchLists();
    }
  }, [boardId]);

  // Listen for refresh triggers
  useEffect(() => {
    if (
      refreshListsState.boardId === boardId ||
      refreshListsState.boardId === undefined
    ) {
      fetchLists();
    }
  }, [refreshListsState, boardId]);

  return {
    lists,
    loading,
    error,
    refetch: fetchLists,
  };
}
