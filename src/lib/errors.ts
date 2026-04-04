/**
 * Custom error classes for structured error handling
 */

import type { ErrorType } from '@/src/types';

export class McpToolError extends Error {
  public readonly code: string;
  public readonly type: ErrorType;
  public readonly retryable: boolean;
  public readonly statusCode?: number;

  constructor(params: {
    code: string;
    message: string;
    type: ErrorType;
    retryable?: boolean;
    statusCode?: number;
  }) {
    super(params.message);
    this.name = 'McpToolError';
    this.code = params.code;
    this.type = params.type;
    this.retryable = params.retryable ?? false;
    this.statusCode = params.statusCode;
  }
}

// --- Validation Errors ---

export function validationError(message: string): McpToolError {
  return new McpToolError({
    code: 'VALIDATION_ERROR',
    message,
    type: 'validation',
    retryable: false,
  });
}

export function invalidUuidError(field: string): McpToolError {
  return new McpToolError({
    code: 'INVALID_UUID',
    message: `"${field}" must be a valid UUID`,
    type: 'validation',
    retryable: false,
  });
}

export function invalidMonthError(): McpToolError {
  return new McpToolError({
    code: 'INVALID_MONTH',
    message: '"month" must be an integer between 1 and 12',
    type: 'validation',
    retryable: false,
  });
}

export function invalidYearError(): McpToolError {
  return new McpToolError({
    code: 'INVALID_YEAR',
    message: '"year" must be a 4-digit integer',
    type: 'validation',
    retryable: false,
  });
}

export function invalidEnumError(field: string, allowed: string[]): McpToolError {
  return new McpToolError({
    code: 'INVALID_ENUM',
    message: `"${field}" must be one of: ${allowed.join(', ')}`,
    type: 'validation',
    retryable: false,
  });
}

export function missingRequiredError(field: string): McpToolError {
  return new McpToolError({
    code: 'MISSING_REQUIRED',
    message: `"${field}" is required`,
    type: 'validation',
    retryable: false,
  });
}

// --- Upstream Errors ---

export function upstreamError(statusCode: number, message?: string): McpToolError {
  const map: Record<number, { code: string; type: ErrorType; retryable: boolean; defaultMsg: string }> = {
    401: { code: 'UPSTREAM_AUTH_ERROR', type: 'auth', retryable: false, defaultMsg: 'Authentication failed with upstream API' },
    403: { code: 'UPSTREAM_FORBIDDEN', type: 'auth', retryable: false, defaultMsg: 'Access denied by upstream API' },
    404: { code: 'UPSTREAM_NOT_FOUND', type: 'not_found', retryable: false, defaultMsg: 'Resource not found in upstream API' },
    429: { code: 'UPSTREAM_RATE_LIMIT', type: 'rate_limit', retryable: true, defaultMsg: 'Rate limit exceeded on upstream API' },
  };

  if (map[statusCode]) {
    const info = map[statusCode];
    return new McpToolError({
      code: info.code,
      message: message || info.defaultMsg,
      type: info.type,
      retryable: info.retryable,
      statusCode,
    });
  }

  if (statusCode >= 500) {
    return new McpToolError({
      code: 'UPSTREAM_SERVER_ERROR',
      message: message || `Upstream API returned status ${statusCode}`,
      type: 'upstream',
      retryable: true,
      statusCode,
    });
  }

  return new McpToolError({
    code: 'UPSTREAM_ERROR',
    message: message || `Upstream API returned status ${statusCode}`,
    type: 'upstream',
    retryable: false,
    statusCode,
  });
}

export function timeoutError(): McpToolError {
  return new McpToolError({
    code: 'UPSTREAM_TIMEOUT',
    message: 'Request to upstream API timed out',
    type: 'timeout',
    retryable: true,
  });
}

export function malformedResponseError(): McpToolError {
  return new McpToolError({
    code: 'MALFORMED_RESPONSE',
    message: 'Upstream API returned a malformed response',
    type: 'upstream',
    retryable: false,
  });
}

export function internalError(message?: string): McpToolError {
  return new McpToolError({
    code: 'INTERNAL_ERROR',
    message: message || 'An internal error occurred',
    type: 'internal',
    retryable: false,
  });
}
