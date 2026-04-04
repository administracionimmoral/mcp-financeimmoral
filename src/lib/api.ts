/**
 * HTTP client for the Immoral Finance REST API
 * 
 * - Uses native fetch
 * - Authenticates with x-api-key header
 * - Handles timeouts via AbortController
 * - Maps HTTP errors to McpToolError
 * - Never exposes the API key in responses or logs
 */

import { config } from '@/src/config/env';
import { McpToolError, upstreamError, timeoutError, malformedResponseError, internalError } from '@/src/lib/errors';
import { logger } from '@/src/lib/logging';

interface ApiCallOptions {
  /** The API path (e.g., /billing/matrix) — will be appended to FINANCE_API_BASE_URL + /api */
  path: string;
  /** Optional query parameters */
  queryParams?: Record<string, string | number>;
}

/**
 * Call the upstream Finance API
 * @returns Parsed JSON data from the upstream API
 */
export async function callFinanceApi<T = unknown>(options: ApiCallOptions): Promise<T> {
  const { path, queryParams } = options;

  // Build URL
  const baseUrl = config.financeApiBaseUrl.replace(/\/+$/, '');
  const url = new URL(`${baseUrl}/api${path}`);

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      url.searchParams.set(key, String(value));
    }
  }

  // Setup timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);

  const startTime = Date.now();
  const endpoint = url.pathname + url.search;

  logger.debug('Upstream API call started', { endpoint });

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-api-key': config.financeApiKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    const durationMs = Date.now() - startTime;

    if (!response.ok) {
      logger.warn('Upstream API error', {
        endpoint,
        statusCode: response.status,
        durationMs,
      });

      // Try to extract error message from body
      let errorMessage: string | undefined;
      try {
        const errorBody = await response.json();
        errorMessage = errorBody?.message || errorBody?.error || undefined;
      } catch {
        // Body not parseable, use default messages
      }

      throw upstreamError(response.status, errorMessage);
    }

    // Detect HTML responses (Vercel SPA fallback or misconfigured routes)
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      logger.error('Upstream returned HTML instead of JSON — check vercel.json rewrites in the main app', {
        endpoint,
        contentType,
        durationMs,
      });
      throw new McpToolError({
        code: 'UPSTREAM_HTML_RESPONSE',
        message: `Upstream API returned HTML instead of JSON for ${endpoint}. This usually means the Vercel SPA fallback is intercepting API routes. Check the vercel.json rewrites in the main Finance app.`,
        type: 'upstream',
        retryable: false,
        statusCode: response.status,
      });
    }

    // Parse response body
    let data: T;
    try {
      data = await response.json() as T;
    } catch {
      logger.error('Malformed response from upstream', { endpoint, durationMs });
      throw malformedResponseError();
    }

    logger.debug('Upstream API call succeeded', { endpoint, durationMs });

    return data;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      const durationMs = Date.now() - startTime;
      logger.error('Upstream API timeout', { endpoint, durationMs, timeoutMs: config.requestTimeoutMs });
      throw timeoutError();
    }

    // Re-throw McpToolError as-is
    if (err && typeof err === 'object' && 'code' in err) {
      throw err;
    }

    logger.error('Upstream API unexpected error', {
      endpoint,
      error: err instanceof Error ? err.message : 'Unknown error',
    });
    throw internalError('Failed to connect to upstream API');
  } finally {
    clearTimeout(timeout);
  }
}
