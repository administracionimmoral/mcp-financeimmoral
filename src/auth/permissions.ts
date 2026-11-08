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
//
// The first block is the original read-only set (also exposed to dept
// heads via DEPT_HEAD_TOOLS below). The "Admin-only extras" blocks
// were added later to expose the full Finance API surface — they are
// NOT included in DEPT_HEAD_TOOLS, so only admin users receive them.
//
// Newer modules (impagos/dunning, hub hours, P&L scenarios & forecast,
// cuadro de mando, Holded, PandaDoc, settings, users, year management…)
// are declared in src/tools/*.ts as specs and collected in SPEC_TOOLS
// (src/tools/register.ts). They are admin-only as well.
// ============================================
const ALL_TOOLS = [
  // ---- Core (admin + dept-head allowed) ----
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
  // ---- Admin-only extras: P&L ----
  'get_pl_notes', 'save_pl_note', 'set_pl_note_status', 'save_pl_matrix_cell',
  'list_pl_custom_rows', 'create_pl_custom_row', 'delete_pl_custom_row', 'update_pl_custom_row',
  // ---- Admin-only extras: Periods ----
  'close_period', 'reopen_period', 'get_period_status', 'list_periods',
  // ---- Admin-only extras: Billing ----
  'save_billing_matrix_cell', 'delete_billing_row', 'duplicate_billing_row', 'calculate_billing',
  'get_client_billing_for_period', 'update_billing_record',
  'add_billing_detail', 'update_billing_detail', 'delete_billing_detail',
  'get_billing_client_month_detail', 'get_billing_annual_client_summary',
  'list_billing_hidden_clients', 'hide_billing_client', 'unhide_billing_client',
  // ---- Admin-only extras: Expenses ----
  'prorate_expenses_preview', 'prorate_expenses_execute',
  'create_expense', 'update_expense', 'delete_expense',
  // ---- Admin-only extras: Media ----
  'list_media_platforms', 'get_media_investment',
  'set_media_planned_investment', 'set_media_platform_investment',
  'list_media_hidden_clients', 'unhide_media_client', 'hide_media_client',
  // ---- Admin-only extras: Fees ----
  'get_client_fee_tiers', 'set_client_fee_tiers',
  'get_platform_cost_rules', 'add_platform_cost_rule',
  // ---- Admin-only extras: Clients ----
  'create_client', 'update_client', 'delete_client', 'duplicate_client',
  // ---- Admin-only extras: Payments ----
  'create_payment_beneficiary', 'update_payment_beneficiary', 'delete_payment_beneficiary',
  'list_payments_for_period', 'create_payment', 'update_payment',
  'set_payment_status', 'delete_payment',
  // ---- Admin-only extras: Imsales ----
  'list_imsales_services', 'get_imsales_billing', 'save_imsales_billing',
  'hide_imsales_client', 'unhide_imsales_client', 'list_imsales_hidden_clients',
  // ---- Admin-only extras: Budget Requests ----
  'get_budget_requests_summary', 'get_budget_requests_by_dept', 'list_budget_requests',
  'create_budget_request', 'bulk_create_budget_requests',
  'approve_budget_request', 'reject_budget_request',
  'approve_budget_requests_by_dept', 'reject_budget_requests_by_dept',
  'delete_budget_requests_by_dept', 'delete_budget_request',
  // ---- Admin-only extras: Nutfruit / ICEX ----
  'get_nutfruit', 'save_nutfruit_cell', 'create_nutfruit_row', 'delete_nutfruit_row',
  'get_icex', 'save_icex_cell', 'create_icex_row', 'delete_icex_row',
  // ---- Admin-only extras: Profitability / ClickUp ----
  'get_clickup_status', 'refresh_clickup_cache',
  'list_clickup_spaces', 'list_clickup_lists_for_space',
  'debug_clickup_entries', 'clickup_lists_with_time', 'list_clickup_members',
  'auto_match_profitability_clients',
  'get_profitability_user_mappings', 'get_profitability_auto_mapping',
  'set_profitability_user_mappings',
  'get_profitability_client_lists', 'set_profitability_client_lists',
  'get_profitability_accounts',
  'list_manual_persons', 'create_manual_person', 'update_manual_person', 'delete_manual_person',
  'list_manual_hours', 'upsert_manual_hours', 'delete_manual_hours',
  'list_profitability_hidden_items', 'hide_profitability_item', 'unhide_profitability_item',
  // ---- Admin-only extras: Payment Links ----
  'create_payment_link_from_invoice', 'create_manual_payment_link',
  'list_payment_links', 'get_payment_link',
  'send_payment_link_email', 'cancel_payment_link',
  // ---- Admin-only extras: Events (billing-service) ----
  'record_invoice_issued', 'events_health',
  // ---- Admin-only extras: Partners ----
  'create_partner', 'assign_client_to_partner', 'delete_partner',
  'calculate_partner_commissions', 'create_partner_commission', 'update_partner_commission',
  // ---- Admin-only extras: Platforms ----
  'list_platforms', 'create_platform', 'create_platform_commission',
  'get_platform_commissions', 'update_platform_commission', 'mark_platform_commission_received',
  // ---- Admin-only extras: Payment Requests ----
  'create_payment_request', 'list_payment_requests', 'get_payment_request',
  'update_payment_request', 'delete_payment_request',
  // ---- Admin-only extras: Payroll & Employees ----
  'list_employees_filtered', 'create_employee', 'update_employee_salary', 'update_employee',
  'delete_employee_permanent', 'delete_employee',
  'create_payroll', 'update_payroll', 'set_payroll_splits',
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
  'administracion@immoral.es': {
    name: 'Daniel',
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
