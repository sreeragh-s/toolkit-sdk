export interface ToolkitErrorOptions {
  code: string;
  status?: number;
  details?: unknown;
  requestId?: string;
  retryAfter?: number;
  cause?: unknown;
}

export class ToolkitError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;
  readonly requestId?: string;
  readonly retryAfter?: number;

  constructor(message: string, options: ToolkitErrorOptions) {
    super(message, { cause: options.cause });
    this.name = "ToolkitError";
    this.code = options.code;
    this.status = options.status ?? 0;
    this.details = options.details;
    this.requestId = options.requestId;
    this.retryAfter = options.retryAfter;
  }
}
