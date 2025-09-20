import { ConversationProvider } from "@/components/conversation-provider";
import { ChatLayout } from "@/components/Chat/chat-layout";

export default function Home() {
  return (
    <ConversationProvider>
      <ChatLayout />
    </ConversationProvider>
  );
}
