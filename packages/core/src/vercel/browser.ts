export function vercelProvider(): never {
  throw new Error(
    "ai-toolkit-sdk/vercel is server-only because Toolkit project API keys cannot be shipped to browser JavaScript.",
  );
}
