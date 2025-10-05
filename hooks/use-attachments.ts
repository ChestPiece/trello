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
      transform: (data: unknown[]) =>
        (data as Record<string, unknown>[]).map(
          (attachment: Record<string, unknown>) => ({
            id: attachment.id,
            name: attachment.name,
            url: attachment.url,
            mimeType: attachment.mimeType,
            bytes: attachment.bytes,
            date: attachment.date,
            idMember: attachment.idMember,
            isUpload: attachment.isUpload,
            fileName: attachment.fileName || attachment.name,
            edgeColor: attachment.edgeColor,
            idCard: attachment.idCard || cardId,
            pos: attachment.pos,
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
