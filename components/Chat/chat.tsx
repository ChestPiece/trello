"use client";

import * as React from "react";
import { ChatInput } from "@/components/Chat/chat-input";
import { ChatMessage } from "@/components/Chat/chat-message";
import { useConversation } from "@/components/conversation-provider";
import { ScrollArea } from "../ui/scroll-area";

export function Chat() {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const {
    messages,
    input,
    setInput,
    sendMessage,
    status,
    isStreaming,
    error,
    regenerate,
  } = useConversation();

  const isLoading = status !== "ready";

  // Scroll to bottom when messages change
  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  // Show skeleton loading for AI responses
  // Only show loading when we're submitted but not yet streaming content
  // Don't show if we already have a message being streamed
  const showSkeletonLoading =
    status === "submitted" &&
    messages.length > 0 &&
    messages[messages.length - 1]?.role === "user";

  // Check if the current response contains tool calls (UI components)
  const lastMessage = messages[messages.length - 1];
  const hasToolCalls =
    lastMessage?.role === "assistant" &&
    lastMessage.parts.some((part) => part.type.startsWith("tool-"));

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <div className="max-w-md text-center">
              <h1 className="mb-2 text-2xl font-bold">
                Welcome, what&apos;s on your mind today?
              </h1>
              <p className="text-muted-foreground">
                Start a conversation by sending a message below.
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
            <div className="space-y-4 p-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {/* Skeleton loading for AI responses */}
              {showSkeletonLoading && (
                <div className="flex w-full items-start gap-4 py-4 justify-start">
                  {hasToolCalls ? (
                    // Detailed UI component skeleton for tool calls
                    <div className="flex max-w-[80%] flex-col gap-4 rounded-2xl px-6 py-5 bg-gradient-to-br from-background to-muted/30 border border-border/40 shadow-lg backdrop-blur-sm">
                      {/* AI Avatar and name */}
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                          <div className="w-4 h-4 bg-primary/60 rounded-full animate-pulse"></div>
                        </div>
                        <div className="h-4 bg-gradient-to-r from-primary/30 to-primary/10 rounded-full animate-pulse w-24"></div>
                      </div>

                      {/* Content skeleton */}
                      <div className="space-y-3">
                        <div className="h-4 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/10 rounded-lg animate-pulse w-full"></div>
                        <div className="h-4 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/10 rounded-lg animate-pulse w-4/5"></div>
                        <div className="h-4 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/10 rounded-lg animate-pulse w-3/4"></div>
                        <div className="h-4 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/10 rounded-lg animate-pulse w-5/6"></div>
                      </div>

                      {/* Action buttons skeleton */}
                      <div className="mt-4 flex gap-2">
                        <div className="h-9 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg animate-pulse w-20"></div>
                        <div className="h-9 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg animate-pulse w-24"></div>
                      </div>

                      {/* Subtle shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite] rounded-2xl"></div>
                    </div>
                  ) : (
                    // Simple loading indicator for text messages
                    <div className="flex max-w-[80%] flex-col gap-2 rounded-lg px-4 py-2 bg-muted">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="chat-message flex w-full items-start gap-4 py-4 justify-start">
                  <div className="flex max-w-[80%] flex-col gap-2 rounded-lg px-4 py-2 bg-destructive/10 border border-destructive/20">
                    <div className="text-sm text-destructive">
                      <strong>Something went wrong.</strong> Please try again.
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={regenerate}
                        className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Input area */}
      <div className="shrink-0">
        <ChatInput
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
