# `@notelab/toolkit-vercel`

Adapter that converts NoteLab Toolkit descriptors into Vercel AI SDK 6 tools.
Install it with `@notelab/toolkit` and `ai`.

```ts
import { Toolkit } from "@notelab/toolkit";
import { vercelProvider } from "@notelab/toolkit-vercel";

const toolkit = new Toolkit({
  apiKey: process.env.TOOLKIT_API_KEY!,
  provider: vercelProvider(),
});

const tools = await toolkit.tools.get("user_123", {
  connectors: ["github"],
  read: "all",
  write: [],
  connectedAccountIds: ["account_123"],
});
```

Intent phrases are appended to tool descriptions for model selection. Tool
titles and progress phrases are attached as `toolMetadata`, not prompt text.

Browser UI code can validate that metadata through the dedicated subpath:

```ts
import { getToolkitToolMetadata } from "@notelab/toolkit-vercel/metadata";

const metadata = getToolkitToolMetadata(part.toolMetadata);

console.log(metadata?.presentation.title);
console.log(metadata?.presentation.progressPhrases);
```

The `/metadata` subpath has no server dependencies. The package root remains
server-only because tool execution uses a secret Toolkit project API key.
