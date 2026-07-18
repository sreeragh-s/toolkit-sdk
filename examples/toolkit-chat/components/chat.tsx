"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart } from "ai";
import {
  Bot,
  Menu,
  MessageSquarePlus,
  Send,
  Square,
  User,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { IntegrationsPanel } from "@/components/integrations-panel";
import { ToolActivity } from "@/components/tool-activity";

const prompts = [
  "Summarize what needs my attention",
  "Find my most recent project updates",
  "List open items assigned to me",
];

export function Chat() {
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, stop, error, setMessages } = useChat({ transport });
  const [input, setInput] = useState("");
  const [integrationsOpen, setIntegrationsOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  function submit(event?: FormEvent, prompt = input) {
    event?.preventDefault();
    const text = prompt.trim();
    if (!text || isBusy) return;
    void sendMessage({ text });
    setInput("");
  }

  return (
    <main className="app-shell">
      <IntegrationsPanel open={integrationsOpen} onClose={() => setIntegrationsOpen(false)} />
      {integrationsOpen ? <button className="mobile-backdrop" type="button" aria-label="Close integrations" onClick={() => setIntegrationsOpen(false)} /> : null}

      <section className="chat-shell">
        <header className="chat-header">
          <button className="icon-button mobile-only" type="button" onClick={() => setIntegrationsOpen(true)} aria-label="Open integrations" title="Open integrations">
            <Menu size={19} />
          </button>
          <div className="brand-mark" aria-hidden="true"><Bot size={19} /></div>
          <div className="brand-copy">
            <h1>Toolkit Chat</h1>
            <p><span className="status-dot" /> Tool-enabled assistant</p>
          </div>
          <button className="icon-button new-chat" type="button" onClick={() => setMessages([])} disabled={messages.length === 0 || isBusy} aria-label="New chat" title="New chat">
            <MessageSquarePlus size={18} />
          </button>
        </header>

        <div className="messages" aria-live="polite">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Bot size={25} /></div>
              <h2>What can I help with?</h2>
              <p>Ask across your connected services.</p>
              <div className="prompt-grid">
                {prompts.map((prompt) => (
                  <button type="button" key={prompt} onClick={() => submit(undefined, prompt)}>{prompt}<Send size={14} /></button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((message) => (
            <article className={`message message-${message.role}`} key={message.id}>
              <div className="message-avatar" aria-hidden="true">
                {message.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className="message-content">
                <span className="message-author">{message.role === "user" ? "You" : "Toolkit"}</span>
                {message.parts.map((part, index) => {
                  if (part.type === "text") return <p className="message-text" key={index}>{part.text}</p>;
                  if (isToolUIPart(part)) return <ToolActivity part={part} key={part.toolCallId} />;
                  return null;
                })}
              </div>
            </article>
          ))}

          {error ? <div className="chat-error">{error.message}</div> : null}
          <div ref={bottomRef} />
        </div>

        <div className="composer-wrap">
          <form className="composer" onSubmit={submit}>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                }
              }}
              placeholder="Ask your connected tools"
              aria-label="Chat message"
              rows={1}
            />
            {isBusy ? (
              <button className="send-button" type="button" onClick={stop} aria-label="Stop response" title="Stop response"><Square size={15} fill="currentColor" /></button>
            ) : (
              <button className="send-button" type="submit" disabled={!input.trim()} aria-label="Send message" title="Send message"><Send size={17} /></button>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
