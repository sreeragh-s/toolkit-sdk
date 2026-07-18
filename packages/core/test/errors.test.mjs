import assert from "node:assert/strict";
import test from "node:test";

import { ToolkitError } from "../dist/index.js";

test("preserves structured error context", () => {
  const cause = new Error("socket closed");
  const error = new ToolkitError("Toolkit request failed", {
    cause,
    code: "NETWORK_ERROR",
    details: { host: "toolkit.example.com" },
    requestId: "req_123",
    retryAfter: 3,
    status: 503,
  });

  assert.equal(error.name, "ToolkitError");
  assert.equal(error.message, "Toolkit request failed");
  assert.equal(error.code, "NETWORK_ERROR");
  assert.equal(error.status, 503);
  assert.deepEqual(error.details, { host: "toolkit.example.com" });
  assert.equal(error.requestId, "req_123");
  assert.equal(error.retryAfter, 3);
  assert.equal(error.cause, cause);
});

test("uses zero when an HTTP status is unavailable", () => {
  const error = new ToolkitError("Invalid configuration", {
    code: "INVALID_CONFIGURATION",
  });

  assert.equal(error.status, 0);
});
