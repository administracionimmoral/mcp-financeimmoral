/**
 * JWT Token Validation using Auth0 JWKS
 * 
 * Validates Bearer tokens from the Authorization header.
 * Falls back to /userinfo if email is not in the JWT claims.
 */

import { createRemoteJWKSet, jwtVerify, type JWTPayload, decodeJwt } from 'jose';
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
 * Fetch user email from Auth0 /userinfo endpoint.
 * Used when the access token doesn't contain the email claim.
 */
async function fetchUserEmail(token: string): Promise<string | null> {
  try {
    const res = await fetch(`https://${config.auth0Domain}/userinfo`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      console.error(`[Auth] /userinfo returned ${res.status}`);
      return null;
    }
    const info = await res.json();
    return (info.email as string) || null;
  } catch (err) {
    console.error('[Auth] Failed to fetch /userinfo:', err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Validate a request's Authorization header and extract user info.
 * Returns the authenticated user or null if not authenticated.
 */
export async function validateToken(req: Request): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[Auth] No Bearer token in request');
    return null;
  }

  const token = authHeader.slice(7);

  // Check if it looks like a JWT (has 3 dot-separated parts)
  const isJwt = token.split('.').length === 3;

  if (!isJwt) {
    // Opaque token — try /userinfo directly
    console.log('[Auth] Opaque token detected, using /userinfo');
    const email = await fetchUserEmail(token);
    if (!email) return null;
    return { sub: 'opaque', email: email.toLowerCase(), claims: {} };
  }

  try {
    // Try full JWT verification (signature + issuer + audience)
    const { payload } = await jwtVerify(token, getJwks(), {
      issuer: `https://${config.auth0Domain}/`,
      audience: config.auth0Audience,
      algorithms: ['RS256'],
    });

    // Try to extract email from multiple possible locations
    let email = (
      payload.email ||
      payload['https://immoral.es/email'] ||
      ''
    ) as string;

    // If no email in JWT, fetch from /userinfo
    if (!email) {
      console.log('[Auth] No email in JWT claims, fetching from /userinfo');
      email = (await fetchUserEmail(token)) || '';
    }

    if (!email) {
      console.error('[Auth] Could not determine user email from token or /userinfo');
      return null;
    }

    return {
      sub: payload.sub || '',
      email: email.toLowerCase(),
      claims: payload,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Auth] JWT verification failed: ${msg}`);

    // If JWT verification fails (e.g. audience mismatch), try decoding without
    // verification to get the sub, then use /userinfo for email
    try {
      const decoded = decodeJwt(token);
      console.log(`[Auth] JWT decoded (unverified): sub=${decoded.sub}, aud=${decoded.aud}, iss=${decoded.iss}`);

      // Fetch email via /userinfo as fallback
      const email = await fetchUserEmail(token);
      if (email) {
        console.log(`[Auth] Got email from /userinfo: ${email}`);
        return {
          sub: (decoded.sub as string) || '',
          email: email.toLowerCase(),
          claims: decoded,
        };
      }
    } catch {
      // Can't even decode — truly invalid token
    }

    return null;
  }
}
