"use client";

import { useTrelloList } from "./use-trello-resource";
import { Card } from "@/lib/types/trello";

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
      transform: (data: unknown[]): Card[] =>
        (data as Record<string, unknown>[]).map(
          (card: Record<string, unknown>) => ({
            id: card.id as string,
            name: card.name as string,
            desc: card.desc as string,
            closed: card.closed as boolean,
            idList: card.idList as string,
            idBoard: card.idBoard as string,
            pos: card.pos as number,
            due: card.due as string,
            dueComplete: card.dueComplete as boolean,
            idMembers: card.idMembers as string[],
            idLabels: card.idLabels as string[],
            url: card.url as string,
            shortUrl: card.shortUrl as string,
            idShort: card.idShort as number,
            dateLastActivity: card.dateLastActivity as string,
            idAttachmentCover: card.idAttachmentCover as string,
            manualCoverAttachment: card.manualCoverAttachment as boolean,
            idChecklists: card.idChecklists as string[],
            idMembersVoted: card.idMembersVoted as string[],
            labels: (card.labels || []) as any[],
            members: (card.members || []) as any[],
            attachments: (card.attachments || []) as any[],
            checklists: (card.checklists || []) as any[],
          })
        ),
    }
  );

  return {
    cards: cards || [],
    loading,
    error,
    refetch,
  };
}
