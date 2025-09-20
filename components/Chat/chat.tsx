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
    handleInputChange,
    handleSubmit,
    isLoading,
    isStreaming,
    error,
    regenerate,
  } = useConversation();

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

  // Show typing indicator when loading but not streaming
  const showTypingIndicator = isLoading && !isStreaming;

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

              {/* Typing indicator */}
              {showTypingIndicator && (
                <div className="chat-message flex w-full items-start gap-4 py-4 justify-start">
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
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="chat-message flex w-full items-start gap-4 py-4 justify-start">
                  <div className="flex max-w-[80%] flex-col gap-2 rounded-lg px-4 py-2 bg-destructive/10 border border-destructive/20">
                    <div className="text-sm text-destructive">
                      <strong>Error:</strong> {error.message}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={regenerate}
                        className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                      >
                        Regenerate
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
      <div className="shrink-0 border-t bg-background">
        <div className="p-4">
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
