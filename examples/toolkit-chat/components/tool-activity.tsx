"use client";

import { Check, CircleAlert, LoaderCircle, Wrench } from "lucide-react";
import {
  getToolName,
  type DynamicToolUIPart,
  type ToolUIPart,
} from "ai";
import { getToolkitToolMetadata } from "ai-toolkit-sdk/vercel/metadata";

export function ToolActivity({ part }: { part: DynamicToolUIPart | ToolUIPart }) {
  const metadata = getToolkitToolMetadata(part.toolMetadata);
  const running = part.state === "input-streaming" || part.state === "input-available";
  const failed = part.state === "output-error" || part.state === "output-denied";
  const title = metadata?.presentation.title || part.title || getToolName(part).replaceAll("_", " ");
  const status = running
    ? metadata?.presentation.progressPhrases[0] || "Running tool"
    : failed
      ? part.state === "output-error"
        ? part.errorText
        : "Action denied"
      : "Completed";

  return (
    <div className={`tool-activity ${failed ? "tool-activity-error" : ""}`}>
      <span className="tool-status-icon" aria-hidden="true">
        {running ? <LoaderCircle className="spin" size={16} /> : failed ? <CircleAlert size={16} /> : <Check size={16} />}
      </span>
      <div>
        <div className="tool-title"><Wrench size={13} /> {title}</div>
        <p>{status}</p>
      </div>
    </div>
  );
}
