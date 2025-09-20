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
      // Call the listAttachments tool through the chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `List all attachments for card ${cardToUse}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch attachments");
      }

      // Mock data for development
      const mockAttachments: Attachment[] = [
        {
          id: "attachment1",
          name: "Project Requirements.pdf",
          url: "https://example.com/attachments/project-requirements.pdf",
          mimeType: "application/pdf",
          size: 2048576, // 2MB
          date: "2024-01-15T10:30:00Z",
          idMember: "member1",
          isUpload: true,
          fileName: "project-requirements.pdf",
          edgeColor: null,
          idCard: cardToUse,
          pos: 1,
        },
        {
          id: "attachment2",
          name: "Design Mockup.png",
          url: "https://example.com/attachments/design-mockup.png",
          mimeType: "image/png",
          size: 1024768, // 1MB
          date: "2024-01-16T14:20:00Z",
          idMember: "member2",
          isUpload: true,
          fileName: "design-mockup.png",
          edgeColor: null,
          idCard: cardToUse,
          pos: 2,
        },
        {
          id: "attachment3",
          name: "Meeting Notes.docx",
          url: "https://example.com/attachments/meeting-notes.docx",
          mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          size: 512384, // 512KB
          date: "2024-01-17T09:15:00Z",
          idMember: "member1",
          isUpload: true,
          fileName: "meeting-notes.docx",
          edgeColor: null,
          idCard: cardToUse,
          pos: 3,
        },
        {
          id: "attachment4",
          name: "External Link",
          url: "https://trello.com/guide/external-links",
          mimeType: "text/html",
          size: 0,
          date: "2024-01-18T16:45:00Z",
          idMember: "member3",
          isUpload: false,
          fileName: "",
          edgeColor: "#0079bf",
          idCard: cardToUse,
          pos: 4,
        },
      ];

      setAttachments(mockAttachments);
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


