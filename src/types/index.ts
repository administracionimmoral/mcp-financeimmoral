/**
 * Shared types for the Immoral Finance MCP Server
 */

/** Standard successful response */
export interface ToolSuccessResponse<T = unknown> {
  ok: true;
  tool: string;
  source: string;
  params: Record<string, unknown>;
  data: T;
  meta: {
    timestamp: string;
    apiVersion: 'v1';
    durationMs: number;
  };
}

/** Standard error response */
export interface ToolErrorResponse {
  ok: false;
  tool: string;
  error: {
    code: string;
    message: string;
    type: ErrorType;
    retryable: boolean;
  };
  meta: {
    timestamp: string;
  };
}

export type ErrorType =
  | 'validation'
  | 'upstream'
  | 'auth'
  | 'timeout'
  | 'not_found'
  | 'rate_limit'
  | 'internal';

export type ToolResponse<T = unknown> = ToolSuccessResponse<T> | ToolErrorResponse;

/** Allowed HTTP methods for the upstream API */
export type HttpMethod = 'GET';

/** Tool endpoint mapping definition */
export interface ToolEndpoint {
  method: HttpMethod;
  path: string;
  queryParams?: Record<string, string | number>;
}
