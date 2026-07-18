import assert from "node:assert/strict";
import test from "node:test";

import { ToolkitError } from "../dist/index.js";
import { Transport } from "../dist/transport.js";

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json", ...init.headers },
  });
}

function rejectsWhenAborted(signal) {
  return new Promise((_, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    signal.addEventListener("abort", () => reject(signal.reason), { once: true });
  });
}

test("serializes authenticated JSON requests and omits undefined query values", async () => {
  let captured;
  const transport = new Transport(
    "https://toolkit.example.com/api",
    "project_key",
    async (input, init) => {
      captured = { input: String(input), init };
      return json({ ok: true });
    },
    1_000,
  );

  const result = await transport.request("/v1/tools/search", {
    method: "POST",
    query: { cursor: undefined, limit: 20 },
    headers: { "x-client-version": "0.1.0" },
    body: { query: "list repositories" },
  });

  assert.deepEqual(result, { ok: true });
  assert.equal(captured.input, "https://toolkit.example.com/api/v1/tools/search?limit=20");
  assert.equal(captured.init.method, "POST");
  assert.equal(captured.init.headers.accept, "application/json");
  assert.equal(captured.init.headers.authorization, "Bearer project_key");
  assert.equal(captured.init.headers["content-type"], "application/json");
  assert.equal(captured.init.headers["x-client-version"], "0.1.0");
  assert.equal(captured.init.body, JSON.stringify({ query: "list repositories" }));
});

test("returns header-only responses from the detailed request API", async () => {
  const transport = new Transport(
    "https://toolkit.example.com",
    "project_key",
    async () => new Response(null, { status: 304, headers: { etag: '"catalog_1"' } }),
    1_000,
  );

  const response = await transport.requestDetailed("/v1/tools/query");

  assert.equal(response.status, 304);
  assert.equal(response.data, undefined);
  assert.equal(response.headers.get("etag"), '"catalog_1"');
});

test("reports empty successful responses through the convenience API", async () => {
  const transport = new Transport(
    "https://toolkit.example.com",
    "project_key",
    async () => new Response(null, { status: 204, headers: { "x-request-id": "req_empty" } }),
    1_000,
  );

  await assert.rejects(transport.request("/v1/connected-accounts/id"), (error) => {
    assert.ok(error instanceof ToolkitError);
    assert.equal(error.code, "EMPTY_RESPONSE");
    assert.equal(error.status, 204);
    assert.equal(error.requestId, "req_empty");
    return true;
  });
});

test("returns structured API error details and retry timing", async () => {
  const transport = new Transport(
    "https://toolkit.example.com",
    "project_key",
    async () =>
      json(
        {
          error: {
            code: "RATE_LIMITED",
            message: "Slow down",
            details: { limit: 10 },
          },
        },
        {
          status: 429,
          headers: { "retry-after": "3", "x-request-id": "req_123" },
        },
      ),
    1_000,
  );

  await assert.rejects(transport.request("/v1/connectors"), (error) => {
    assert.ok(error instanceof ToolkitError);
    assert.equal(error.message, "Slow down");
    assert.equal(error.code, "RATE_LIMITED");
    assert.equal(error.status, 429);
    assert.deepEqual(error.details, { limit: 10 });
    assert.equal(error.requestId, "req_123");
    assert.equal(error.retryAfter, 3);
    return true;
  });
});

test("parses HTTP-date retry timing", async () => {
  const retryAt = new Date(Date.now() + 2_500).toUTCString();
  const transport = new Transport(
    "https://toolkit.example.com",
    "project_key",
    async () =>
      json(
        { error: { code: "UNAVAILABLE", message: "Try later" } },
        { status: 503, headers: { "retry-after": retryAt } },
      ),
    1_000,
  );

  await assert.rejects(transport.request("/v1/connectors"), (error) => {
    assert.ok(error instanceof ToolkitError);
    assert.ok(error.retryAfter >= 1 && error.retryAfter <= 3);
    return true;
  });
});

test("falls back to a generic API error for non-JSON failures", async () => {
  const transport = new Transport(
    "https://toolkit.example.com",
    "project_key",
    async () => new Response("upstream unavailable", { status: 502 }),
    1_000,
  );

  await assert.rejects(transport.request("/v1/connectors"), (error) => {
    assert.ok(error instanceof ToolkitError);
    assert.equal(error.message, "Toolkit API request failed with status 502.");
    assert.equal(error.code, "API_ERROR");
    assert.equal(error.status, 502);
    return true;
  });
});

test("distinguishes timeout, caller abort, and network failures", async (t) => {
  await t.test("timeout", async () => {
    const transport = new Transport(
      "https://toolkit.example.com",
      "project_key",
      async (_input, init) => rejectsWhenAborted(init.signal),
      5,
    );

    await assert.rejects(transport.request("/v1/connectors"), (error) => {
      assert.ok(error instanceof ToolkitError);
      assert.equal(error.code, "REQUEST_TIMEOUT");
      return true;
    });
  });

  await t.test("caller abort", async () => {
    const controller = new AbortController();
    controller.abort(new Error("cancelled by caller"));
    const transport = new Transport(
      "https://toolkit.example.com",
      "project_key",
      async (_input, init) => rejectsWhenAborted(init.signal),
      1_000,
    );

    await assert.rejects(
      transport.request("/v1/connectors", { signal: controller.signal }),
      (error) => {
        assert.ok(error instanceof ToolkitError);
        assert.equal(error.code, "REQUEST_ABORTED");
        return true;
      },
    );
  });

  await t.test("network failure", async () => {
    const cause = new Error("connection refused");
    const transport = new Transport(
      "https://toolkit.example.com",
      "project_key",
      async () => {
        throw cause;
      },
      1_000,
    );

    await assert.rejects(transport.request("/v1/connectors"), (error) => {
      assert.ok(error instanceof ToolkitError);
      assert.equal(error.code, "NETWORK_ERROR");
      assert.equal(error.cause, cause);
      return true;
    });
  });
});

test("requires a fetch implementation from the caller or runtime", () => {
  const runtimeFetch = globalThis.fetch;
  try {
    globalThis.fetch = undefined;
    assert.throws(
      () => new Transport("https://toolkit.example.com", "project_key", undefined, 1_000),
      (error) => {
        assert.ok(error instanceof ToolkitError);
        assert.equal(error.code, "FETCH_UNAVAILABLE");
        return true;
      },
    );
  } finally {
    globalThis.fetch = runtimeFetch;
  }
});
