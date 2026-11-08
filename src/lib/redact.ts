/**
 * Removes credential fields from upstream data before it reaches the model.
 *
 * Some Finance endpoints return secrets to API-key callers (e.g. GET
 * /admin/users includes `raw_password`). Nothing the MCP returns should
 * ever contain a credential, so these keys are dropped at any depth.
 */

const SECRET_KEYS = new Set([
  'raw_password',
  'password',
  'password_hash',
  'key_hash',
  'api_key',
  'access_token',
  'refresh_token',
  'secret',
  'client_secret',
]);

export function redactSecrets<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => redactSecrets(v)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SECRET_KEYS.has(k.toLowerCase())) continue;
      out[k] = redactSecrets(v);
    }
    return out as T;
  }
  return value;
}
