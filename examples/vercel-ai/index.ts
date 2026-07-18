import { Toolkit } from "@notelab/toolkit";
import { vercelProvider } from "@notelab/toolkit-vercel";
import { getToolkitToolMetadata } from "@notelab/toolkit-vercel/metadata";
import { streamText, type LanguageModel } from "ai";

const toolkit = new Toolkit({
  apiKey: process.env.TOOLKIT_API_KEY!,
  baseUrl: process.env.TOOLKIT_BASE_URL,
  provider: vercelProvider(),
});

export function authorizeGmail(userId: string, redirectUrl: string) {
  return toolkit.connectors.authorize(userId, "gmail", {
    redirectUrl,
    read: "all",
    write: [],
  });
}

export const tools = await toolkit.tools.get("user_123", {
  connectors: ["gmail", "github"],
  read: "all",
  write: [],
});

export function answer(model: LanguageModel, prompt: string) {
  return streamText({ model, prompt, tools }).toUIMessageStreamResponse();
}

export function getToolStatus(part: { toolMetadata?: unknown }) {
  const metadata = getToolkitToolMetadata(part.toolMetadata);

  return metadata
    ? {
        progressPhrases: metadata.presentation.progressPhrases,
        title: metadata.presentation.title,
        toolId: metadata.toolId,
      }
    : undefined;
}
