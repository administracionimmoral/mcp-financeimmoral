/**
 * Settings, year management, user management, and newer endpoints of
 * clients, profitability and partner commissions.
 * Services: admin, commissions
 *
 * Not exposed on purpose: creating users or changing passwords/emails
 * (would pass credentials through the chat) and PUT
 * /admin/profitability/user-links (requires a superadmin app session).
 */

import { z } from 'zod';
import { defineTool, seg, omit, yearArg, uuidArg, type AnyToolSpec } from '@/src/tools/spec';

export const settingsSpecs: AnyToolSpec[] = [
  defineTool({
    name: 'list_settings_verticals',
    description: 'Settings: list verticals.',
    shape: {},
    path: () => '/admin/settings/verticals',
  }),
  defineTool({
    name: 'create_settings_vertical',
    description: 'Settings: create a vertical.',
    shape: { name: z.string(), code: z.string() },
    method: 'POST',
    path: () => '/admin/settings/verticals',
    body: (a) => a,
  }),
  defineTool({
    name: 'update_settings_vertical',
    description: 'Settings: rename or recode a vertical.',
    shape: { id: z.string(), name: z.string().optional(), code: z.string().optional() },
    method: 'PUT',
    path: (a) => `/admin/settings/verticals/${seg(a.id)}`,
    body: (a) => omit(a, 'id'),
  }),
  defineTool({
    name: 'delete_settings_vertical',
    description: 'Settings: delete a vertical.',
    shape: { id: z.string() },
    method: 'DELETE',
    path: (a) => `/admin/settings/verticals/${seg(a.id)}`,
  }),
  defineTool({
    name: 'list_settings_departments',
    description: 'Settings: list departments (hubs).',
    shape: {},
    path: () => '/admin/settings/departments',
  }),
  defineTool({
    name: 'create_settings_department',
    description: 'Settings: create a department.',
    shape: { name: z.string(), code: z.string(), display_order: z.number().int().optional() },
    method: 'POST',
    path: () => '/admin/settings/departments',
    body: (a) => a,
  }),
  defineTool({
    name: 'update_settings_department',
    description: 'Settings: update a department.',
    shape: {
      id: z.string(),
      name: z.string().optional(),
      code: z.string().optional(),
      display_order: z.number().int().optional(),
    },
    method: 'PUT',
    path: (a) => `/admin/settings/departments/${seg(a.id)}`,
    body: (a) => omit(a, 'id'),
  }),

  // ---- Year management ----
  defineTool({
    name: 'get_year_status',
    description: 'Year management: whether a fiscal year is initialized (clients, services, expense categories).',
    shape: { year: yearArg },
    path: (a) => `/admin/year-management/status/${seg(a.year)}`,
  }),
  defineTool({
    name: 'initialize_year',
    description: 'Year management: initialize a new fiscal year copying clients, services and categories from a source year.',
    shape: { source_year: yearArg, target_year: yearArg },
    method: 'POST',
    path: () => '/admin/year-management/initialize',
    body: (a) => a,
  }),
];

export const usersAdminSpecs: AnyToolSpec[] = [
  defineTool({
    name: 'update_user',
    description: 'Users: update an app user (display name, role, department, partner, permissions, active). Does not change email or password.',
    shape: {
      id: uuidArg,
      display_name: z.string().optional(),
      role: z.string().optional().describe('e.g. superadmin, admin, user, partner'),
      department_code: z.string().nullable().optional(),
      partner_id: z.string().uuid().nullable().optional(),
      permissions: z.array(z.unknown()).optional(),
      is_active: z.boolean().optional(),
    },
    method: 'PUT',
    path: (a) => `/admin/users/${seg(a.id)}`,
    body: (a) => omit(a, 'id'),
  }),
  defineTool({
    name: 'delete_user',
    description: 'Users: delete an app user. Irreversible — confirm with the user first.',
    shape: { id: uuidArg },
    method: 'DELETE',
    path: (a) => `/admin/users/${seg(a.id)}`,
  }),
  defineTool({
    name: 'get_users_activity',
    description: 'Users: activity log of all users (pages visited, actions).',
    shape: { range: z.enum(['week', 'month', 'year']).optional() },
    path: () => '/admin/users/activity',
    query: (a) => ({ range: a.range }),
  }),
  defineTool({
    name: 'get_user_activity',
    description: 'Users: activity log of one user.',
    shape: { user_id: uuidArg, range: z.enum(['week', 'month', 'year']).optional() },
    path: (a) => `/admin/users/activity/${seg(a.user_id)}`,
    query: (a) => ({ range: a.range }),
  }),
];

