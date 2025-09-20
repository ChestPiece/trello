"use client";

import { useState, useEffect } from "react";

export interface Board {
  id: string;
  name: string;
  description?: string;
  visibility?: string;
  url?: string;
  shortUrl?: string;
  closed?: boolean;
  pinned?: boolean;
  starred?: boolean;
  organizationId?: string;
}

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBoards = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call the listBoards tool through the chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: "List all my boards with their details",
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch boards");
      }

      // Parse the streaming response to extract board data
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      let result = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        result += chunk;
      }

      // Try to extract board data from the response
      // The response might contain tool calls and results
      try {
        // Look for board data in the response
        const boardMatches = result.match(/"boards":\s*\[([\s\S]*?)\]/);
        if (boardMatches) {
          const boardsJson = `[${boardMatches[1]}]`;
          const boardsData = JSON.parse(boardsJson);

          const formattedBoards: Board[] = boardsData.map(
            (board: Record<string, unknown>) => ({
              id: board.id,
              name: board.name,
              description: board.description || board.desc,
              visibility:
                board.visibility ||
                (board.prefs as Record<string, unknown>)?.permissionLevel,
              url: board.url,
              shortUrl: board.shortUrl,
              closed: board.closed,
              pinned: board.pinned,
              starred: board.starred,
              organizationId: board.organizationId || board.idOrganization,
            })
          );

          setBoards(formattedBoards);
        } else {
          // Fallback: try to parse the entire response as JSON
          const responseData = JSON.parse(result);
          if (responseData.boards) {
            const formattedBoards: Board[] = responseData.boards.map(
              (board: Record<string, unknown>) => ({
                id: board.id,
                name: board.name,
                description: board.description || board.desc,
                visibility:
                  board.visibility ||
                  (board.prefs as Record<string, unknown>)?.permissionLevel,
                url: board.url,
                shortUrl: board.shortUrl,
                closed: board.closed,
                pinned: board.pinned,
                starred: board.starred,
                organizationId: board.organizationId || board.idOrganization,
              })
            );
            setBoards(formattedBoards);
          } else {
            throw new Error("No boards found in response");
          }
        }
      } catch (parseError) {
        console.error("Error parsing board data:", parseError);
        // If parsing fails, show an error but don't crash
        setError("Failed to parse board data from Trello API");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch boards");
      console.error("Error fetching boards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  return {
    boards,
    loading,
    error,
    refetch: fetchBoards,
  };
}
