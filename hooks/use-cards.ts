"use client";

import { useState, useEffect } from "react";

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
  idBoard?: string;
  idShort?: number;
  dateLastActivity?: string;
  idAttachmentCover?: string;
  manualCoverAttachment?: boolean;
  idChecklists?: string[];
  idMembersVoted?: string[];
  idLabels?: string[];
  labels?: Label[];
  members?: Member[];
  attachments?: Attachment[];
  checklists?: Checklist[];
}

export interface Label {
  id: string;
  name: string;
  color: string;
  idBoard: string;
}

export interface Member {
  id: string;
  fullName: string;
  username: string;
  avatarUrl?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  mimeType?: string;
  bytes?: number;
  date: string;
}

export interface Checklist {
  id: string;
  name: string;
  idCard: string;
  pos: number;
  checkItems?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  name: string;
  state: "complete" | "incomplete";
  idChecklist: string;
  pos: number;
}

export function useCards(boardId?: string, listId?: string) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = async (targetBoardId?: string, targetListId?: string) => {
    const boardToUse = targetBoardId || boardId;
    const listToUse = targetListId || listId;

    if (!boardToUse && !listToUse) {
      setCards([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the listCards tool through the chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `List all cards${
                boardToUse ? ` in board ${boardToUse}` : ""
              }${listToUse ? ` in list ${listToUse}` : ""}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cards");
      }

      // Mock data for development
      const mockCards: Card[] = [
        {
          id: "card1",
          name: "Design new homepage",
          desc: "Create wireframes and mockups for the new homepage design",
          closed: false,
          idList: listToUse || "list1",
          idBoard: boardToUse || "board1",
          pos: 1,
          due: "2024-01-20T00:00:00.000Z",
          dueComplete: false,
          idMembers: ["member1", "member2"],
          idLabels: ["label1", "label2"],
          url: "https://trello.com/c/card1",
          shortUrl: "https://trello.com/c/abc123",
          idShort: 1,
          dateLastActivity: "2024-01-15T10:30:00.000Z",
          labels: [
            {
              id: "label1",
              name: "Design",
              color: "blue",
              idBoard: boardToUse || "board1",
            },
            {
              id: "label2",
              name: "High Priority",
              color: "red",
              idBoard: boardToUse || "board1",
            },
          ],
          members: [
            {
              id: "member1",
              fullName: "John Doe",
              username: "johndoe",
              avatarUrl: "https://via.placeholder.com/30",
            },
            {
              id: "member2",
              fullName: "Jane Smith",
              username: "janesmith",
              avatarUrl: "https://via.placeholder.com/30",
            },
          ],
          attachments: [
            {
              id: "attachment1",
              name: "wireframe.pdf",
              url: "https://example.com/wireframe.pdf",
              mimeType: "application/pdf",
              bytes: 1024000,
              date: "2024-01-15T09:00:00.000Z",
            },
          ],
          checklists: [
            {
              id: "checklist1",
              name: "Design Tasks",
              idCard: "card1",
              pos: 1,
              checkItems: [
                {
                  id: "checkitem1",
                  name: "Create wireframes",
                  state: "complete",
                  idChecklist: "checklist1",
                  pos: 1,
                },
                {
                  id: "checkitem2",
                  name: "Design mockups",
                  state: "incomplete",
                  idChecklist: "checklist1",
                  pos: 2,
                },
              ],
            },
          ],
        },
        {
          id: "card2",
          name: "Implement user authentication",
          desc: "Add login and registration functionality",
          closed: false,
          idList: listToUse || "list2",
          idBoard: boardToUse || "board1",
          pos: 2,
          due: "2024-01-25T00:00:00.000Z",
          dueComplete: false,
          idMembers: ["member3"],
          idLabels: ["label3"],
          url: "https://trello.com/c/card2",
          shortUrl: "https://trello.com/c/def456",
          idShort: 2,
          dateLastActivity: "2024-01-16T14:20:00.000Z",
          labels: [
            {
              id: "label3",
              name: "Development",
              color: "green",
              idBoard: boardToUse || "board1",
            },
          ],
          members: [
            {
              id: "member3",
              fullName: "Bob Johnson",
              username: "bobjohnson",
              avatarUrl: "https://via.placeholder.com/30",
            },
          ],
          attachments: [],
          checklists: [],
        },
        {
          id: "card3",
          name: "Write documentation",
          desc: "Create user guides and API documentation",
          closed: false,
          idList: listToUse || "list3",
          idBoard: boardToUse || "board1",
          pos: 3,
          due: "2024-01-30T00:00:00.000Z",
          dueComplete: false,
          idMembers: ["member4"],
          idLabels: ["label4"],
          url: "https://trello.com/c/card3",
          shortUrl: "https://trello.com/c/ghi789",
          idShort: 3,
          dateLastActivity: "2024-01-17T11:45:00.000Z",
          labels: [
            {
              id: "label4",
              name: "Documentation",
              color: "yellow",
              idBoard: boardToUse || "board1",
            },
          ],
          members: [
            {
              id: "member4",
              fullName: "Alice Brown",
              username: "alicebrown",
              avatarUrl: "https://via.placeholder.com/30",
            },
          ],
          attachments: [],
          checklists: [],
        },
      ];

      setCards(mockCards);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch cards");
      console.error("Error fetching cards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (boardId || listId) {
      fetchCards();
    }
  }, [boardId, listId]);

  return {
    cards,
    loading,
    error,
    refetch: fetchCards,
  };
}
