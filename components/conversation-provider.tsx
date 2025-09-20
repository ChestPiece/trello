"use client";

import * as React from "react";
import { useChat } from "ai/react";
import { nanoid } from "nanoid";
import { Message } from "ai";

interface Conversation {
  id: string;
  title: string;
  messages: {
    id: string;
    content: string;
    role: "user" | "assistant" | "system";
  }[];
}

interface ConversationContextType {
  conversations: Conversation[];
  currentConversationId: string | null;
  createNewConversation: () => void;
  selectConversation: (id: string) => void;
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  isStreaming: boolean;
  error: Error | undefined;
  append: (message: Message) => void;
  stop: () => void;
  regenerate: () => void;
}

const ConversationContext = React.createContext<
  ConversationContextType | undefined
>(undefined);

export function ConversationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = React.useState<
    string | null
  >(null);
  const [isStreaming, setIsStreaming] = React.useState(false);

  // Initialize with a default conversation
  React.useEffect(() => {
    if (conversations.length === 0) {
      const id = nanoid();
      setConversations([
        {
          id,
          title: "New conversation",
          messages: [],
        },
      ]);
      setCurrentConversationId(id);
    }
  }, [conversations]);

  // Chat hook for the current conversation
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
    error,
    stop,
    regenerate,
  } = useChat({
    api: "/api/chat",
    id: currentConversationId || undefined,
    // Throttle UI updates to improve performance
    experimental_throttle: 50,
    onResponse: (response) => {
      console.log("🚀 ~ Chat ~ response:", response);
      // Set streaming to true when we start receiving a response
      setIsStreaming(true);
    },
    onFinish: () => {
      // Set streaming to false when the response is complete
      setIsStreaming(false);

      // Update conversation title after first message if it's still the default
      if (currentConversationId) {
        setConversations((prevConversations) => {
          return prevConversations.map((conversation) => {
            if (
              conversation.id === currentConversationId &&
              conversation.title === "New conversation" &&
              messages.length === 1
            ) {
              // Use the first few words of the user's first message as the title
              const title =
                messages[0].content.split(" ").slice(0, 5).join(" ") + "...";
              return { ...conversation, title };
            }
            return conversation;
          });
        });
      }
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setIsStreaming(false);
    },
  });

  // Create a new conversation
  const createNewConversation = React.useCallback(() => {
    const id = nanoid();
    setConversations((prev) => [
      ...prev,
      {
        id,
        title: "New conversation",
        messages: [],
      },
    ]);
    setCurrentConversationId(id);
  }, []);

  // Select an existing conversation
  const selectConversation = React.useCallback((id: string) => {
    setCurrentConversationId(id);
  }, []);

  const value = React.useMemo(
    () => ({
      conversations,
      currentConversationId,
      createNewConversation,
      selectConversation,
      messages,
      input,
      handleInputChange,
      handleSubmit,
      isLoading,
      isStreaming,
      error,
      append,
      stop,
      regenerate,
    }),
    [
      conversations,
      currentConversationId,
      createNewConversation,
      selectConversation,
      messages,
      input,
      handleInputChange,
      handleSubmit,
      isLoading,
      isStreaming,
      error,
      append,
      stop,
      regenerate,
    ]
  );

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = React.useContext(ConversationContext);
  if (context === undefined) {
    throw new Error(
      "useConversation must be used within a ConversationProvider"
    );
  }
  return context;
}
