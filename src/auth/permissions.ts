/**
 * User Permission Map
 * 
 * Defines which users can access which tools.
 * This is the single source of truth for authorization.
 * 
 * Admin users: see all 20 tools
 * Dept heads: see only their department's data
 * Unknown users: blocked completely
 */

// ============================================
// All tool names (for reference)
// ============================================
const ALL_TOOLS = [
  'get_billing_matrix',
  'get_billing_records',
  'list_clients',
  'list_client_verticals',
  'get_client_by_id',
  'get_dashboard_kpis',
  'get_expenses_by_month',
  'get_pl_summary',
  'get_pl_matrix',
  'get_cost_per_hour',
  'get_payment_schedule',
  'list_payment_beneficiaries',
  'get_payment_summary',
  'get_payroll_by_month',
  'list_employees',
  'get_employee_by_id',
  'list_partners',
  'get_partner_commissions_by_month',
  'get_partner_commissions_annual',
  'list_users',
] as const;

// ============================================
// Tools available to department heads
// They only see their department's financial data
// ============================================
const DEPT_HEAD_TOOLS = [
  'get_dashboard_kpis',        // KPIs — Claude will filter by dept from context
  'list_clients',              // Clients — Claude will show only dept's clients
  'list_client_verticals',     // Verticals
  'get_client_by_id',          // Client detail
  'get_billing_matrix',        // Billing — Claude will filter by dept
  'get_billing_records',       // Billing records
  'get_expenses_by_month',     // Expenses — dept view
  'get_pl_summary',            // P&L summary
  'get_pl_matrix',             // P&L matrix
  'get_cost_per_hour',         // Cost per hour — HARD RESTRICTED to their dept
] as const;

// ============================================
// User permission definitions
// ============================================
export type DeptRestriction = 'immedia' | 'imcontent' | 'immoralia';

export interface UserPermission {
  /** Display name */
  name: string;
  /** Role type */
  role: 'admin' | 'head';
  /** Department restriction (only for heads) */
  dept?: DeptRestriction;
  /** List of allowed tool names, or '*' for all */
  allowedTools: readonly string[] | '*';
  /** Additional context for Claude about this user's access */
  context: string;
}

/**
 * Permission map: email → permissions
 * Only users listed here can use the MCP.
 */
export const USER_PERMISSIONS: Record<string, UserPermission> = {
  // ---- Admins: full access ----
  'admin@immoral.com': {
    name: 'Admin',
    role: 'admin',
    allowedTools: '*',
    context: 'Full admin access to all financial data.',
  },
  'yurema@immoral.es': {
    name: 'Yurema',
    role: 'admin',
    allowedTools: '*',
    context: 'Full admin access to all financial data.',
  },
  'marco@immoral.es': {
    name: 'Marco',
    role: 'admin',
    allowedTools: '*',
    context: 'Full admin access to all financial data.',
  },

  // ---- Department Heads: restricted to their dept ----
  'alba@immoral.es': {
    name: 'Alba',
    role: 'head',
    dept: 'immedia',
    allowedTools: DEPT_HEAD_TOOLS,
    context: 'Head of Immedia department. ONLY show data related to Immedia department and Media Investment. Do NOT show data from other departments (imcontent, immoralia). When using get_cost_per_hour, ALWAYS use dept="immedia". Filter all results to show only Immedia-related data.',
  },
  'florencia@immoral.es': {
    name: 'Florencia',
    role: 'head',
    dept: 'imcontent',
    allowedTools: DEPT_HEAD_TOOLS,
    context: 'Head of Imcontent department. ONLY show data related to Imcontent department. Do NOT show data from other departments (immedia, immoralia). When using get_cost_per_hour, ALWAYS use dept="imcontent". Filter all results to show only Imcontent-related data.',
  },
  'manel@immoral.es': {
    name: 'Manel',
    role: 'head',
    dept: 'immoralia',
    allowedTools: DEPT_HEAD_TOOLS,
    context: 'Head of Immoralia department. ONLY show data related to Immoralia department. Do NOT show data from other departments (immedia, imcontent). When using get_cost_per_hour, ALWAYS use dept="immoralia". Filter all results to show only Immoralia-related data.',
  },
  'david@immoral.es': {
    name: 'David',
    role: 'head',
    dept: 'immoralia',
    allowedTools: DEPT_HEAD_TOOLS,
    context: 'Head of Immoralia department. ONLY show data related to Immoralia department. Do NOT show data from other departments (immedia, imcontent). When using get_cost_per_hour, ALWAYS use dept="immoralia". Filter all results to show only Immoralia-related data.',
  },
};

/**
 * Get user permissions by email.
 * Returns null if user is not authorized.
 */
export function getUserPermissions(email: string): UserPermission | null {
  return USER_PERMISSIONS[email.toLowerCase()] || null;
}

/**
 * Check if a specific tool is allowed for a user.
 */
export function isToolAllowed(email: string, toolName: string): boolean {
  const perms = getUserPermissions(email);
  if (!perms) return false;
  if (perms.allowedTools === '*') return true;
  return perms.allowedTools.includes(toolName);
}

/**
 * Get the list of allowed tool names for a user.
 * Returns null if user is not authorized.
 * Returns undefined if all tools are allowed (admin).
 */
export function getAllowedToolNames(email: string): string[] | '*' | null {
  const perms = getUserPermissions(email);
  if (!perms) return null;
  return perms.allowedTools === '*' ? '*' : [...perms.allowedTools];
}
