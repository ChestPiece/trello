"use client";

import { useState, useEffect, useCallback } from "react";
import { useDataRefresh } from "@/components/data-refresh-provider";
import {
  TrelloResponse,
  TrelloOperation,
  TrelloHookOptions,
} from "@/lib/types/trello";

interface UseTrelloResourceState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseTrelloResourceReturn<T> extends UseTrelloResourceState<T> {
  refetch: (params?: Record<string, any>) => Promise<void>;
  mutate: (newData: T) => void;
}

export function useTrelloResource<T = any>(
  operation: TrelloOperation,
  params: Record<string, any> = {},
  options: TrelloHookOptions = {}
): UseTrelloResourceReturn<T> {
  const { autoFetch = true, refreshTriggers = [], transform } = options;

  const [state, setState] = useState<UseTrelloResourceState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const {
    refreshBoards,
    refreshCards,
    refreshLists,
    refreshLabels,
    refreshWorkspaces,
  } = useDataRefresh();

  // Create a stable key for this hook instance
  const hookKey = `${operation}-${JSON.stringify(params)}`;

  const fetchData = useCallback(
    async (customParams?: Record<string, any>) => {
      const requestParams = { ...params, ...customParams };

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch("/api/trello", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            operation,
            params: requestParams,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const result: TrelloResponse<T> = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Operation failed");
        }

        let processedData = result.data;

        // Apply transformation if provided
        if (transform && processedData) {
          processedData = transform(processedData);
        }

        setState({
          data: processedData,
          loading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });
        console.error(`Error in useTrelloResource (${operation}):`, error);
      }
    },
    [operation, params, transform]
  );

  // Manual data mutation
  const mutate = useCallback((newData: T) => {
    setState((prev) => ({ ...prev, data: newData }));
  }, []);

  // Auto-fetch on mount and when params change
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  // Listen for refresh triggers
  useEffect(() => {
    if (refreshTriggers.length === 0) {
      // Default refresh behavior based on operation
      const operationRefreshMap: Record<string, () => void> = {
        listBoards: refreshBoards,
        listCards: refreshCards,
        listLists: refreshLists,
        listLabels: refreshLabels,
        listWorkspaces: refreshWorkspaces,
      };

      const refreshFunction = operationRefreshMap[operation];
      if (refreshFunction) {
        refreshFunction();
      }
    }
  }, [
    operation,
    refreshTriggers,
    refreshBoards,
    refreshCards,
    refreshLists,
    refreshLabels,
    refreshWorkspaces,
  ]);

  return {
    ...state,
    refetch: fetchData,
    mutate,
  };
}

// Convenience hooks for common operations
export function useTrelloList<T = any>(
  operation: TrelloOperation,
  params: Record<string, any> = {},
  options: TrelloHookOptions = {}
) {
  return useTrelloResource<T[]>(operation, params, {
    ...options,
    transform: (data: any) => (Array.isArray(data) ? data : []),
  });
}

export function useTrelloSingle<T = any>(
  operation: TrelloOperation,
  params: Record<string, any> = {},
  options: TrelloHookOptions = {}
) {
  return useTrelloResource<T>(operation, params, options);
}
