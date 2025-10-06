"use client";

import * as React from "react";
import { Chat } from "@/components/Chat/chat-rsc";
import { Sidebar } from "@/components/sidebar";
import { ThemeToggle } from "@/components/Theme/theme-toggle";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatLayout() {
  // For now, we'll use a simple sidebar without conversation management
  // This can be enhanced later to work with RSC state management
  const sidebarConversations = [
    { id: "default", title: "Trello Assistant", active: true }
  ];

  return (
    <main className="flex h-screen flex-col md:flex-row">
      {/* Sidebar */}
      <Sidebar
        className="w-[300px] shrink-0 h-full"
        conversations={sidebarConversations}
        onNewConversation={() => {}}
        onSelectConversation={() => {}}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b px-6 shrink-0">
          <h1 className="text-xl font-semibold hidden sm:block">
            Trello Manager
          </h1>
          <h1 className="text-xl font-semibold block sm:hidden"></h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col overflow-hidden">
          <Chat />
        </div>
      </div>
    </main>
  );
}
