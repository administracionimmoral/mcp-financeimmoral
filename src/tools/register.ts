/**
 * MCP Server Registration
 * Registers tools with the MCP server, filtered by user permissions.
 * 
 * Admin users: all 20 tools
 * Dept heads: only their department tools, with dept-restricted cost_per_hour
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { DeptRestriction } from '@/src/auth/permissions';

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

// --- Shared Zod shapes ---
const yearShape = { year: z.number().int().min(1000).max(9999).describe('4-digit year (e.g., 2025)') };
const monthShape = { month: z.number().int().min(1).max(12).describe('Month number (1-12)') };
const yearMonthShape = { ...yearShape, ...monthShape };
const uuidShape = { id: z.string().uuid().describe('Valid UUID identifier') };

/**
 * Options for filtering which tools to register
 */
export interface RegisterToolsOptions {
  /** List of tool names to register. If undefined, register all (admin). */
  allowedTools?: string[];
  /** Department restriction for dept heads. Forces dept param on cost_per_hour. */
  dept?: DeptRestriction;
  /** User context string appended to dept-specific tool descriptions */
  userContext?: string;
  /** User display name */
  userName?: string;
}

/**
 * Helper: only register a tool if it's in the allowed list
 */
function shouldRegister(toolName: string, allowed?: string[]): boolean {
  if (!allowed) return true; // No filter = admin = register all
  return allowed.includes(toolName);
}

/**
 * Appends department context to a tool description for dept heads.
 * This helps Claude understand that results should be filtered.
 */
function deptDesc(baseDesc: string, dept?: DeptRestriction): string {
  if (!dept) return baseDesc;
  return `${baseDesc} [DEPARTMENT RESTRICTION: Only show data related to the "${dept}" department. Ignore data from other departments.]`;
}

/**
 * Register MCP tools, optionally filtered by user permissions.
 * 
 * @param server - MCP server instance
 * @param options - Filter options (if omitted, all tools are registered)
 */
