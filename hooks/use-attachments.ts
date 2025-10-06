"use client";

import { useTrelloList } from "./use-trello-resource";
import { Attachment } from "@/lib/types/trello";

export function useAttachments(cardId?: string) {
  const {
    data: attachments,
    loading,
    error,
    refetch,
  } = useTrelloList<Attachment>(
    "listAttachments",
    {
      cardId: cardId || undefined,
      filter: "all",
    },
    {
      autoFetch: !!cardId,
      transform: (data: unknown[]): Attachment[] =>
        (data as Record<string, unknown>[]).map(
          (attachment: Record<string, unknown>) => ({
            id: attachment.id as string,
            name: attachment.name as string,
            url: attachment.url as string,
            mimeType: attachment.mimeType as string,
            bytes: attachment.bytes as number,
            date: attachment.date as string,
            idMember: attachment.idMember as string,
            isUpload: attachment.isUpload as boolean,
            fileName: (attachment.fileName || attachment.name) as string,
            edgeColor: attachment.edgeColor as string,
            idCard: (attachment.idCard || cardId) as string,
            pos: attachment.pos as number,
          })
        ),
    }
  );

  return {
    attachments: attachments || [],
    loading,
    error,
    refetch,
  };
}
