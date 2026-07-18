import "server-only";

import { Toolkit } from "ai-toolkit-sdk";
import { vercelProvider } from "ai-toolkit-sdk/vercel";

let toolkit: Toolkit<ReturnType<typeof vercelProvider>> | undefined;

export function getToolkit() {
  const apiKey = process.env.TOOLKIT_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("TOOLKIT_API_KEY is not configured.");
  }

  toolkit ??= new Toolkit({
    apiKey,
    baseUrl: process.env.TOOLKIT_BASE_URL,
    provider: vercelProvider(),
  });

  return toolkit;
}

export function getToolkitUserId() {
  return process.env.TOOLKIT_USER_ID?.trim() || "toolkit-chat-example";
}

export function getToolkitWriteTools(connectorId?: string) {
  const tools = (process.env.TOOLKIT_WRITE_TOOLS ?? "")
    .split(",")
    .map((toolId) => toolId.trim())
    .filter(Boolean);

  return connectorId
    ? tools.filter((toolId) => toolId.startsWith(`${connectorId}.`))
    : tools;
}

export function getToolkitRedirectUrl() {
  return (
    process.env.TOOLKIT_REDIRECT_URL?.trim() ||
    "https://toolkit.notelab.io/settings/integrations"
  );
}
