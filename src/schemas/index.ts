/**
 * Zod schemas for all 20 MCP tools
 * Strict validation with no extra properties allowed
 */

import { z } from 'zod';

// --- Shared validators ---

const yearSchema = z.number().int().min(1000).max(9999).describe('4-digit year');
const monthSchema = z.number().int().min(1).max(12).describe('Month (1-12)');
const uuidSchema = z.string().uuid().describe('Valid UUID');
const plTypeSchema = z.enum(['real', 'budget']).describe('P&L type: real or budget');
const deptSchema = z.enum(['immedia', 'imcontent', 'immoralia']).describe('Department: immedia, imcontent, or immoralia');

// --- Year + Month ---

const yearMonthSchema = z.object({
  year: yearSchema,
  month: monthSchema,
}).strict();

// --- Year only ---

const yearOnlySchema = z.object({
  year: yearSchema,
}).strict();

// --- No params ---

const emptySchema = z.object({}).strict();

// --- UUID only ---

const idSchema = z.object({
  id: uuidSchema,
}).strict();

// ============================================================
// Tool schemas export
// ============================================================

export const schemas = {
  // Billing
  get_billing_matrix: yearMonthSchema,
  get_billing_records: yearMonthSchema,

  // Clients
  list_clients: emptySchema,
  list_client_verticals: emptySchema,
  get_client_by_id: idSchema,

  // Dashboard
  get_dashboard_kpis: yearOnlySchema,

  // Expenses
  get_expenses_by_month: yearMonthSchema,

  // P&L
  get_pl_summary: yearOnlySchema,
  get_pl_matrix: z.object({
    year: yearSchema,
    type: plTypeSchema,
  }).strict(),
  get_cost_per_hour: z.object({
    year: yearSchema,
    dept: deptSchema,
  }).strict(),

  // Payments
  get_payment_schedule: yearMonthSchema,
  list_payment_beneficiaries: emptySchema,
  get_payment_summary: yearMonthSchema,

  // Payroll
  get_payroll_by_month: yearMonthSchema,
  list_employees: emptySchema,
  get_employee_by_id: idSchema,

  // Commissions
  list_partners: emptySchema,
  get_partner_commissions_by_month: yearMonthSchema,
  get_partner_commissions_annual: yearOnlySchema,

  // Users
  list_users: emptySchema,
} as const;

export type ToolName = keyof typeof schemas;
