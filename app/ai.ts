import { createAI } from '@ai-sdk/rsc';
import { sendMessage } from './actions';

// Define the AI state and UI state types
export type ServerMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ClientMessage = {
  id: string;
  role: 'user' | 'assistant';
  display: React.ReactNode;
};

// Create the AI provider with the initial states and allowed actions
export const AI = createAI<ServerMessage[], ClientMessage[]>({
  initialAIState: [],
  initialUIState: [],
  actions: {
    sendMessage,
  },
});
