"use client";

import * as React from "react";
import { PlusIcon, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SidebarProps {
  className?: string;
  conversations: {
    id: string;
    title: string;
    active?: boolean;
  }[];
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
}

export function Sidebar({
  className,
  conversations,
  onNewConversation,
  onSelectConversation,
}: SidebarProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden fixed left-4 top-2 z-10"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0">
          <MobileSidebar
            conversations={conversations}
            onNewConversation={onNewConversation}
            onSelectConversation={(id) => {
              onSelectConversation(id);
              setOpen(false);
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className={cn("hidden md:flex", className)}>
        <div className="flex h-full w-full flex-col">
          <DesktopSidebar
            conversations={conversations}
            onNewConversation={onNewConversation}
            onSelectConversation={onSelectConversation}
          />
        </div>
      </div>
    </>
  );
}

function MobileSidebar({
  conversations,
  onNewConversation,
  onSelectConversation,
}: Omit<SidebarProps, "className">) {
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex h-14 items-center px-4 border-b">
        <h2 className="text-lg font-semibold">Conversations</h2>
      </div>
      <NewConversationButton
        onClick={onNewConversation}
        className="mx-4 my-2"
      />
      <Separator />
      <ConversationList
        conversations={conversations}
        onSelectConversation={onSelectConversation}
      />
    </div>
  );
}

function DesktopSidebar({
  conversations,
  onNewConversation,
  onSelectConversation,
}: Omit<SidebarProps, "className">) {
  return (
    <div className="flex h-full flex-col border-r">
      <div className="flex h-14 items-center px-4 border-b">
        <h2 className="text-lg font-semibold">Conversations</h2>
      </div>
      <NewConversationButton
        onClick={onNewConversation}
        className="mx-2 my-2"
      />
      <Separator />
      <ConversationList
        conversations={conversations}
        onSelectConversation={onSelectConversation}
      />
    </div>
  );
}

function NewConversationButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      onClick={onClick}
      className={cn("flex w-auto items-center justify-start gap-2", className)}
    >
      <PlusIcon className="h-4 w-4" />
      New conversation
    </Button>
  );
}

function ConversationList({
  conversations,
  onSelectConversation,
}: {
  conversations: SidebarProps["conversations"];
  onSelectConversation: (id: string) => void;
}) {
  return (
    <ScrollArea className="flex-1">
      <div className="p-2">
        {conversations.length > 0 ? (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <Button
                key={conversation.id}
                variant={conversation.active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-left",
                  conversation.active && "bg-accent"
                )}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex-1 truncate">{conversation.title}</div>
              </Button>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No conversation history
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
