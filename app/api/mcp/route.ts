/**
 * MCP Route Handler — Stateless Streamable HTTP
 * 
 * Uses the official @modelcontextprotocol/sdk with WebStandardStreamableHTTPServerTransport.
 * Fully stateless, no Redis, returns JSON responses (not SSE streams).
 * 
 * Endpoint: POST /api/mcp
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { registerTools } from '@/src/tools/register';

export async function POST(req: Request) {
  // Create a fresh server + transport per request (stateless)
  const server = new McpServer({
    name: 'immoral-finance-mcp',
    version: '1.0.0',
  });

  registerTools(server);

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless — no session tracking
    enableJsonResponse: true,      // JSON responses, not SSE — critical for serverless
  });

  await server.connect(transport);

  return transport.handleRequest(req);
}

export async function GET() {
  return new Response(
    JSON.stringify({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed. Use POST for MCP requests.' },
      id: null,
    }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
}

export async function DELETE() {
  return new Response(null, { status: 204 });
}
