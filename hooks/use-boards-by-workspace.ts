"use client";

import { useState, useEffect } from "react";
import { useBoards } from "./use-boards";

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

export function useBoardsByWorkspace(workspaceId?: string) {
  const {
    boards: allBoards,
    loading: allBoardsLoading,
    error: allBoardsError,
  } = useBoards();
  const [filteredBoards, setFilteredBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter boards by workspace ID
  useEffect(() => {
    if (!workspaceId) {
      setFilteredBoards([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(allBoardsLoading);
    setError(allBoardsError);

    if (allBoardsLoading) {
      return;
    }

    // Filter boards that belong to the selected workspace
    const workspaceBoards = allBoards.filter(
      (board) => board.organizationId === workspaceId
    );

    console.log("Filtering boards for workspace:", workspaceId);
    console.log("All boards:", allBoards);
    console.log("Filtered boards:", workspaceBoards);

    setFilteredBoards(workspaceBoards);
  }, [workspaceId, allBoards, allBoardsLoading, allBoardsError]);

  return {
    boards: filteredBoards,
    loading,
    error,
    refetch: () => {
      // The refetch will be handled by the useBoards hook
      console.log("Refetch requested for workspace:", workspaceId);
    },
  };
}
