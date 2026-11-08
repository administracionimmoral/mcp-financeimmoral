/**
 * Declarative tool specs
 *
 * Newer modules are described as data (name, description, input shape and
 * how to build the upstream request) instead of one handler function plus
 * one hand-written registration block per tool. `registerSpecs` turns the
 * specs into MCP tools, applying the same per-user filtering as the rest.
 */

import type { McpServer, ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { executeTool } from '@/src/tools/executor';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
type QueryValue = string | number | boolean | undefined;
type Args<S extends z.ZodRawShape> = { [K in keyof S]: z.infer<S[K]> };

export interface ToolSpec<S extends z.ZodRawShape = z.ZodRawShape> {
  name: string;
  description: string;
  shape: S;
  method?: HttpMethod;
  /** Upstream path (relative to FINANCE_API_BASE_URL/api). Use `seg()` for path params. */
  path: (args: Args<S>) => string;
  query?: (args: Args<S>) => Record<string, QueryValue>;
  body?: (args: Args<S>) => unknown;
}

/** Type-erased spec so specs with different shapes can share one array. */
export type AnyToolSpec = ToolSpec<z.ZodRawShape>;

/** Keeps the shape's inference while defining a spec, then erases it. */
export function defineTool<S extends z.ZodRawShape>(spec: ToolSpec<S>): AnyToolSpec {
  return spec as unknown as AnyToolSpec;
}

/** Encode a single path segment. */
export function seg(value: string | number): string {
  return encodeURIComponent(String(value));
}

/** Returns a copy of `args` without the given keys (e.g. path params). */
export function omit<T extends Record<string, unknown>, K extends keyof T>(args: T, ...keys: K[]): Omit<T, K> {
  const copy: Record<string, unknown> = { ...args };
  for (const k of keys) delete copy[k as string];
  return copy as Omit<T, K>;
}

// --- Shared shapes ---
export const yearArg = z.number().int().min(2000).max(2100).describe('4-digit year (e.g., 2026)');
export const monthArg = z.number().int().min(1).max(12).describe('Month number (1-12)');
export const uuidArg = z.string().uuid();
/** Free-form JSON object passed through to the upstream API as-is. */
export const jsonObject = z.record(z.string(), z.unknown());

export function registerSpecs(
  server: McpServer,
  specs: readonly AnyToolSpec[],
  shouldRegister: (name: string) => boolean,
): void {
  for (const spec of specs) {
    if (!shouldRegister(spec.name)) continue;
    const cb = (async (args: Record<string, unknown>) => {
      const result = await executeTool({
        tool: spec.name,
        params: args,
        path: spec.path(args as never),
        method: spec.method ?? 'GET',
        queryParams: spec.query?.(args as never),
        body: spec.body?.(args as never),
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }) as unknown as ToolCallback<z.ZodRawShape>;
    server.tool(spec.name, spec.description, spec.shape, cb);
  }
}
