/**
 * MCP Transport Route Handler
 * 
 * Main entry point for the MCP server.
 * Uses mcp-handler with Streamable HTTP transport (SSE disabled for serverless).
 * 
 * Endpoint: /api/mcp
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
    disableSse: true,
  }
);

export { handler as GET, handler as POST, handler as DELETE };
