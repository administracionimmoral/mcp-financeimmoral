/**
 * MCP Route Handler — Stateless Streamable HTTP + OAuth 2.1
 * 
 * Uses the official @modelcontextprotocol/sdk with WebStandardStreamableHTTPServerTransport.
 * Validates Auth0 JWT tokens and filters tools based on user permissions.
 * 
 * Endpoint: POST /api/mcp
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { validateToken } from '@/src/auth/validate';
import { getUserPermissions } from '@/src/auth/permissions';
import { registerTools } from '@/src/tools/register';

export async function POST(req: Request) {
  // --- 1. Authenticate ---
  const user = await validateToken(req);

  if (!user) {
    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32001,
          message: 'Unauthorized. A valid Auth0 access token is required.',
        },
        id: null,
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Bearer',
        },
      }
    );
  }

  // --- 2. Authorize ---
  const permissions = getUserPermissions(user.email);

  if (!permissions) {
    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32003,
          message: `Access denied. User ${user.email} is not authorized to use this MCP server.`,
        },
        id: null,
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // --- 3. Create MCP server with filtered tools ---
  const server = new McpServer({
    name: 'immoral-finance-mcp',
    version: '1.0.0',
  });

  // Register only the tools this user is allowed to see
  registerTools(server, {
    allowedTools: permissions.allowedTools === '*' ? undefined : [...permissions.allowedTools],
    dept: permissions.dept,
    userContext: permissions.context,
    userName: permissions.name,
  });

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
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
