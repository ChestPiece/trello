import { useState, useEffect } from "react";
import { UIMessage } from "ai";

interface ChatSession {
  id: string;
  messages: UIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Hook for managing chat history and loading messages
 */
export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load chat sessions from localStorage on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load from localStorage
      const storedSessions: ChatSession[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("trello-chat-")) {
          const chatId = key.replace("trello-chat-", "");
          const messages = JSON.parse(localStorage.getItem(key) || "[]");

          storedSessions.push({
            id: chatId,
            messages,
            createdAt: new Date(parseInt(chatId.split("_")[1])),
            updatedAt: new Date(),
          });
        }
      }

      setSessions(
        storedSessions.sort(
          (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
        )
      );
    } catch (err) {
      setError("Failed to load chat history");
      console.error("Error loading chat sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId: string): Promise<UIMessage[]> => {
    try {
      const response = await fetch(`/api/chat/${chatId}`);
      if (!response.ok) {
        throw new Error("Failed to load messages");
      }
      const data = await response.json();
      return data.messages;
    } catch (err) {
      console.error("Error loading messages:", err);
      return [];
    }
  };

  const deleteSession = async (chatId: string) => {
    try {
      // Remove from localStorage
      localStorage.removeItem(`trello-chat-${chatId}`);

      // Update sessions state
      setSessions((prev) => prev.filter((session) => session.id !== chatId));
    } catch (err) {
      setError("Failed to delete chat session");
      console.error("Error deleting session:", err);
    }
  };

  return {
    sessions,
    loading,
    error,
    loadMessages,
    deleteSession,
    refreshSessions: loadSessions,
  };
}
