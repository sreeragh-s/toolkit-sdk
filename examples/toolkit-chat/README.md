# Toolkit Chat

A Next.js chat example using Vercel AI SDK 6 and the local `ai-toolkit-sdk`
package. It is based on Vercel's `next-openai-telemetry` example with all
OpenTelemetry dependencies and runtime instrumentation removed.

## Setup

From this directory:

```sh
cp .env.local.example .env.local
npm install
npm run dev
```

Set these server-only values in `.env.local`:

- `OPENAI_API_KEY`: OpenAI API key used by the chat model.
- `TOOLKIT_API_KEY`: project API key created in the Toolkit dashboard.
- `TOOLKIT_BASE_URL`: Toolkit API deployment. The default is the hosted
  `https://toolkit.notelab.io/api/toolkit` endpoint.
- `TOOLKIT_USER_ID`: stable application user identifier used to isolate
  connected accounts.
- `TOOLKIT_REDIRECT_URL`: an exact OAuth return URL whose origin is allowlisted
  for the Toolkit project. The hosted Toolkit settings page is the default.
- `TOOLKIT_WRITE_TOOLS`: optional comma-separated write tool IDs. The example
  enables read tools by default and no write tools until explicitly configured.

`npm run dev` and `npm run build` first build the SDK package from this
repository. The Toolkit project API key remains on the server and is never
included in client-side code.
