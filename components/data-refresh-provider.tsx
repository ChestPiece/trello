"use client";

import * as React from "react";

interface DataRefreshContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
  refreshLists: (boardId?: string) => void;
  refreshBoards: () => void;
  refreshCards: (boardId?: string, listId?: string) => void;
  refreshListsState: { boardId?: string; timestamp: number };
  refreshBoardsState: number;
  refreshCardsState: { boardId?: string; listId?: string; timestamp: number };
}

const DataRefreshContext = React.createContext<
  DataRefreshContextType | undefined
>(undefined);

export function DataRefreshProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [refreshLists, setRefreshLists] = React.useState<{
    boardId?: string;
    timestamp: number;
  }>({ timestamp: 0 });
  const [refreshBoards, setRefreshBoards] = React.useState(0);
  const [refreshCards, setRefreshCards] = React.useState<{
    boardId?: string;
    listId?: string;
    timestamp: number;
  }>({ timestamp: 0 });

  const triggerRefresh = React.useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const triggerRefreshLists = React.useCallback((boardId?: string) => {
    setRefreshLists({ boardId, timestamp: Date.now() });
  }, []);

  const triggerRefreshBoards = React.useCallback(() => {
    setRefreshBoards((prev) => prev + 1);
  }, []);

  const triggerRefreshCards = React.useCallback(
    (boardId?: string, listId?: string) => {
      setRefreshCards({ boardId, listId, timestamp: Date.now() });
    },
    []
  );

  const value = React.useMemo(
    () => ({
      refreshTrigger,
      triggerRefresh,
      refreshLists: triggerRefreshLists,
      refreshBoards: triggerRefreshBoards,
      refreshCards: triggerRefreshCards,
      refreshListsState: refreshLists,
      refreshBoardsState: refreshBoards,
      refreshCardsState: refreshCards,
    }),
    [
      refreshTrigger,
      triggerRefresh,
      triggerRefreshLists,
      triggerRefreshBoards,
      triggerRefreshCards,
      refreshLists,
      refreshBoards,
      refreshCards,
    ]
  );

  return (
    <DataRefreshContext.Provider value={value}>
      {children}
    </DataRefreshContext.Provider>
  );
}

export function useDataRefresh() {
  const context = React.useContext(DataRefreshContext);
  if (context === undefined) {
    throw new Error("useDataRefresh must be used within a DataRefreshProvider");
  }
  return context;
}
