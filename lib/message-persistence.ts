import { UIMessage } from 'ai';

// Simple in-memory storage for development
// In production, you'd use a database like PostgreSQL, MongoDB, or Redis
const messageStore = new Map<string, UIMessage[]>();

export interface ChatSession {
  id: string;
  messages: UIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Save messages to storage
 */
export async function saveMessages(chatId: string, messages: UIMessage[]): Promise<void> {
  try {
    // In production, replace this with your database implementation
    messageStore.set(chatId, messages);
    
    // Optional: Also save to localStorage for client-side persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem(`trello-chat-${chatId}`, JSON.stringify(messages));
    }
    
    console.log(`Saved ${messages.length} messages for chat ${chatId}`);
  } catch (error) {
    console.error('Failed to save messages:', error);
    throw new Error('Failed to save messages');
  }
}

/**
 * Load messages from storage
 */
export async function loadMessages(chatId: string): Promise<UIMessage[]> {
  try {
    // First try in-memory storage
    const messages = messageStore.get(chatId);
    if (messages) {
      return messages;
    }
    
    // Fallback to localStorage for client-side persistence
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`trello-chat-${chatId}`);
      if (stored) {
        const parsedMessages = JSON.parse(stored);
        // Update in-memory storage
        messageStore.set(chatId, parsedMessages);
        return parsedMessages;
      }
    }
    
    return [];
  } catch (error) {
    console.error('Failed to load messages:', error);
    return [];
  }
}

/**
 * Create a new chat session
 */
export async function createChatSession(): Promise<string> {
  const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await saveMessages(chatId, []);
  return chatId;
}

/**
 * Delete a chat session
 */
export async function deleteChatSession(chatId: string): Promise<void> {
  try {
    messageStore.delete(chatId);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`trello-chat-${chatId}`);
    }
    
    console.log(`Deleted chat session ${chatId}`);
  } catch (error) {
    console.error('Failed to delete chat session:', error);
    throw new Error('Failed to delete chat session');
  }
}

/**
 * Get all chat sessions (for chat history)
 */
export async function getAllChatSessions(): Promise<ChatSession[]> {
  try {
    const sessions: ChatSession[] = [];
    
    for (const [chatId, messages] of messageStore.entries()) {
      sessions.push({
        id: chatId,
        messages,
        createdAt: new Date(parseInt(chatId.split('_')[1])),
        updatedAt: new Date(),
      });
    }
    
    return sessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (error) {
    console.error('Failed to get chat sessions:', error);
    return [];
  }
}