export const clientsProfitabilitySpecs: AnyToolSpec[] = [
  // ---- Clients ----
  defineTool({
    name: 'get_client_fee_history',
    description: 'Clients: history of fee configuration changes for a client (fixed, tiers, fixed + tiers).',
    shape: { id: uuidArg.describe('Client UUID') },
    path: (a) => `/admin/clients/${seg(a.id)}/fee-history`,
  }),
  defineTool({
    name: 'delete_client_fee_history_entry',
    description: 'Clients: delete a fee history entry made by mistake.',
    shape: { id: uuidArg.describe('Client UUID'), entry_id: z.string() },
    method: 'DELETE',
    path: (a) => `/admin/clients/${seg(a.id)}/fee-history/${seg(a.entry_id)}`,
  }),
  defineTool({
    name: 'get_client_billed_summary',
    description: 'Clients: total billed to a client (used to check before deleting a client).',
    shape: { id: uuidArg.describe('Client UUID') },
    path: (a) => `/admin/clients/${seg(a.id)}/billed-summary`,
  }),

  // ---- Profitability ----
  defineTool({
    name: 'add_profitability_revenue_exclusion',
    description: 'Profitability: exclude a revenue component (fee line) of a client from profitability, for one month or the whole year (month 0).',
    shape: {
      client_id: uuidArg,
      year: yearArg,
      month: z.number().int().min(0).max(12).optional().describe('1-12, or 0 = whole year (default 0)'),
      component_key: z.string(),
      component_label: z.string().optional(),
    },
    method: 'POST',
    path: () => '/admin/profitability/revenue-exclusions',
    body: (a) => a,
  }),
  defineTool({
    name: 'remove_profitability_revenue_exclusion',
    description: 'Profitability: remove a revenue exclusion.',
    shape: {
      client_id: uuidArg,
      year: yearArg,
      month: z.number().int().min(0).max(12).optional().describe('1-12, or 0 = whole year (default 0)'),
      component_key: z.string(),
    },
    method: 'DELETE',
    path: () => '/admin/profitability/revenue-exclusions',
    body: (a) => a,
  }),
  defineTool({
    name: 'set_profitability_manual_revenue',
    description: 'Profitability: set a manual fee/revenue for a client in a month (overrides the calculated one).',
    shape: {
      client_id: uuidArg,
      year: yearArg,
      month: z.number().int().min(1).max(12),
      amount: z.number(),
      note: z.string().optional(),
    },
    method: 'PUT',
    path: () => '/admin/profitability/manual-revenue',
    body: (a) => a,
  }),
];

export const commissionsExtrasSpecs: AnyToolSpec[] = [
  defineTool({
    name: 'get_partners_access',
    description: 'Partners: access status of each partner to their space (none, invited, active, disabled).',
    shape: {},
    path: () => '/commissions/partners/access',
  }),
  defineTool({
    name: 'invite_partner',
    description: 'Partners: invite a partner to their commissions space. EXTERNAL ACTION: sends an invitation email — confirm with the user first.',
    shape: { id: uuidArg.describe('Partner UUID'), email: z.string().email().optional() },
    method: 'POST',
    path: (a) => `/commissions/partners/${seg(a.id)}/invite`,
    body: (a) => omit(a, 'id'),
  }),
  defineTool({
    name: 'pay_partner_commission',
    description: 'Partners: mark a partner commission as paid.',
    shape: {
      id: uuidArg.describe('Commission UUID'),
      payment_date: z.string().optional().describe('ISO date YYYY-MM-DD (default today)'),
      payment_reference: z.string().optional(),
    },
    method: 'POST',
    path: (a) => `/commissions/partners/commissions/${seg(a.id)}/pay`,
    body: (a) => omit(a, 'id'),
  }),
  defineTool({
    name: 'delete_partner_commission',
    description: 'Partners: delete a partner commission record.',
    shape: { id: uuidArg.describe('Commission UUID') },
    method: 'DELETE',
    path: (a) => `/commissions/partners/commissions/${seg(a.id)}`,
  }),
];
