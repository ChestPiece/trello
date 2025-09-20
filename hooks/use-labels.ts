"use client";

import { useState, useEffect } from "react";

export interface Label {
  id: string;
  name: string;
  color: string;
  idBoard: string;
}

export function useLabels(boardId?: string) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLabels = async (targetBoardId?: string) => {
    const boardToUse = targetBoardId || boardId;

    if (!boardToUse) {
      setLabels([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the dedicated labels API
      const response = await fetch(
        `/api/labels?boardId=${boardToUse}&fields=id,name,color,idBoard`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch labels");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch labels");
      }

      // Transform the API result to match our Label interface
      const transformedLabels: Label[] = result.labels.map(
        (label: Record<string, unknown>) => ({
          id: label.id as string,
          name: label.name as string,
          color: label.color as string,
          idBoard: label.idBoard as string,
        })
      );

      setLabels(transformedLabels);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch labels");
      console.error("Error fetching labels:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (boardId) {
      fetchLabels();
    }
  }, [boardId]);

  return {
    labels,
    loading,
    error,
    refetch: fetchLabels,
  };
}
