import { streamText, convertToCoreMessages, UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest } from "next/server";
import { systemPrompt } from "@/components/Prompts/system-prompt";
import { trelloTools } from "@/lib/tool-registry";
import { trelloService } from "@/lib/trello-service";
import { rateLimiter } from "@/lib/rate-limiter";
import { monitoringService } from "@/lib/monitoring-service";
import {
  createErrorResponse,
  createRateLimitResponse,
  createSuccessResponse,
  getClientIP,
  addRateLimitHeaders,
} from "@/lib/api-helpers";
import { TrelloOperation } from "@/lib/types/trello";

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

    // Parse request body
    const body = await req.json();
    const { messages, operation, params, mode = "chat" } = body;

    // Handle different modes
    if (mode === "api" && operation) {
      // Direct API mode - handle Trello operations directly
      return await handleDirectApiMode(
        operation,
        params,
        requestId,
        rateLimitResult
      );
    } else if (mode === "chat" && messages) {
      // AI Chat mode - handle conversational interface
      return await handleChatMode(messages, requestId, rateLimitResult);
    } else {
      // Invalid request format
      monitoringService.endRequest(requestId, 400, "Invalid request format");
      return createErrorResponse(
        "Invalid request format",
        'Specify either "chat" mode with messages or "api" mode with operation',
        400,
        { requestId }
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    monitoringService.endRequest(requestId, 500, errorMessage);

    console.error("🚀 ~ POST ~ error:", error);
    return createErrorResponse(
      "Internal Server Error",
      "An unexpected error occurred while processing the request",
      500,
      { requestId }
    );
  }
}

/**
 * Handle direct API mode for Trello operations
 */
async function handleDirectApiMode(
  operation: string,
  params: Record<string, any> = {},
  requestId: string,
  rateLimitResult: any
) {
  // Validate operation
  const validOperations: TrelloOperation[] = [
    "listBoards",
    "getBoard",
    "createBoard",
    "updateBoard",
    "deleteBoard",
    "listLists",
    "getList",
    "createList",
    "updateList",
    "deleteList",
    "archiveList",
    "unarchiveList",
    "listCards",
    "getCard",
    "createCard",
    "updateCard",
    "deleteCard",
    "listLabels",
    "getLabel",
    "createLabel",
    "updateLabel",
    "deleteLabel",
    "addLabelToCard",
    "removeLabelFromCard",
    "listAttachments",
    "getAttachment",
    "createAttachment",
    "deleteAttachment",
    "listChecklists",
    "getChecklist",
    "createChecklist",
    "updateChecklist",
    "deleteChecklist",
    "createChecklistItem",
    "updateChecklistItem",
    "deleteChecklistItem",
    "listMembers",
    "getMember",
    "addMemberToBoard",
    "removeMemberFromBoard",
    "listWorkspaces",
    "getWorkspace",
    "createWorkspace",
    "updateWorkspace",
    "deleteWorkspace",
  ];

  if (!validOperations.includes(operation as TrelloOperation)) {
    monitoringService.endRequest(
      requestId,
      400,
      `Invalid operation: ${operation}`
    );
    return createErrorResponse(
      `Invalid operation: ${operation}`,
      `Supported operations: ${validOperations.join(", ")}`,
      400,
      { requestId }
    );
  }

  // Check if Trello service is configured
  if (!trelloService.isConfigured()) {
    monitoringService.endRequest(
      requestId,
      500,
      "Trello API credentials not configured"
    );
    return createErrorResponse(
      "Trello API credentials not configured",
      "Please configure TRELLO_API_KEY and TRELLO_API_TOKEN environment variables",
      500,
      { requestId }
    );
  }

  // Execute the operation
  const result = await trelloService.executeToolOperation(
    operation as TrelloOperation,
    params,
    requestId
  );

  // Return appropriate response
  const status = result.success ? 200 : 500;
  const response = createSuccessResponse(result.data, result.message, {
    requestId,
  });

  monitoringService.endRequest(
    requestId,
    status,
    result.success ? undefined : result.error
  );

  return addRateLimitHeaders(
    response,
    rateLimitResult.limit,
    rateLimitResult.remaining,
    rateLimitResult.resetTime
  );
}

/**
 * Handle AI chat mode with streaming
 */
async function handleChatMode(
  messages: UIMessage[],
  requestId: string,
  rateLimitResult: any
) {
  // Stream the response using streamText with Trello tools integration
  const result = streamText({
    model: openai("gpt-4o"),
    messages: convertToCoreMessages(messages),
    system: systemPrompt,
    tools: trelloTools,
    maxSteps: 10, // Allow more complex multi-step operations
    temperature: 0, // Ensure deterministic tool calls
    onError: ({ error }) => {
      console.error("Stream error:", error);
    },
    onFinish: ({ text, toolCalls, toolResults, usage }) => {
      console.log("Stream finished:", {
        textLength: text.length,
        toolCallsCount: toolCalls.length,
        toolResultsCount: toolResults.length,
        usage,
      });

      // Log tool calls for monitoring
      if (toolCalls.length > 0) {
        toolCalls.forEach((toolCall) => {
          monitoringService.logToolExecution(
            requestId,
            toolCall.toolName,
            0, // Duration not available in onFinish
            true
          );
        });
      }
    },
    // Enhanced tool call repair for better reliability
    experimental_repairToolCall: async ({ toolCall, error, tools }) => {
      console.error("Tool call error:", {
        toolName: toolCall.toolName,
        error: error.message,
        args: toolCall.args,
      });

      try {
        // Get the tool definition
        const tool = tools[toolCall.toolName as keyof typeof tools];
        if (!tool) {
          console.error(`Tool ${toolCall.toolName} not found in tools object`);
          return null;
        }

        // For schema validation errors, try to repair the input
        if (
          error.message.includes("schema") ||
          error.message.includes("validation")
        ) {
          console.log(
            `Attempting to repair tool call for ${toolCall.toolName}`
          );

          // Create a repair prompt
          const repairPrompt = `The AI tried to call the tool "${
            toolCall.toolName
          }" with these arguments:
${JSON.stringify(toolCall.args, null, 2)}

But it failed with this error:
${error.message}

Please provide corrected arguments that match the tool's schema. Return only valid JSON.`;

          // Use streamText for repair instead of generateText
          const repairResponse = await streamText({
            model: openai("gpt-4o"),
            prompt: repairPrompt,
            temperature: 0,
          });

          try {
            const text = await repairResponse.text;
            const repairedArgs = JSON.parse(text);
            console.log(
              `Repaired arguments for ${toolCall.toolName}:`,
              repairedArgs
            );

            return {
              ...toolCall,
              args: repairedArgs,
            };
          } catch (parseError) {
            console.error("Failed to parse repaired arguments:", parseError);
            return null;
          }
        }

        // For other errors, try to provide a more helpful error message
        if (
          error.message.includes("API") ||
          error.message.includes("network")
        ) {
          return {
            ...toolCall,
            args: {
              _error: `API Error: ${error.message}. Please check your Trello API credentials and try again.`,
            },
          };
        }

        // For unknown errors, return null to let the system handle it
        return null;
      } catch (repairError) {
        console.error("Error during tool call repair:", repairError);
        return null;
      }
    },
  });

  // End monitoring for successful chat request
  monitoringService.endRequest(requestId, 200);

  // Return the streaming response with rate limit headers
  const response = result.toDataStreamResponse();
  const nextResponse = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
  
  return addRateLimitHeaders(
    nextResponse,
    rateLimitResult.limit,
    rateLimitResult.remaining,
    rateLimitResult.resetTime
  );
}

