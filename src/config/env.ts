/**
 * Environment configuration with validation
 * All env vars are validated at startup
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

export const config = {
  /** Base URL of the Immoral Finance API (no trailing slash) */
  financeApiBaseUrl: requireEnv('FINANCE_API_BASE_URL'),

  /** API key for authenticating with the Finance API */
  financeApiKey: requireEnv('FINANCE_API_KEY'),

  /** Current environment */
  nodeEnv: optionalEnv('NODE_ENV', 'development'),

  /** Request timeout in milliseconds for upstream API calls */
  requestTimeoutMs: parseInt(optionalEnv('REQUEST_TIMEOUT_MS', '15000'), 10),

  /** Log level */
  logLevel: optionalEnv('LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error',

  // --- Auth0 OAuth 2.1 ---

  /** Auth0 tenant domain (e.g., dev-xxx.us.auth0.com) */
  auth0Domain: requireEnv('AUTH0_DOMAIN'),

  /** Auth0 API audience/identifier */
  auth0Audience: requireEnv('AUTH0_AUDIENCE'),
} as const;

export type Config = typeof config;
