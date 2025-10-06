"use client";

import { useState, useEffect, useCallback } from "react";
import { TrelloOperation } from "@/lib/types/trello";

interface UseTrelloResourceOptions<T> {
  autoFetch?: boolean;
  transform?: (data: any) => T;
}

interface UseTrelloResourceResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching Trello resources using the consolidated API
 */
export function useTrelloResource<T = any>(
  operation: TrelloOperation,
  params: Record<string, any> = {},
  options: UseTrelloResourceOptions<T> = {}
): UseTrelloResourceResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "api",
          operation,
          params,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const transformedData = options.transform
          ? options.transform(result.data)
          : result.data;
        setData(transformedData);
      } else {
        throw new Error(result.error || "Unknown error occurred");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error(`Error fetching ${operation}:`, err);
    } finally {
      setLoading(false);
    }
  }, [operation, params, options.transform]);

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchData();
    }
  }, [fetchData, options.autoFetch]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook for fetching Trello lists (boards, lists, cards, etc.)
 */
export function useTrelloList<T = any>(
  operation: TrelloOperation,
  params: Record<string, any> = {},
  options: UseTrelloResourceOptions<T[]> = {}
): UseTrelloResourceResult<T[]> {
  return useTrelloResource<T[]>(operation, params, {
    ...options,
    transform: options.transform || ((data: any) => data || []),
  });
}
