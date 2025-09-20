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
      // Call the listLabels tool through the chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `List all labels in board ${boardToUse}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch labels");
      }

      // Mock data for development
      const mockLabels: Label[] = [
        {
          id: "label1",
          name: "High Priority",
          color: "red",
          idBoard: boardToUse,
        },
        {
          id: "label2",
          name: "Medium Priority",
          color: "yellow",
          idBoard: boardToUse,
        },
        {
          id: "label3",
          name: "Low Priority",
          color: "green",
          idBoard: boardToUse,
        },
        {
          id: "label4",
          name: "Bug",
          color: "red",
          idBoard: boardToUse,
        },
        {
          id: "label5",
          name: "Feature",
          color: "blue",
          idBoard: boardToUse,
        },
        {
          id: "label6",
          name: "Documentation",
          color: "purple",
          idBoard: boardToUse,
        },
        {
          id: "label7",
          name: "Review",
          color: "orange",
          idBoard: boardToUse,
        },
        {
          id: "label8",
          name: "Done",
          color: "green",
          idBoard: boardToUse,
        },
      ];

      setLabels(mockLabels);
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
