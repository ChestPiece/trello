"use client";

import { useState, useEffect } from "react";

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

  const fetchLists = async (targetBoardId?: string) => {
    const boardToUse = targetBoardId || boardId;
    if (!boardToUse) {
      setLists([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the listLists tool through the chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `List all lists in board ${boardToUse}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch lists");
      }

      // For now, we'll use a mock response since the actual API response
      // would be a streaming response. In a real implementation, you might
      // want to create a separate API endpoint for fetching lists.
      const mockLists: List[] = [
        {
          id: "list1",
          name: "To Do",
          closed: false,
          idBoard: boardToUse,
          pos: 1,
          subscribed: false,
          cards: [
            {
              id: "card1",
              name: "Task 1",
              desc: "First task to complete",
              closed: false,
              idList: "list1",
              pos: 1,
              due: "2024-01-15T00:00:00.000Z",
              dueComplete: false,
              idMembers: [],
              idLabels: [],
            },
            {
              id: "card2",
              name: "Task 2",
              desc: "Second task to complete",
              closed: false,
              idList: "list1",
              pos: 2,
              due: "2024-01-20T00:00:00.000Z",
              dueComplete: false,
              idMembers: [],
              idLabels: [],
            },
          ],
        },
        {
          id: "list2",
          name: "In Progress",
          closed: false,
          idBoard: boardToUse,
          pos: 2,
          subscribed: false,
          cards: [
            {
              id: "card3",
              name: "Task 3",
              desc: "Currently working on this",
              closed: false,
              idList: "list2",
              pos: 1,
              due: "2024-01-25T00:00:00.000Z",
              dueComplete: false,
              idMembers: [],
              idLabels: [],
            },
          ],
        },
        {
          id: "list3",
          name: "Done",
          closed: false,
          idBoard: boardToUse,
          pos: 3,
          subscribed: false,
          cards: [
            {
              id: "card4",
              name: "Completed Task",
              desc: "This task is finished",
              closed: false,
              idList: "list3",
              pos: 1,
              due: "2024-01-10T00:00:00.000Z",
              dueComplete: true,
              idMembers: [],
              idLabels: [],
            },
          ],
        },
      ];

      setLists(mockLists);
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

  return {
    lists,
    loading,
    error,
    refetch: fetchLists,
  };
}
