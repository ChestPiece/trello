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
      // Call the listChecklists tool through the chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `List all checklists for card ${cardToUse}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch checklists");
      }

      // Mock data for development
      const mockChecklists: Checklist[] = [
        {
          id: "checklist1",
          name: "Project Setup",
          idCard: cardToUse,
          pos: 1,
          checkItems: [
            {
              id: "item1",
              name: "Create project repository",
              state: "complete",
              pos: 1,
              due: null,
              idMember: "member1",
            },
            {
              id: "item2",
              name: "Set up development environment",
              state: "complete",
              pos: 2,
              due: null,
              idMember: "member1",
            },
            {
              id: "item3",
              name: "Configure CI/CD pipeline",
              state: "incomplete",
              pos: 3,
              due: "2024-01-25T00:00:00Z",
              idMember: "member2",
            },
            {
              id: "item4",
              name: "Write initial documentation",
              state: "incomplete",
              pos: 4,
              due: "2024-01-30T00:00:00Z",
              idMember: "member3",
            },
          ],
        },
        {
          id: "checklist2",
          name: "Design Phase",
          idCard: cardToUse,
          pos: 2,
          checkItems: [
            {
              id: "item5",
              name: "Create wireframes",
              state: "complete",
              pos: 1,
              due: null,
              idMember: "member2",
            },
            {
              id: "item6",
              name: "Design user interface",
              state: "incomplete",
              pos: 2,
              due: "2024-02-05T00:00:00Z",
              idMember: "member2",
            },
            {
              id: "item7",
              name: "Create style guide",
              state: "incomplete",
              pos: 3,
              due: "2024-02-10T00:00:00Z",
              idMember: "member2",
            },
          ],
        },
        {
          id: "checklist3",
          name: "Testing",
          idCard: cardToUse,
          pos: 3,
          checkItems: [
            {
              id: "item8",
              name: "Unit tests",
              state: "incomplete",
              pos: 1,
              due: "2024-02-15T00:00:00Z",
              idMember: "member1",
            },
            {
              id: "item9",
              name: "Integration tests",
              state: "incomplete",
              pos: 2,
              due: "2024-02-20T00:00:00Z",
              idMember: "member1",
            },
            {
              id: "item10",
              name: "User acceptance testing",
              state: "incomplete",
              pos: 3,
              due: "2024-02-25T00:00:00Z",
              idMember: "member3",
            },
          ],
        },
      ];

      setChecklists(mockChecklists);
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


