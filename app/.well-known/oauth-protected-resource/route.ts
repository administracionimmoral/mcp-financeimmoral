/**
 * OAuth Protected Resource Metadata (RFC 9728)
 * 
 * This endpoint tells Claude (and other MCP clients) that this server
 * requires OAuth authentication and where to find the Authorization Server.
 * 
 * Claude automatically fetches this when connecting to the MCP.
 */

import { config } from '@/src/config/env';

export async function GET() {
  return Response.json({
    resource: config.auth0Audience,
    authorization_servers: [`https://${config.auth0Domain}`],
    scopes_supported: ['openid', 'email', 'profile'],
    bearer_methods_supported: ['header'],
  });
}
