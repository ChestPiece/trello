"use client";

import * as React from "react";
import { useActions, useUIState } from "@ai-sdk/rsc";
import { ChatInput } from "@/components/Chat/chat-input";
import { ScrollArea } from "../ui/scroll-area";
import { ClientMessage } from "@/app/ai";

export function Chat() {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const { sendMessage } = useActions();
  const [messages, setMessages] = useUIState();

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: "user" as const,
      display: <div className="prose prose-sm max-w-none">{input}</div>,
    };

    // Add user message to UI state
    setMessages((prev: ClientMessage[]) => [...prev, userMessage]);

    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // Call the server action
      const response = await sendMessage(currentInput);

      // Add AI response to UI state
      setMessages((prev: ClientMessage[]) => [...prev, response]);
    } catch (error) {
      console.error("Error sending message:", error);

      // Add error message to UI state
      const errorMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: "assistant" as const,
        display: (
          <div className="border border-destructive/20 bg-destructive/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-destructive">⚠️</span>
              <span className="font-medium text-destructive">
                Something went wrong
              </span>
            </div>
            <p className="text-sm text-destructive/80">
              Please try again or contact support if the problem persists.
            </p>
          </div>
        ),
      };

      setMessages((prev: ClientMessage[]) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

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
              {messages.map((message: ClientMessage) => (
                <div
                  key={message.id}
                  className={`chat-message flex w-full items-start gap-4 py-4 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex max-w-[80%] flex-col gap-2 rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.display}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
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
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={() => setIsLoading(false)}
          />
        </div>
      </div>
    </div>
  );
}
