"use client";

import { useState, useEffect } from "react";
import { useDataRefresh } from "@/components/data-refresh-provider";

export interface Board {
  id: string;
  name: string;
  description?: string;
  visibility?: string;
  url?: string;
  shortUrl?: string;
  closed?: boolean;
  pinned?: boolean;
  starred?: boolean;
  organizationId?: string;
}

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshBoards, refreshBoardsState } = useDataRefresh();

  const fetchBoards = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call the API route instead of the tool directly
      const response = await fetch("/api/boards?filter=all");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch boards from API");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch boards from Trello");
      }

      // Transform the API result to match our Board interface
      const formattedBoards: Board[] = result.boards.map((board: any) => ({
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
      }));

      setBoards(formattedBoards);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch boards");
      console.error("Error fetching boards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  // Listen for refresh triggers
  useEffect(() => {
    fetchBoards();
  }, [refreshBoardsState]);

  return {
    boards,
    loading,
    error,
    refetch: fetchBoards,
  };
}
