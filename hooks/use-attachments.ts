"use client";

import { useState, useEffect, useCallback } from "react";

export interface Attachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  date: string;
  idMember: string;
  isUpload: boolean;
  fileName: string;
  edgeColor: string | null;
  idCard: string;
  pos: number;
}

export function useAttachments(cardId?: string) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttachments = useCallback(
    async (targetCardId?: string) => {
      const cardToUse = targetCardId || cardId;

      if (!cardToUse) {
        setAttachments([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Call the dedicated attachments API route
        const response = await fetch(
          `/api/attachments?cardId=${cardToUse}&filter=all`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to fetch attachments from API"
          );
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(
            result.error || "Failed to fetch attachments from Trello"
          );
        }

        // Transform the API result to match our Attachment interface
        const formattedAttachments: Attachment[] = result.attachments.map(
          (attachment: Record<string, unknown>) => ({
            id: attachment.id as string,
            name: attachment.name as string,
            url: attachment.url as string,
            mimeType: attachment.mimeType as string,
            size: (attachment.bytes as number) || 0,
            date: attachment.date as string,
            idMember: attachment.idMember as string,
            isUpload: attachment.isUpload as boolean,
            fileName:
              (attachment.fileName as string) || (attachment.name as string),
            edgeColor: attachment.edgeColor as string | null,
            idCard: (attachment.idCard as string) || cardToUse,
            pos: attachment.pos as number,
          })
        );

        setAttachments(formattedAttachments);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch attachments"
        );
        console.error("Error fetching attachments:", err);
      } finally {
        setLoading(false);
      }
    },
    [cardId]
  );

  useEffect(() => {
    if (cardId) {
      fetchAttachments();
    }
  }, [cardId, fetchAttachments]);

  return {
    attachments,
    loading,
    error,
    refetch: fetchAttachments,
  };
}
