/**
 * MCP Server Registration
 * Registers all 20 tools with the MCP server using mcp-handler
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

// Tool handlers
import { getBillingMatrix, getBillingRecords } from '@/src/tools/billing';
import { listClients, listClientVerticals, getClientById } from '@/src/tools/clients';
import { getDashboardKpis } from '@/src/tools/dashboard';
import { getExpensesByMonth } from '@/src/tools/expenses';
import { getPlSummary, getPlMatrix, getCostPerHour } from '@/src/tools/pl';
import { getPaymentSchedule, listPaymentBeneficiaries, getPaymentSummary } from '@/src/tools/payments';
import { getPayrollByMonth, listEmployees, getEmployeeById } from '@/src/tools/payroll';
import { listPartners, getPartnerCommissionsByMonth, getPartnerCommissionsAnnual } from '@/src/tools/commissions';
import { listUsers } from '@/src/tools/users';
import { buildErrorFromUnknown } from '@/src/lib/response';

// --- Shared Zod shapes ---
const yearShape = { year: z.number().int().min(1000).max(9999).describe('4-digit year (e.g., 2025)') };
const monthShape = { month: z.number().int().min(1).max(12).describe('Month number (1-12)') };
const yearMonthShape = { ...yearShape, ...monthShape };
const uuidShape = { id: z.string().uuid().describe('Valid UUID identifier') };

/**
 * Register all 20 tools on the MCP server
 */
export function registerTools(server: McpServer): void {

  // ============================================
  // 1. get_billing_matrix
  // ============================================
  server.tool(
    'get_billing_matrix',
    'Get the billing matrix for a specific month. Returns the billing grid with client charges and amounts for the given year and month.',
    yearMonthShape,
    async ({ year, month }) => {
      const result = await getBillingMatrix({ year, month });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ============================================
  // 2. get_billing_records
  // ============================================
  server.tool(
    'get_billing_records',
    'Get billing records for a specific month. Returns individual billing entries and invoices for the given year and month.',
    yearMonthShape,
    async ({ year, month }) => {
      const result = await getBillingRecords({ year, month });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ============================================
  // 3. list_clients
  // ============================================
  server.tool(
    'list_clients',
    'List all clients. Returns every client in the system with their details.',
    {},
    async () => {
      const result = await listClients();
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ============================================
  // 4. list_client_verticals
  // ============================================
  server.tool(
    'list_client_verticals',
    'List all client verticals. Returns the available vertical/industry categories for clients.',
    {},
    async () => {
      const result = await listClientVerticals();
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ============================================
  // 5. get_client_by_id
  // ============================================
  server.tool(
    'get_client_by_id',
    'Get a specific client by their UUID. Returns full client details including contracts and billing information.',
    uuidShape,
    async ({ id }) => {
      const result = await getClientById({ id });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ============================================
  // 6. get_dashboard_kpis
  // ============================================
  server.tool(
    'get_dashboard_kpis',
    'Get key performance indicators (KPIs) for a given year. Returns revenue, expenses, margins, and other financial KPIs.',
    yearShape,
    async ({ year }) => {
      const result = await getDashboardKpis({ year });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ============================================
  // 7. get_expenses_by_month
  // ============================================
  server.tool(
    'get_expenses_by_month',
    'Get expenses for a specific month. Returns all expense entries and categories for the given year and month.',
    yearMonthShape,
    async ({ year, month }) => {
      const result = await getExpensesByMonth({ year, month });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ============================================
  // 8. get_pl_summary
  // ============================================
  server.tool(
    'get_pl_summary',
    'Get the Profit & Loss summary for a given year. Returns annual P&L breakdown with revenue, costs, and net profit.',
    yearShape,
    async ({ year }) => {
      const result = await getPlSummary({ year });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ============================================
  // 9. get_pl_matrix
  // ============================================
  server.tool(
    'get_pl_matrix',
    'Get the P&L spreadsheet matrix for a given year. Returns month-by-month P&L data. Type must be "real" for actual figures or "budget" for budgeted figures.',
    {
      ...yearShape,
      type: z.enum(['real', 'budget']).describe('Type of P&L data: "real" for actual figures or "budget" for budgeted figures'),
    },
    async ({ year, type }) => {
      const result = await getPlMatrix({ year, type });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ============================================
  // 10. get_cost_per_hour
  // ============================================
  server.tool(
    'get_cost_per_hour',
    'Get cost-per-hour metrics for a given year and department. Returns hourly cost analysis for team productivity. Department must be one of: immedia, imcontent, or immoralia.',
    {
      ...yearShape,
      dept: z.enum(['immedia', 'imcontent', 'immoralia']).describe('Department: "immedia", "imcontent", or "immoralia"'),
    },
    async ({ year, dept }) => {
      const result = await getCostPerHour({ year, dept });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ============================================
  // 11. get_payment_schedule
  // ============================================
  server.tool(
    'get_payment_schedule',
    'Get the payment schedule for a specific month. Returns all scheduled payments and their statuses for the given year and month.',
    yearMonthShape,
    async ({ year, month }) => {
      const result = await getPaymentSchedule({ year, month });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ============================================
  // 12. list_payment_beneficiaries
  // ============================================
  server.tool(
    'list_payment_beneficiaries',
    'List all payment beneficiaries. Returns every registered beneficiary with their payment details.',
    {},
    async () => {
      const result = await listPaymentBeneficiaries();
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ============================================
  // 13. get_payment_summary
  // ============================================
  server.tool(
    'get_payment_summary',
    'Get the payment summary for a specific month. Returns aggregated payment totals and breakdown for the given year and month.',
    yearMonthShape,
    async ({ year, month }) => {
      const result = await getPaymentSummary({ year, month });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ============================================
  // 14. get_payroll_by_month
  // ============================================
  server.tool(
    'get_payroll_by_month',
    'Get payroll data for a specific month. Returns employee salaries, deductions, and total payroll costs for the given year and month.',
    yearMonthShape,
    async ({ year, month }) => {
      const result = await getPayrollByMonth({ year, month });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ============================================
  // 15. list_employees
  // ============================================
  server.tool(
    'list_employees',
    'List all employees. Returns every employee in the system with their profile and department information.',
    {},
    async () => {
      const result = await listEmployees();
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ============================================
  // 16. get_employee_by_id
  // ============================================
  server.tool(
    'get_employee_by_id',
    'Get a specific employee by their UUID. Returns full employee details including department, salary, and role information.',
    uuidShape,
    async ({ id }) => {
      const result = await getEmployeeById({ id });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ============================================
  // 17. list_partners
  // ============================================
  server.tool(
    'list_partners',
    'List all partners. Returns every partner in the system with their details and commission rates.',
    {},
    async () => {
      const result = await listPartners();
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ============================================
  // 18. get_partner_commissions_by_month
  // ============================================
  server.tool(
    'get_partner_commissions_by_month',
    'Get partner commissions for a specific month. Returns commission calculations and amounts per partner for the given year and month.',
    yearMonthShape,
    async ({ year, month }) => {
      const result = await getPartnerCommissionsByMonth({ year, month });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ============================================
  // 19. get_partner_commissions_annual
  // ============================================
  server.tool(
    'get_partner_commissions_annual',
    'Get annual partner commissions for a given year. Returns the full year commission summary and totals per partner.',
    yearShape,
    async ({ year }) => {
      const result = await getPartnerCommissionsAnnual({ year });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ============================================
  // 20. list_users
  // ============================================
  server.tool(
    'list_users',
    'List all system users. Returns every user account with their roles and permissions.',
    {},
    async () => {
      const result = await listUsers();
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );
}
