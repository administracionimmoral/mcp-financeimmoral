/**
 * Tool executor — handles validation, API call, response building, and logging
 * Central orchestration point for all tool invocations
 */

import { callFinanceApi } from '@/src/lib/api';
import { buildSuccess, buildErrorFromUnknown } from '@/src/lib/response';
import { logger } from '@/src/lib/logging';
import type { ToolResponse } from '@/src/types';

interface ExecuteToolOptions {
  /** Tool name */
  tool: string;
  /** Validated params */
  params: Record<string, unknown>;
  /** REST endpoint path (with interpolated values) */
  path: string;
  /** Optional query parameters */
  queryParams?: Record<string, string | number>;
}

/**
 * Execute a tool: call the upstream API, build the response
 */
export async function executeTool(options: ExecuteToolOptions): Promise<ToolResponse> {
  const { tool, params, path, queryParams } = options;

  const source = queryParams
    ? `${path}?${new URLSearchParams(Object.entries(queryParams).map(([k, v]) => [k, String(v)])).toString()}`
    : path;

  logger.toolInvocation(tool, params, source);

  const startTime = Date.now();

  try {
    const data = await callFinanceApi({
      path,
      queryParams,
    });

    const durationMs = Date.now() - startTime;

    logger.toolResult(tool, durationMs, true);

    return buildSuccess({
      tool,
      source,
      params,
      data,
      durationMs,
    });
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';

    logger.toolResult(tool, durationMs, false, errorMessage);

    return buildErrorFromUnknown(tool, err);
  }
}
