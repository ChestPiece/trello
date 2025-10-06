import {
  streamText,
  convertToModelMessages,
  UIMessage,
  createIdGenerator,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest } from "next/server";
import { systemPrompt } from "@/components/Prompts/system-prompt";
import { trelloTools } from "@/lib/tool-registry";
import { rateLimiter } from "@/lib/rate-limiter";
import { monitoringService } from "@/lib/Services/monitoring-service";
import {
  createErrorResponse,
  createRateLimitResponse,
  getClientIP,
} from "@/lib/api-helpers";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// You'll need to set OPENAI_API_KEY in your environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

// Check for Trello API credentials
if (!process.env.TRELLO_API_KEY || !process.env.TRELLO_API_TOKEN) {
  console.warn(
    "Warning: Trello API credentials not configured. Trello tools will not work properly."
  );
}

export async function POST(req: NextRequest) {
  const requestId = monitoringService.generateRequestId();
  const clientIP = getClientIP(req);
  const userAgent = req.headers.get("user-agent");

  // Start monitoring
  monitoringService.startRequest(
    requestId,
    clientIP,
    "POST",
    "/api/chat",
    userAgent || undefined
  );

  try {
    // Rate limiting check
    const rateLimitResult = rateLimiter.check(clientIP);
    if (!rateLimitResult.allowed) {
      monitoringService.endRequest(requestId, 429, "Rate limit exceeded");
      return createRateLimitResponse(
        rateLimitResult.retryAfter || 60,
        requestId
      );
    }

    // Parse request body - expect UIMessage[] format
    const { messages }: { messages: UIMessage[] } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      monitoringService.endRequest(requestId, 400, "Invalid messages format");
      return createErrorResponse(
        "Invalid request format",
        "Expected messages array in request body",
        400,
        { requestId }
      );
    }

    // Validate that messages have the required structure
    const isValidMessages = messages.every(
      (msg) => msg && typeof msg === "object" && "role" in msg && "parts" in msg
    );

    if (!isValidMessages) {
      monitoringService.endRequest(requestId, 400, "Invalid message structure");
      return createErrorResponse(
        "Invalid message structure",
        "Each message must have 'role' and 'parts' properties",
        400,
        { requestId }
      );
    }

    // Stream the response using streamText with Trello tools integration
    const result = streamText({
      model: openai("gpt-4o"),
      messages: convertToModelMessages(messages),
      system: systemPrompt,
      tools: trelloTools,
      temperature: 0, // Ensure deterministic tool calls
      onError: ({ error }) => {
        console.error("Stream error:", error);
        console.error(
          "Tool execution error:",
          error instanceof Error ? error.message : String(error)
        );
      },
      onFinish: ({ finishReason, usage, response }) => {
        console.log("Stream finished:", {
          finishReason,
          usage,
          responseType: typeof response,
        });

        monitoringService.endRequest(requestId, 200);
      },
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      // Generate consistent server-side IDs for persistence
      generateMessageId: createIdGenerator({
        prefix: "msg",
        size: 16,
      }),
      // Send metadata about the message
      messageMetadata: ({ part }) => {
        // Send metadata when streaming starts
        if (part.type === "start") {
          return {
            createdAt: Date.now(),
            model: "gpt-4o",
            requestId,
          };
        }

        // Send additional metadata when streaming completes
        if (part.type === "finish") {
          return {
            totalTokens: part.totalUsage?.totalTokens,
            finishReason: part.finishReason,
          };
        }

        // Return undefined for other part types to avoid sending metadata
        return undefined;
      },
      // Handle errors gracefully
      onError: (error) => {
        console.error("UI Message Stream Error:", error);

        if (error == null) {
          return "An unknown error occurred";
        }

        if (typeof error === "string") {
          return error;
        }

        if (error instanceof Error) {
          return error.message;
        }

        return JSON.stringify(error);
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Determine appropriate status code based on error type
    let statusCode = 500;
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      statusCode = 400; // Bad Request for JSON parsing errors
    } else if (
      errorMessage.includes("validation") ||
      errorMessage.includes("invalid")
    ) {
      statusCode = 400; // Bad Request for validation errors
    }

    monitoringService.endRequest(requestId, statusCode, errorMessage);

    console.error("🚀 ~ POST ~ error:", error);
    return createErrorResponse(
      statusCode === 400 ? "Bad Request" : "Internal Server Error",
      errorMessage,
      statusCode,
      { requestId }
    );
  }
}
