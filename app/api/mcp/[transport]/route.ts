/**
 * MCP Transport Route Handler
 * 
 * Main entry point for the MCP server.
 * Uses mcp-handler to support both Streamable HTTP and SSE transports.
 * 
 * Endpoint: /api/mcp
 * Supported transports: streamable-http, sse
 */

import { createMcpHandler } from 'mcp-handler';
import { registerTools } from '@/src/tools/register';

const handler = createMcpHandler(
  (server) => {
    registerTools(server);
  },
  {
    capabilities: {
      tools: {},
    },
    serverInfo: {
      name: 'immoral-finance-mcp',
      version: '1.0.0',
    },
  },
  {
    basePath: '/api/mcp',
  }
);

export { handler as GET, handler as POST, handler as DELETE };