export function registerTools(server: McpServer, options?: RegisterToolsOptions): void {
  const { allowedTools, dept, userName } = options || {};

  // Log for debugging
  if (userName) {
    console.log(`[MCP] Registering tools for ${userName}${dept ? ` (dept: ${dept})` : ' (admin)'}`);
  }

  // ============================================
  // 1. get_billing_matrix
  // ============================================
  if (shouldRegister('get_billing_matrix', allowedTools)) {
    server.tool(
      'get_billing_matrix',
      deptDesc('Get the billing matrix for a specific month. Returns the billing grid with client charges and amounts.', dept),
      yearMonthShape,
      async ({ year, month }) => {
        const result = await getBillingMatrix({ year, month });
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
    );
  }

  // ============================================
  // 2. get_billing_records
  // ============================================
  if (shouldRegister('get_billing_records', allowedTools)) {
    server.tool(
      'get_billing_records',
      deptDesc('Get billing records for a specific month. Returns individual billing entries and invoices.', dept),
      yearMonthShape,
      async ({ year, month }) => {
        const result = await getBillingRecords({ year, month });
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
    );
  }

  // ============================================
  // 3. list_clients
  // ============================================
  if (shouldRegister('list_clients', allowedTools)) {
    server.tool(
      'list_clients',
      deptDesc('List all clients. Returns every client in the system with their details.', dept),
      {},
      async () => {
        const result = await listClients();
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
    );
  }

  // ============================================
  // 4. list_client_verticals
  // ============================================
  if (shouldRegister('list_client_verticals', allowedTools)) {
    server.tool(
      'list_client_verticals',
      'List all client verticals. Returns the available vertical/industry categories for clients.',
      {},
      async () => {
        const result = await listClientVerticals();
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
    );
  }

  // ============================================
  // 5. get_client_by_id
  // ============================================
  if (shouldRegister('get_client_by_id', allowedTools)) {
    server.tool(
      'get_client_by_id',
      deptDesc('Get a specific client by their UUID. Returns full client details including contracts and billing information.', dept),
      uuidShape,
      async ({ id }) => {
        const result = await getClientById({ id });
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
    );
  }

  // ============================================
  // 6. get_dashboard_kpis
  // ============================================
  if (shouldRegister('get_dashboard_kpis', allowedTools)) {
    server.tool(
      'get_dashboard_kpis',
      deptDesc('Get key performance indicators (KPIs) for a given year. Returns revenue, expenses, margins, and other financial KPIs.', dept),
      yearShape,
      async ({ year }) => {
        const result = await getDashboardKpis({ year });
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
    );
  }

  // ============================================
  // 7. get_expenses_by_month
  // ============================================
  if (shouldRegister('get_expenses_by_month', allowedTools)) {
    server.tool(
      'get_expenses_by_month',
      deptDesc('Get expenses for a specific month. Returns all expense entries and categories.', dept),
      yearMonthShape,
      async ({ year, month }) => {
        const result = await getExpensesByMonth({ year, month });
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
    );
  }

  // ============================================
  // 8. get_pl_summary
  // ============================================
  if (shouldRegister('get_pl_summary', allowedTools)) {
    server.tool(
      'get_pl_summary',
      deptDesc('Get the Profit & Loss summary for a given year. Returns annual P&L breakdown with revenue, costs, and net profit.', dept),
      yearShape,
      async ({ year }) => {
        const result = await getPlSummary({ year });
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
    );
  }

  // ============================================
  // 9. get_pl_matrix
  // ============================================
  if (shouldRegister('get_pl_matrix', allowedTools)) {
    server.tool(
      'get_pl_matrix',
      deptDesc('Get the P&L spreadsheet matrix for a given year. Returns month-by-month P&L data. Type must be "real" for actual figures or "budget" for budgeted figures.', dept),
      {
        ...yearShape,
        type: z.enum(['real', 'budget']).describe('Type of P&L data: "real" for actual figures or "budget" for budgeted figures'),
      },
      async ({ year, type }) => {
        const result = await getPlMatrix({ year, type });
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
    );
  }

  // ============================================
  // 10. get_cost_per_hour
  // SPECIAL: dept heads get their dept hardcoded
  // ============================================
  if (shouldRegister('get_cost_per_hour', allowedTools)) {
    if (dept) {
      // --- DEPT HEAD: lock to their department ---
      server.tool(
        'get_cost_per_hour',
        `Get cost-per-hour metrics for the ${dept} department. Returns hourly cost analysis for team productivity. Department is fixed to "${dept}".`,
        yearShape, // No dept param — it's forced
        async ({ year }) => {
          const result = await getCostPerHour({ year, dept });
          return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
        }
      );
    } else {
      // --- ADMIN: choose any department ---
      server.tool(
        'get_cost_per_hour',
        'Get cost-per-hour metrics for a given year and department. Returns hourly cost analysis for team productivity. Department must be one of: immedia, imcontent, or immoralia.',
        {
          ...yearShape,
          dept: z.enum(['immedia', 'imcontent', 'immoralia']).describe('Department: "immedia", "imcontent", or "immoralia"'),
        },
        async ({ year, dept: d }) => {
          const result = await getCostPerHour({ year, dept: d });
          return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
        }
      );
    }
  }

  // ============================================
  // 11. get_payment_schedule
  // ============================================
  if (shouldRegister('get_payment_schedule', allowedTools)) {
    server.tool(
      'get_payment_schedule',
      'Get the payment schedule for a specific month. Returns all scheduled payments and their statuses.',
      yearMonthShape,
      async ({ year, month }) => {
        const result = await getPaymentSchedule({ year, month });
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
    );
  }

  // ============================================
  // 12. list_payment_beneficiaries
  // ============================================
  if (shouldRegister('list_payment_beneficiaries', allowedTools)) {
    server.tool(
      'list_payment_beneficiaries',
      'List all payment beneficiaries. Returns every registered beneficiary with their payment details.',
      {},
      async () => {
        const result = await listPaymentBeneficiaries();
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
    );
  }

  // ============================================
  // 13. get_payment_summary
  // ============================================
  if (shouldRegister('get_payment_summary', allowedTools)) {
    server.tool(
      'get_payment_summary',
      'Get the payment summary for a specific month. Returns aggregated payment totals and breakdown.',
      yearMonthShape,
      async ({ year, month }) => {
        const result = await getPaymentSummary({ year, month });
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
    );
  }

  // ============================================
  // 14. get_payroll_by_month
  // ============================================
  if (shouldRegister('get_payroll_by_month', allowedTools)) {
    server.tool(
      'get_payroll_by_month',
      'Get payroll data for a specific month. Returns employee salaries, deductions, and total payroll costs.',
      yearMonthShape,
      async ({ year, month }) => {
        const result = await getPayrollByMonth({ year, month });
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
    );
  }

  // ============================================
  // 15. list_employees
  // ============================================
  if (shouldRegister('list_employees', allowedTools)) {
    server.tool(
      'list_employees',
      'List all employees. Returns every employee in the system with their profile and department information.',
      {},
      async () => {
        const result = await listEmployees();
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
    );
  }

  // ============================================
  // 16. get_employee_by_id
  // ============================================
  if (shouldRegister('get_employee_by_id', allowedTools)) {
    server.tool(
      'get_employee_by_id',
      'Get a specific employee by their UUID. Returns full employee details including department, salary, and role information.',
      uuidShape,
      async ({ id }) => {
        const result = await getEmployeeById({ id });
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
    );
  }

  // ============================================
  // 17. list_partners
  // ============================================
  if (shouldRegister('list_partners', allowedTools)) {
    server.tool(
      'list_partners',
      'List all partners. Returns every partner in the system with their details and commission rates.',
      {},
      async () => {
        const result = await listPartners();
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
    );
  }

  // ============================================
  // 18. get_partner_commissions_by_month
  // ============================================
  if (shouldRegister('get_partner_commissions_by_month', allowedTools)) {
    server.tool(
      'get_partner_commissions_by_month',
      'Get partner commissions for a specific month. Returns commission calculations and amounts per partner.',
      yearMonthShape,
      async ({ year, month }) => {
        const result = await getPartnerCommissionsByMonth({ year, month });
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
    );
  }

  // ============================================
  // 19. get_partner_commissions_annual
  // ============================================
  if (shouldRegister('get_partner_commissions_annual', allowedTools)) {
    server.tool(
      'get_partner_commissions_annual',
      'Get annual partner commissions for a given year. Returns the full year commission summary and totals per partner.',
      yearShape,
      async ({ year }) => {
        const result = await getPartnerCommissionsAnnual({ year });
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
    );
  }

  // ============================================
  // 20. list_users
  // ============================================
  if (shouldRegister('list_users', allowedTools)) {
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
}
