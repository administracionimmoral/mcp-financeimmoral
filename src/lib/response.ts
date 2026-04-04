/**
 * Response builder utilities
 * Ensures consistent response format across all tools
 */

import type { ToolSuccessResponse, ToolErrorResponse } from '@/src/types';
import { McpToolError, internalError } from '@/src/lib/errors';

/**
 * Build a standardized success response
 */
export function buildSuccess<T>(params: {
  tool: string;
  source: string;
  params: Record<string, unknown>;
  data: T;
  durationMs: number;
}): ToolSuccessResponse<T> {
  return {
    ok: true,
    tool: params.tool,
    source: params.source,
    params: params.params,
    data: params.data,
    meta: {
      timestamp: new Date().toISOString(),
      apiVersion: 'v1',
      durationMs: params.durationMs,
    },
  };
}

/**
 * Build a standardized error response
 */
export function buildError(tool: string, error: McpToolError): ToolErrorResponse {
  return {
    ok: false,
    tool,
    error: {
      code: error.code,
      message: error.message,
      type: error.type,
      retryable: error.retryable,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Build error response from unknown error
 */
export function buildErrorFromUnknown(tool: string, err: unknown): ToolErrorResponse {
  if (err instanceof McpToolError) {
    return buildError(tool, err);
  }

  const fallback = internalError(
    err instanceof Error ? err.message : 'An unexpected error occurred'
  );
  return buildError(tool, fallback);
}
