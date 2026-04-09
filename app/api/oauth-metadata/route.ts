/**
 * OAuth Protected Resource Metadata (RFC 9728)
 * 
 * Served via rewrite from /.well-known/oauth-protected-resource → /api/oauth-metadata
 * This endpoint tells Claude where to authenticate (Auth0).
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
