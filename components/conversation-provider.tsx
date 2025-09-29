"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { nanoid } from "nanoid";
import {
  UIMessage,
  lastAssistantMessageIsCompleteWithToolCalls,
  DefaultChatTransport,
} from "ai";

interface Conversation {
  id: string;
  title: string;
  messages: UIMessage[];
}

interface ConversationContextType {
  conversations: Conversation[];
  currentConversationId: string | null;
  createNewConversation: () => void;
  selectConversation: (id: string) => void;
  messages: UIMessage[];
  input: string;
  setInput: (value: string) => void;
  sendMessage: (message: { text: string }) => void;
  status: "ready" | "submitted" | "streaming" | "error";
  isStreaming: boolean;
  error: Error | undefined;
  stop: () => void;
  regenerate: () => void;
  addToolResult: (
    options:
      | { tool: string; toolCallId: string; output: unknown }
      | {
          tool: string;
          toolCallId: string;
          state: "output-error";
          errorText: string;
        }
  ) => void;
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

  // Manage input state manually for better control
  const [input, setInput] = React.useState("");

  // Chat hook for the current conversation - using new AI SDK UI v5 pattern
  const chatHelpers = useChat({
    id: currentConversationId || undefined,
    // Configure transport with API endpoint
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    // Throttle UI updates to improve performance
    experimental_throttle: 50,
    // Automatically send when all tool results are available
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    // Handle client-side tool calls
    onToolCall: async ({ toolCall }) => {
      // Check if it's a dynamic tool first for proper type narrowing
      if (toolCall.dynamic) {
        return;
      }

      // For now, we'll let server-side tools handle execution
      // Client-side tools can be added here if needed
      console.log("Tool call received:", toolCall.toolName);
    },
    onFinish: ({ message, messages: finishedMessages }) => {
      // Set streaming to false when the response is complete
      setIsStreaming(false);

      // Update conversation title after first message if it's still the default
      if (currentConversationId) {
        setConversations((prevConversations) => {
          return prevConversations.map((conversation) => {
            if (
              conversation.id === currentConversationId &&
              conversation.title === "New conversation" &&
              finishedMessages.length === 1
            ) {
              // Use the first few words of the user's first message as the title
              const firstTextPart = finishedMessages[0].parts.find(
                (part) => part.type === "text"
              );
              const title = firstTextPart
                ? firstTextPart.text.split(" ").slice(0, 5).join(" ") + "..."
                : "New conversation";
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

  const {
    messages,
    status,
    error,
    stop,
    setMessages,
    sendMessage,
    addToolResult,
  } = chatHelpers;

  // Update streaming state based on status
  React.useEffect(() => {
    setIsStreaming(status === "submitted" || status === "streaming");
  }, [status]);

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

  // Regenerate the last assistant message
  const regenerate = React.useCallback(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant") {
        // Remove the last assistant message and resend the previous user message
        const newMessages = messages.slice(0, -1);
        setMessages(newMessages);

        // Find the last user message and resend it
        const lastUserMessage = newMessages[newMessages.length - 1];
        if (lastUserMessage && lastUserMessage.role === "user") {
          const textPart = lastUserMessage.parts.find(
            (part) => part.type === "text"
          );
          if (textPart && "text" in textPart) {
            sendMessage({ text: textPart.text });
          }
        }
      }
    }
  }, [messages, setMessages, sendMessage]);

  const value = React.useMemo(
    () => ({
      conversations,
      currentConversationId,
      createNewConversation,
      selectConversation,
      messages,
      input,
      setInput,
      sendMessage,
      status,
      isStreaming,
      error,
      stop,
      regenerate,
      addToolResult: (
        options:
          | { tool: string; toolCallId: string; output: unknown }
          | {
              tool: string;
              toolCallId: string;
              state: "output-error";
              errorText: string;
            }
      ) => {
        if ("output" in options) {
          addToolResult({
            tool: options.tool,
            toolCallId: options.toolCallId,
            output: options.output,
          });
        } else {
          addToolResult({
            tool: options.tool,
            toolCallId: options.toolCallId,
            state: "output-error",
            errorText: options.errorText,
          });
        }
      },
    }),
    [
      conversations,
      currentConversationId,
      createNewConversation,
      selectConversation,
      messages,
      input,
      sendMessage,
      status,
      isStreaming,
      error,
      stop,
      regenerate,
      addToolResult,
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
