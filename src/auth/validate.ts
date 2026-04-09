/**
 * JWT Token Validation using Auth0 JWKS
 * 
 * Validates Bearer tokens from the Authorization header.
 * Uses jose library for lightweight, Web API compatible JWT verification.
 */

import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { config } from '@/src/config/env';

// Cache the JWKS client — it handles key rotation automatically
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  if (!jwks) {
    const jwksUrl = new URL(`https://${config.auth0Domain}/.well-known/jwks.json`);
    jwks = createRemoteJWKSet(jwksUrl);
  }
  return jwks;
}

export interface AuthenticatedUser {
  /** Auth0 user ID (sub claim) */
  sub: string;
  /** User email */
  email: string;
  /** Raw JWT payload */
  claims: JWTPayload;
}

/**
 * Validate a request's Authorization header and extract user info.
 * Returns the authenticated user or null if not authenticated.
 */
export async function validateToken(req: Request): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7); // Remove 'Bearer '

  try {
    const { payload } = await jwtVerify(token, getJwks(), {
      issuer: `https://${config.auth0Domain}/`,
      audience: config.auth0Audience,
      algorithms: ['RS256'],
    });

    // Extract email from standard claims or Auth0 namespace
    const email = (
      payload.email ||
      payload['https://immoral.es/email'] ||
      ''
    ) as string;

    if (!email) {
      return null;
    }

    return {
      sub: payload.sub || '',
      email: email.toLowerCase(),
      claims: payload,
    };
  } catch (err) {
    // Token invalid, expired, wrong audience, etc.
    console.error('[Auth] Token validation failed:', err instanceof Error ? err.message : 'Unknown error');
    return null;
  }
}
