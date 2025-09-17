import { cn } from "@/lib/utils";
import { Message } from "ai";
import { FormattedText } from "./formatted-text";
import { format } from "date-fns";

export interface ChatMessageProps {
  message: Message;
}

const formatDate = (timestamp: string) => {
  if (!timestamp) return "Time Stamp";

  const date = new Date(timestamp);
  return format(date, "yyyy-M-d");
};

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "chat-message flex w-full items-start gap-4 py-4",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      {/* User Message */}
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-2 rounded-lg px-4 py-2",
          message.role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        <div className="text-sm">
          {message.content.split("\n").map((text, i) => (
            <>
              <p key={i} className={i > 0 ? "mt-2" : ""}>
                <FormattedText content={text} />
              </p>
            </>
          ))}
          <span className="text-xs text-left">
            {formatDate(new Date().toISOString())}
          </span>
        </div>
      </div>
    </div>
  );
}
