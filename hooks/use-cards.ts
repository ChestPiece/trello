"use client";

import { useState, useEffect, useCallback } from "react";
import { useDataRefresh } from "@/components/data-refresh-provider";

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
  const { refreshCardsState } = useDataRefresh();

  const fetchCards = useCallback(
    async (targetBoardId?: string, targetListId?: string) => {
      const boardToUse = targetBoardId || boardId;
      const listToUse = targetListId || listId;

      if (!boardToUse && !listToUse) {
        setCards([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Call the dedicated cards API route
        const params = new URLSearchParams({
          filter: "all",
          ...(boardToUse && { boardId: boardToUse }),
          ...(listToUse && { listId: listToUse }),
        });

        const response = await fetch(`/api/cards?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch cards from API");
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch cards from Trello");
        }

        // Transform the API result to match our Card interface
        const transformedCards: Card[] = result.cards.map(
          (card: Record<string, unknown>) => ({
            id: card.id,
            name: card.name,
            desc: card.desc,
            closed: card.closed,
            idList: card.idList,
            idBoard: card.idBoard,
            pos: card.pos,
            due: card.due,
            dueComplete: card.dueComplete,
            idMembers: card.idMembers,
            idLabels: card.idLabels,
            url: card.url,
            shortUrl: card.shortUrl,
            idShort: card.idShort,
            dateLastActivity: card.dateLastActivity,
            idAttachmentCover: card.idAttachmentCover,
            manualCoverAttachment: card.manualCoverAttachment,
            idChecklists: card.idChecklists,
            idMembersVoted: card.idMembersVoted,
            labels: card.labels || [],
            members: card.members || [],
            attachments: card.attachments || [],
            checklists: card.checklists || [],
          })
        );

        setCards(transformedCards);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch cards");
        console.error("Error fetching cards:", err);
      } finally {
        setLoading(false);
      }
    },
    [boardId, listId]
  );

  useEffect(() => {
    if (boardId || listId) {
      fetchCards();
    }
  }, [boardId, listId, fetchCards]);

  // Listen for refresh triggers
  useEffect(() => {
    if (
      (refreshCardsState.boardId === boardId ||
        refreshCardsState.boardId === undefined) &&
      (refreshCardsState.listId === listId ||
        refreshCardsState.listId === undefined)
    ) {
      fetchCards();
    }
  }, [refreshCardsState, boardId, listId, fetchCards]);

  return {
    cards,
    loading,
    error,
    refetch: fetchCards,
  };
}
