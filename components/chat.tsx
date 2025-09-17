"use client";

import * as React from "react";
import { ChatInput } from "@/components/chat-input";
import { ChatMessage } from "@/components/chat-message";
import { cn } from "@/lib/utils";
import { useConversation } from "@/components/conversation-provider";
import { ScrollArea } from "./ui/scroll-area";

export function Chat() {
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    isStreaming,
  } = useConversation();

  // Scroll to bottom when messages change
  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Show typing indicator when loading but not streaming
  const showTypingIndicator = isLoading && !isStreaming;

  return (
    <div className="flex h-full w-full flex-col items-center justify-between ">
      <div className="flex w-full flex-1 flex-col overflow-y-auto pl-4">
        <div className="flex-1" />
        {messages.length === 0 ? (
          <div className="flex h-[calc(100vh-205px)] w-full flex-col items-center justify-center">
            <div className="max-w-md text-center">
              <h1 className="mb-2 text-2xl font-bold">Welcome to AI Chat</h1>
              <p className="text-muted-foreground">
                Start a conversation by sending a message below.
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea
            className="sm:h-[calc(100vh-220px)] h-[calc(100vh-202px)]"
            ref={chatContainerRef}
          >
            <div className="space-y-4 pb-4 pr-4">
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
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
        )}
      </div>
      <div className={cn("w-full pb-0 pt-2", messages.length === 0 && "pt-0")}>
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
