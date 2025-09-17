import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest } from "next/server";
import { systemPrompt } from "@/components/system-prompt";

// You'll need to set OPENAI_API_KEY in your environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

// Vector store ID
const VECTOR_STORE_ID = process.env.VECTOR_STORE_ID || "";

export async function POST(req: NextRequest) {
  // Extract the `messages` from the body of the request
  try {
    const { messages } = await req.json();

    // Stream the response using streamText with vector store integration
    const result = streamText({
      model: openai.responses("gpt-4o"),
      messages,
      system: systemPrompt,
      providerOptions: {
        openai: {
          vectorStore: VECTOR_STORE_ID,
          // Configure vector search parameters
          vectorStoreOptions: {
            similarityThreshold: 0.7,
            maxResults: 5,
          },
        },
      },
    });

    // Return the streaming response
    return result.toDataStreamResponse();
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
