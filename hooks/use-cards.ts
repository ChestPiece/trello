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
      transform: (data: unknown[]) =>
        (data as Record<string, unknown>[]).map(
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
