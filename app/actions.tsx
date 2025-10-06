'use server';

import { streamUI } from '@ai-sdk/rsc';
import { openai } from '@ai-sdk/openai';
import { getMutableAIState } from '@ai-sdk/rsc';
import { systemPrompt } from '@/components/Prompts/system-prompt';
import { listBoardsTool, createBoardTool } from '@/lib/tool-registry-ui';
import { ServerMessage, ClientMessage } from './ai';

// Loading component for tool execution
const LoadingComponent = () => (
  <div className="animate-pulse p-4 bg-muted rounded-lg">
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      <span className="text-sm text-muted-foreground">Processing...</span>
    </div>
  </div>
);

// Text component for regular AI responses
const TextComponent = ({ content }: { content: string }) => (
  <div className="prose prose-sm max-w-none">
    <div className="whitespace-pre-wrap">{content}</div>
  </div>
);

export async function sendMessage(input: string): Promise<ClientMessage> {
  'use server';

  const history = getMutableAIState();

  // Update the AI state with the new user message
  history.update([...history.get(), { role: 'user', content: input }]);

  const result = await streamUI({
    model: openai('gpt-4o'),
    system: systemPrompt,
    messages: history.get(),
    text: ({ content }) => <TextComponent content={content} />,
    tools: {
      listBoards: listBoardsTool,
      createBoard: createBoardTool,
    },
    temperature: 0, // Ensure deterministic tool calls
  });

  // Update the AI state with the response
  history.done([...history.get(), { role: 'assistant', content: 'UI response' }]);

  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    role: 'assistant',
    display: result.value,
  };
}
