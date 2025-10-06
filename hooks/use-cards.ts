"use client";

import { useTrelloList } from "./use-trello-resource";
import { Card, Label, Member, Attachment, Checklist } from "@/lib/types/trello";

// Type for raw Trello API response
interface TrelloCardResponse {
  id: string;
  name: string;
  desc?: string;
  closed: boolean;
  idList: string;
  idBoard?: string;
  pos: number;
  due?: string;
  dueComplete?: boolean;
  idMembers?: string[];
  idLabels?: string[];
  url?: string;
  shortUrl?: string;
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

export function useCards(boardId?: string, listId?: string) {
  const {
    data: cards,
    loading,
    error,
    refetch,
  } = useTrelloList<Card>(
    "listCards",
    {
      boardId: boardId || undefined,
      listId: listId || undefined,
      filter: "all",
      fields: [
        "id",
        "name",
        "desc",
        "closed",
        "idList",
        "idBoard",
        "pos",
        "due",
        "dueComplete",
        "idMembers",
        "idLabels",
        "url",
        "shortUrl",
        "idShort",
        "dateLastActivity",
        "idAttachmentCover",
        "manualCoverAttachment",
        "idChecklists",
        "idMembersVoted",
      ],
      attachments: true,
      members: true,
      checklists: "all",
    },
    {
      autoFetch: !!(boardId || listId),
      transform: (data: unknown[]): Card[] => {
        if (!Array.isArray(data)) {
          return [];
        }

        return data.map((card: unknown): Card => {
          const cardData = card as TrelloCardResponse;

          return {
            id: cardData.id,
            name: cardData.name,
            desc: cardData.desc,
            closed: cardData.closed,
            idList: cardData.idList,
            idBoard: cardData.idBoard,
            pos: cardData.pos,
            due: cardData.due,
            dueComplete: cardData.dueComplete,
            idMembers: cardData.idMembers || [],
            idLabels: cardData.idLabels || [],
            url: cardData.url,
            shortUrl: cardData.shortUrl,
            idShort: cardData.idShort,
            dateLastActivity: cardData.dateLastActivity,
            idAttachmentCover: cardData.idAttachmentCover,
            manualCoverAttachment: cardData.manualCoverAttachment,
            idChecklists: cardData.idChecklists || [],
            idMembersVoted: cardData.idMembersVoted || [],
            labels: cardData.labels || [],
            members: cardData.members || [],
            attachments: cardData.attachments || [],
            checklists: cardData.checklists || [],
          };
        });
      },
    }
  );

  return {
    cards: cards || [],
    loading,
    error,
    refetch,
  };
}
