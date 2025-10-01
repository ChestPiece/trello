import {
  streamText,
  convertToModelMessages,
  UIMessage,
  stepCountIs,
  smoothStream,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest } from "next/server";
import { systemPrompt } from "@/components/Prompts/system-prompt";
import { saveMessages } from "@/lib/message-persistence";

// Import all tools from centralized location
import { trelloTools } from "@/TrelloTools";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Environment checks - don't throw immediately, handle gracefully in the route handler
const checkRequiredEnvVars = () => {
  const missingVars = [];

  if (!process.env.OPENAI_API_KEY) {
    missingVars.push("OPENAI_API_KEY");
  }

  if (!process.env.TRELLO_API_KEY || !process.env.TRELLO_API_TOKEN) {
    missingVars.push("TRELLO_API_KEY and/or TRELLO_API_TOKEN");
  }

  return missingVars;
};

export async function POST(req: NextRequest) {
  // Check for missing environment variables first
  const missingEnvVars = checkRequiredEnvVars();
  if (missingEnvVars.length > 0) {
    console.error(
      `Missing required environment variables: ${missingEnvVars.join(", ")}`
    );
    return new Response(
      JSON.stringify({
        error: `Configuration error: Missing ${missingEnvVars.join(
          ", "
        )}. Please check your environment configuration.`,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const { messages, chatId }: { messages: UIMessage[]; chatId?: string } =
      await req.json();

    // Validate messages format
    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages format", { status: 400 });
    }

    // Validate that we have at least one message
    if (messages.length === 0) {
      return new Response("No messages provided", { status: 400 });
    }

    // Convert UI messages to model messages
    const modelMessages = convertToModelMessages(messages);

    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: modelMessages,
      system: systemPrompt,
      temperature: 0, // Deterministic for tool calls
      stopWhen: stepCountIs(5), // Allow up to 5 steps for multi-step tool calls
      experimental_transform: smoothStream(), // Add smooth streaming
      tools: trelloTools,
      onFinish: ({ finishReason, usage, toolCalls, toolResults }) => {
        // Log completion for monitoring
        console.log("Chat completion finished:", {
          finishReason,
          usage,
          toolCallsCount: toolCalls?.length || 0,
          toolResultsCount: toolResults?.length || 0,
        });
      },
      onError: ({ error }) => {
        console.error("Stream error:", error);
      },
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onFinish: async ({ messages: finalMessages }) => {
        // Save messages to persistence layer
        if (chatId && finalMessages) {
          try {
            await saveMessages(chatId, finalMessages);
            console.log(`Messages saved for chat ${chatId}`);
          } catch (error) {
            console.error("Failed to save messages:", error);
          }
        }
      },
      onError: (error: unknown) => {
        console.error("Stream error:", error);

        // Provide user-friendly error messages
        if (error instanceof Error) {
          // Check for specific error types
          if (error.message.includes("API key")) {
            return "Authentication error. Please check your API configuration.";
          }
          if (error.message.includes("rate limit")) {
            return "Rate limit exceeded. Please try again in a moment.";
          }
          if (error.message.includes("Trello")) {
            return "Trello service error. Please check your Trello configuration.";
          }
          return `An error occurred: ${error.message}`;
        }
        return "An unexpected error occurred while processing your request.";
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);

    // Return appropriate error response with detailed information
    let errorMessage = "Internal Server Error";
    let errorDetails = null;
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      // Special case handling for common errors
      if (errorMessage.includes("API key")) {
        errorMessage = "Authentication error with the AI provider";
        errorDetails = "Please check your API configuration";
      } else if (errorMessage.includes("rate limit")) {
        errorMessage = "Rate limit exceeded with the AI provider";
        errorDetails = "Please try again in a moment";
        statusCode = 429; // Too Many Requests
      } else if (errorMessage.includes("Trello")) {
        errorMessage = "Error connecting to Trello API";
        errorDetails = "Please check your Trello configuration";
      } else if (
        errorMessage.includes("fetch") ||
        errorMessage.includes("network")
      ) {
        errorMessage = "Network error while connecting to service";
        errorDetails = "Please check your internet connection";
      }
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
      }),
      {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
