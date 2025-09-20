"use client";

import { useState, useEffect } from "react";

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

  const fetchAttachments = async (targetCardId?: string) => {
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
        (attachment: any) => ({
          id: attachment.id,
          name: attachment.name,
          url: attachment.url,
          mimeType: attachment.mimeType,
          size: attachment.bytes || 0,
          date: attachment.date,
          idMember: attachment.idMember,
          isUpload: attachment.isUpload,
          fileName: attachment.fileName || attachment.name,
          edgeColor: attachment.edgeColor,
          idCard: attachment.idCard || cardToUse,
          pos: attachment.pos,
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
  };

  useEffect(() => {
    if (cardId) {
      fetchAttachments();
    }
  }, [cardId]);

  return {
    attachments,
    loading,
    error,
    refetch: fetchAttachments,
  };
}
