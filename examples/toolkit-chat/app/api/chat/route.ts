import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";

import {
  getToolkit,
  getToolkitUserId,
  getToolkitWriteTools,
} from "@/lib/toolkit";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { messages?: UIMessage[] };
    if (!Array.isArray(body.messages)) {
      return Response.json({ error: "messages must be an array." }, { status: 400 });
    }

    const tools = await getToolkit().tools.get(getToolkitUserId(), {
      read: "all",
      write: getToolkitWriteTools(),
    });

    const result = streamText({
      model: openai(process.env.OPENAI_MODEL?.trim() || "gpt-5-mini"),
      system:
        "You are a concise assistant with access to the user's connected services. " +
        "Use Toolkit tools when they can answer the request. Never claim a tool action succeeded unless its result confirms it.",
      messages: await convertToModelMessages(body.messages),
      tools,
      stopWhen: stepCountIs(6),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat request failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
