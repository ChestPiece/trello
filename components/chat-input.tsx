import * as React from "react";
import { SendIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: ChatInputProps) {
  // Auto-resize the textarea based on content
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);

  return (
    <div className="border-t bg-background md:px-4 md:pt-3 md:pb-3 pb-0 overflow-hidden pt-[9px] px-[9px] flex flex-col">
      <div className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring w-[100%]">
        <Textarea
          disabled={isLoading}
          id="message"
          placeholder="Type your message here..."
          className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0 "
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
            }
          }}
        />
        <div className="flex items-center p-3 pt-0">
          <div className="text-xs text-muted-foreground mr-auto">
            Press Enter to send, Shift+Enter for new line
          </div>
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
            }}
            size="sm"
            className="ml-auto gap-1.5"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Send
                <SendIcon className="size-3.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
