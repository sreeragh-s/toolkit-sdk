# `@notelab/toolkit`

Framework-neutral TypeScript client for the NoteLab Toolkit API. Use it only
in trusted server runtimes because construction requires a project API key.

```ts
import { Toolkit } from "@notelab/toolkit";

const toolkit = new Toolkit({
  apiKey: process.env.TOOLKIT_API_KEY!,
});

const connectors = await toolkit.connectors.list();
const accounts = await toolkit.connectedAccounts.list("user_123");
const tools = await toolkit.tools.get("user_123", {
  read: "all",
  write: [],
});
```

The client defaults to `https://toolkit.notelab.io/api/toolkit`. Pass a full
HTTP or HTTPS `baseUrl` for another deployment. An injected `fetch`, request
timeout, and abort signals are supported for server runtime integration.

The `@notelab/toolkit/protocol` subpath exposes types generated from the public
OpenAPI contract. It does not expose backend implementation details.
