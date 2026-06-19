/**
 * MCP Server Registration
 * Registers tools with the MCP server, filtered by user permissions.
 * 
 * Admin users: all 20 tools
 * Dept heads: only their department tools, with dept-restricted cost_per_hour
 */

import type { McpServer, ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { DeptRestriction } from '@/src/auth/permissions';

// Tool handlers
import {
  getBillingMatrix, getBillingRecords,
  saveBillingMatrixCell, deleteBillingRow, duplicateBillingRow, calculateBilling,
  getClientBillingForPeriod, updateBillingRecord, addBillingDetail, updateBillingDetail,
  deleteBillingDetail, getBillingClientMonthDetail, getBillingAnnualClientSummary,
  listBillingHiddenClients, hideBillingClient, unhideBillingClient,
} from '@/src/tools/billing';
import {
  listClients, listClientVerticals, getClientById,
  createClient, updateClient, deleteClient, duplicateClient,
} from '@/src/tools/clients';
import { getDashboardKpis } from '@/src/tools/dashboard';
import {
  getExpensesByMonth,
  prorateExpensesPreview, prorateExpensesExecute,
  createExpense, updateExpense, deleteExpense,
} from '@/src/tools/expenses';
import {
  getPlSummary, getPlMatrix, getCostPerHour,
  getPlNotes, savePlNote, setPlNoteStatus, savePlMatrixCell,
  listPlCustomRows, createPlCustomRow, deletePlCustomRow, updatePlCustomRow,
} from '@/src/tools/pl';
import {
  getPaymentSchedule, listPaymentBeneficiaries, getPaymentSummary,
  createPaymentBeneficiary, updatePaymentBeneficiary, deletePaymentBeneficiary,
  listPaymentsForPeriod, createPayment, updatePayment, setPaymentStatus, deletePayment,
} from '@/src/tools/payments';
import {
  getPayrollByMonth, listEmployees, getEmployeeById,
  listEmployeesFiltered, createEmployee, updateEmployeeSalary, updateEmployee,
  deleteEmployeePermanent, deleteEmployee,
  createPayroll, updatePayroll, setPayrollSplits,
} from '@/src/tools/payroll';
import {
  listPartners, getPartnerCommissionsByMonth, getPartnerCommissionsAnnual,
  createPartner, assignClientToPartner, deletePartner,
  calculatePartnerCommissions, createPartnerCommission, updatePartnerCommission,
} from '@/src/tools/commissions';
import { listUsers } from '@/src/tools/users';
import {
  closePeriod, reopenPeriod, getPeriodStatus, listPeriods,
} from '@/src/tools/periods';
import {
  listMediaPlatforms, getMediaInvestment,
  setMediaPlannedInvestment, setMediaPlatformInvestment,
  listMediaHiddenClients, unhideMediaClient, hideMediaClient,
} from '@/src/tools/media';
import {
  getClientFeeTiers, setClientFeeTiers, getPlatformCostRules, addPlatformCostRule,
} from '@/src/tools/fees';
import {
  listImsalesServices, getImsalesBilling, saveImsalesBilling,
  hideImsalesClient, unhideImsalesClient, listImsalesHiddenClients,
} from '@/src/tools/imsales';
import {
  getBudgetRequestsSummary, getBudgetRequestsByDept, listBudgetRequests,
  createBudgetRequest, bulkCreateBudgetRequests,
  approveBudgetRequest, rejectBudgetRequest,
  approveBudgetRequestsByDept, rejectBudgetRequestsByDept,
  deleteBudgetRequestsByDept, deleteBudgetRequest,
} from '@/src/tools/budget-requests';
import {
  getNutfruit, saveNutfruitCell, createNutfruitRow, deleteNutfruitRow,
} from '@/src/tools/nutfruit';
import {
  getIcex, saveIcexCell, createIcexRow, deleteIcexRow,
} from '@/src/tools/icex';
import {
  getClickupStatus, refreshClickupCache, listClickupSpaces, listClickupListsForSpace,
  debugClickupEntries, clickupListsWithTime, listClickupMembers,
  autoMatchProfitabilityClients,
  getProfitabilityUserMappings, getProfitabilityAutoMapping, setProfitabilityUserMappings,
  getProfitabilityClientLists, setProfitabilityClientLists, getProfitabilityAccounts,
  listManualPersons, createManualPerson, updateManualPerson, deleteManualPerson,
  listManualHours, upsertManualHours, deleteManualHours,
  listProfitabilityHiddenItems, hideProfitabilityItem, unhideProfitabilityItem,
} from '@/src/tools/profitability';
import {
  createPaymentLinkFromInvoice, createManualPaymentLink, listPaymentLinks,
  getPaymentLink, sendPaymentLinkEmail, cancelPaymentLink,
} from '@/src/tools/payment-links';
import { recordInvoiceIssued, eventsHealth } from '@/src/tools/events';
import {
  listPlatforms, createPlatform, createPlatformCommission,
  getPlatformCommissions, updatePlatformCommission, markPlatformCommissionReceived,
} from '@/src/tools/platforms';
import {
  createPaymentRequest, listPaymentRequests, getPaymentRequest,
  updatePaymentRequest, deletePaymentRequest,
} from '@/src/tools/payment-requests';

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
      deptDesc('Get the P&L spreadsheet matrix for a given year. Returns month-by-month P&L data. Type must be "real" (actuals), "budget" (planned) or "estimated" (forecast).', dept),
      {
        ...yearShape,
        type: z.enum(['real', 'budget', 'estimated']).describe('Type of P&L data: "real" (actuals), "budget" (planned) or "estimated" (forecast)'),
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

  // ============================================
  // Admin-only write/extended tools (21+)
  //
  // These tools were added to expose the full Finance API surface.
  // They are NOT included in DEPT_HEAD_TOOLS, so only admins receive them.
  // `reg()` is a tiny helper that mirrors the pattern used above:
  // it filters by allowedTools, registers with server.tool, and JSON-
  // serialises the result the same way the existing handlers do.
  // ============================================
  function reg<S extends z.ZodRawShape>(
    name: string,
    description: string,
    shape: S,
    handler: (args: { [K in keyof S]: z.infer<S[K]> }) => Promise<unknown>
  ): void {
    if (!shouldRegister(name, allowedTools)) return;
    // Cast: SDK's ToolCallback uses its own ShapeOutput which is
    // structurally identical to z.infer<z.ZodObject<S>> but nominally
    // distinct, so a thin cast on the callback type is required.
    const cb = (async (args: { [K in keyof S]: z.infer<S[K]> }) => {
      const result = await handler(args);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }) as unknown as ToolCallback<S>;
    server.tool(name, description, shape, cb);
  }

  // Shared zod fragments used a lot below
  const monthIdxShape = z.number().int().min(0).max(11).describe('Month index 0=Jan .. 11=Dec');
  const fiscalShape = {
    fiscal_year: z.number().int().describe('Fiscal year (e.g., 2026)'),
    fiscal_month: z.number().int().min(1).max(12).describe('Fiscal month 1-12'),
  };
  const clientIdShape = { client_id: z.string().uuid().describe('Client UUID') };

  // ---------------- P&L (extras) ----------------
  reg('get_pl_notes', 'Get all P&L notes for a year, indexed by cell.', yearShape, getPlNotes);
  reg('save_pl_note',
    'Create or update a P&L note for a specific section/item/month.',
    {
      ...yearShape,
      view_type: z.string().describe('View type: budget | real | estimated'),
      section: z.string(),
      dept: z.string().optional(),
      item: z.string(),
      month: z.number().int().min(1).max(12).optional(),
      comment: z.string().optional(),
      assigned_to: z.string().optional(),
    },
    savePlNote);
  reg('set_pl_note_status',
    'Mark a P&L note as finalized (done) or not.',
    { note_id: z.string().uuid(), is_finalized: z.boolean() },
    setPlNoteStatus);
  reg('save_pl_matrix_cell',
    'Save a single P&L matrix cell value/comment.',
    {
      ...yearShape,
      view_type: z.string().describe('View type: budget | real | estimated'),
      section: z.string(),
      month: z.number().int().min(1).max(12),
      item: z.string(),
      value: z.number().optional(),
      comment: z.string().optional(),
      assigned_to: z.string().optional(),
    },
    savePlMatrixCell);
  reg('list_pl_custom_rows', 'List user-created custom P&L rows for a year.', yearShape, listPlCustomRows);
  reg('create_pl_custom_row',
    'Create a custom P&L row.',
    {
      ...yearShape,
      view_type: z.string(),
      section_key: z.string(),
      item_name: z.string(),
      position: z.number().int().optional(),
    },
    createPlCustomRow);
  reg('delete_pl_custom_row', 'Delete a P&L custom row.', uuidShape, deletePlCustomRow);
  reg('update_pl_custom_row',
    'Update the name or position of a P&L custom row.',
    { id: z.string().uuid(), item_name: z.string().optional(), position: z.number().int().optional() },
    updatePlCustomRow);

  // ---------------- Periods ----------------
  reg('close_period',
    'Close a fiscal period (admin). Locks the month against further edits.',
    { ...fiscalShape, closed_by: z.string().describe('Identifier of the user closing the period') },
    closePeriod);
  reg('reopen_period',
    'Reopen a previously closed fiscal period (admin).',
    { ...fiscalShape, reopened_by: z.string() },
    reopenPeriod);
  reg('get_period_status',
    'Get the open/closed status of a fiscal period.',
    yearMonthShape,
    getPeriodStatus);
  reg('list_periods', 'List all fiscal periods with their status.', {}, listPeriods);

  // ---------------- Billing (extras) ----------------
  reg('save_billing_matrix_cell',
    'Save a single billing matrix cell value/comment for a client/month/field.',
    {
      ...yearMonthShape,
      ...clientIdShape,
      field: z.string().describe('Cell field key (e.g., service amount, metadata column)'),
      value: z.number().optional(),
      service_id: z.string().uuid().optional(),
      comment: z.string().optional(),
      assigned_to: z.string().optional(),
    },
    saveBillingMatrixCell);
  reg('delete_billing_row',
    'Delete an entire billing row for a client in a month.',
    { ...yearMonthShape, ...clientIdShape },
    deleteBillingRow);
  reg('duplicate_billing_row',
    'Duplicate the previous month billing row into this month for a client.',
    { ...yearMonthShape, ...clientIdShape },
    duplicateBillingRow);
  reg('calculate_billing',
    'Calculate the suggested billing for a client/period (optionally save).',
    { ...clientIdShape, ...fiscalShape, save: z.boolean().optional() },
    calculateBilling);
  reg('get_client_billing_for_period',
    'Get the billing record(s) for one client in a specific period.',
    { ...clientIdShape, ...yearMonthShape },
    getClientBillingForPeriod);
  reg('update_billing_record',
    "Manually edit a billing record's fee/amount/service/notes.",
    {
      id: z.string().uuid(),
      fee_percentage: z.number().optional(),
      target_billing_amount: z.number().optional(),
      override_amount: z.number().optional(),
      service_id: z.string().uuid().optional(),
      notes: z.string().optional(),
    },
    updateBillingRecord);
  reg('add_billing_detail',
    'Add a service detail line to an existing billing record.',
    {
      billing_id: z.string().uuid(),
      service_id: z.string().uuid(),
      amount: z.number(),
      notes: z.string().optional(),
    },
    addBillingDetail);
  reg('update_billing_detail',
    'Update a billing detail line.',
    {
      id: z.string().uuid(),
      service_id: z.string().uuid().optional(),
      amount: z.number().optional(),
      notes: z.string().optional(),
    },
    updateBillingDetail);
  reg('delete_billing_detail', 'Delete a billing detail line.', uuidShape, deleteBillingDetail);
  reg('get_billing_client_month_detail',
    'Detailed billing breakdown for one client/month (modal view).',
    { ...yearMonthShape, ...clientIdShape },
    getBillingClientMonthDetail);
  reg('get_billing_annual_client_summary',
    'Annual billing summary per client (grand totals across the year).',
    yearShape,
    getBillingAnnualClientSummary);
  reg('list_billing_hidden_clients',
    'List clients currently hidden from billing for a period.',
    yearMonthShape,
    listBillingHiddenClients);
  reg('hide_billing_client',
    'Hide a client from billing from a given month onwards.',
    { ...clientIdShape, ...fiscalShape },
    hideBillingClient);
  reg('unhide_billing_client',
    'Re-activate a previously hidden client in billing.',
    { ...clientIdShape, ...fiscalShape },
    unhideBillingClient);

  // ---------------- Expenses (extras) ----------------
  reg('prorate_expenses_preview',
    'Preview how shared expenses would be prorated across departments for a period (no save).',
    fiscalShape,
    prorateExpensesPreview);
  reg('prorate_expenses_execute',
    'Execute proration of shared expenses across departments for a period.',
    fiscalShape,
    prorateExpensesExecute);
  reg('create_expense',
    'Create a manual expense entry.',
    {
      ...fiscalShape,
      department_id: z.string().uuid(),
      expense_category_id: z.string().uuid(),
      amount: z.number(),
      description: z.string().optional(),
      payment_date: z.string().optional().describe('ISO date YYYY-MM-DD'),
      vendor: z.string().optional(),
      invoice_number: z.string().optional(),
      reference_type: z.string().optional(),
      reference_id: z.string().optional(),
    },
    createExpense);
  reg('update_expense',
    'Update an existing expense entry.',
    {
      id: z.string().uuid(),
      amount: z.number().optional(),
      description: z.string().optional(),
      payment_date: z.string().optional(),
      vendor: z.string().optional(),
      invoice_number: z.string().optional(),
    },
    updateExpense);
  reg('delete_expense', 'Delete an expense entry.', uuidShape, deleteExpense);

  // ---------------- Media ----------------
  reg('list_media_platforms', 'List all available ad platforms.', {}, listMediaPlatforms);
  reg('get_media_investment',
    'Get the media investment matrix for a period.',
    yearMonthShape,
    getMediaInvestment);
  reg('set_media_planned_investment',
    'Set the planned media investment amount for a client/period.',
    { ...clientIdShape, ...fiscalShape, amount: z.number() },
    setMediaPlannedInvestment);
  reg('set_media_platform_investment',
    'Set platform-specific media investment for a client/period.',
    { ...clientIdShape, ...fiscalShape, platform_id: z.string().uuid(), amount: z.number() },
    setMediaPlatformInvestment);
  reg('list_media_hidden_clients',
    'List clients hidden from the media investment view for a period.',
    yearMonthShape,
    listMediaHiddenClients);
  reg('unhide_media_client',
    'Unhide a client from the media investment view.',
    { ...clientIdShape, ...fiscalShape },
    unhideMediaClient);
  reg('hide_media_client',
    'Hide a client from the media investment view.',
    { ...clientIdShape, ...fiscalShape },
    hideMediaClient);

  // ---------------- Fees ----------------
  reg('get_client_fee_tiers',
    'Get fee tier configuration for a client.',
    { clientId: z.string().uuid() },
    getClientFeeTiers);
  reg('set_client_fee_tiers',
    'Replace fee tier configuration for a client (batch update).',
    { clientId: z.string().uuid(), tiers: z.array(z.unknown()) },
    setClientFeeTiers);
  reg('get_platform_cost_rules',
    'Get the rules that map platform-count to extra cost.',
    {},
    getPlatformCostRules);
  reg('add_platform_cost_rule',
    'Add a platform-count-based cost rule.',
    { platform_count: z.number().int(), cost_amount: z.number() },
    addPlatformCostRule);

  // ---------------- Clients (extras) ----------------
  reg('create_client',
    'Create a new client.',
    {
      name: z.string(),
      legal_name: z.string().optional(),
      tax_id: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      vertical_id: z.string().uuid().optional(),
      fee_config: z.unknown().optional(),
      notes: z.string().optional(),
      fiscal_year: z.number().int().optional(),
    },
    createClient);
  reg('update_client',
    'Update an existing client.',
    {
      id: z.string().uuid(),
      name: z.string().optional(),
      legal_name: z.string().optional(),
      tax_id: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      vertical_id: z.string().uuid().optional(),
      fee_config: z.unknown().optional(),
      notes: z.string().optional(),
    },
    updateClient);
  reg('delete_client', 'Soft-delete a client.', uuidShape, deleteClient);
  reg('duplicate_client',
    'Duplicate a client with a new name.',
    { id: z.string().uuid(), new_name: z.string(), fiscal_year: z.number().int().optional() },
    duplicateClient);

  // ---------------- Payments (extras) ----------------
  reg('create_payment_beneficiary',
    'Create a payment beneficiary.',
    {
      name: z.string(),
      type: z.string().optional(),
      bank_details: z.unknown().optional(),
      preferred_payment_method: z.string().optional(),
      notes: z.string().optional(),
    },
    createPaymentBeneficiary);
  reg('update_payment_beneficiary',
    'Update a payment beneficiary.',
    {
      id: z.string().uuid(),
      name: z.string().optional(),
      type: z.string().optional(),
      bank_details: z.unknown().optional(),
      preferred_payment_method: z.string().optional(),
      notes: z.string().optional(),
    },
    updatePaymentBeneficiary);
  reg('delete_payment_beneficiary', 'Delete a payment beneficiary.', uuidShape, deletePaymentBeneficiary);
  reg('list_payments_for_period', 'List all payments for a period.', yearMonthShape, listPaymentsForPeriod);
  reg('create_payment',
    'Create a payment entry.',
    {
      payment_type: z.string(),
      beneficiary_id: z.string().uuid().optional(),
      beneficiary_name: z.string().optional(),
      issuing_bank: z.string().optional(),
      invoice_reference: z.string().optional(),
      invoice_received_date: z.string().optional(),
      amount_admk: z.number().optional(),
      amount_infinite: z.number().optional(),
      base_amount: z.number().optional(),
      commission_amount: z.number().optional(),
      incentives_amount: z.number().optional(),
      total_amount: z.number(),
      currency: z.string().optional(),
      payment_status: z.string().optional(),
      payment_date: z.string().optional(),
      due_date: z.string().optional(),
      ...fiscalShape,
      notes: z.string().optional(),
    },
    createPayment);
  reg('update_payment',
    'Update an existing payment entry.',
    {
      id: z.string().uuid(),
      payment_type: z.string().optional(),
      beneficiary_id: z.string().uuid().optional(),
      amount_admk: z.number().optional(),
      amount_infinite: z.number().optional(),
      base_amount: z.number().optional(),
      commission_amount: z.number().optional(),
      incentives_amount: z.number().optional(),
      total_amount: z.number().optional(),
      currency: z.string().optional(),
      payment_status: z.string().optional(),
      due_date: z.string().optional(),
      notes: z.string().optional(),
    },
    updatePayment);
  reg('set_payment_status',
    'Set the status (and optional payment date) of a payment.',
    { id: z.string().uuid(), status: z.string(), payment_date: z.string().optional() },
    setPaymentStatus);
  reg('delete_payment', 'Delete a payment.', uuidShape, deletePayment);

  // ---------------- Imsales ----------------
  reg('list_imsales_services', 'List the Imsales service catalog.', {}, listImsalesServices);
  reg('get_imsales_billing', 'Get the Imsales billing matrix for a period.', yearMonthShape, getImsalesBilling);
  reg('save_imsales_billing',
    'Save the Imsales billing amount for a client/service/period.',
    { ...clientIdShape, ...fiscalShape, service_id: z.string().uuid(), amount: z.number() },
    saveImsalesBilling);
  reg('hide_imsales_client',
    'Hide a client from the Imsales view for a period.',
    { ...clientIdShape, ...fiscalShape },
    hideImsalesClient);
  reg('unhide_imsales_client',
    'Unhide a client from the Imsales view.',
    { ...clientIdShape, ...fiscalShape },
    unhideImsalesClient);
  reg('list_imsales_hidden_clients',
    'List clients hidden from the Imsales view for a period.',
    yearMonthShape,
    listImsalesHiddenClients);

  // ---------------- Budget Requests ----------------
  reg('get_budget_requests_summary',
    'Aggregated summary of budget requests by department/status for a year.',
    yearShape,
    getBudgetRequestsSummary);
  reg('get_budget_requests_by_dept',
    'Budget requests for a department (optionally filtered by year/status).',
    {
      dept: z.string(),
      year: z.number().int().optional(),
      status: z.string().optional(),
    },
    getBudgetRequestsByDept);
  reg('list_budget_requests',
    'List budget requests filtered by year/dept/status.',
    {
      year: z.number().int().optional(),
      dept: z.string().optional(),
      status: z.string().optional(),
    },
    listBudgetRequests);
  reg('create_budget_request',
    'Create a budget request line.',
    {
      fiscal_year: z.number().int(),
      dept: z.string(),
      section: z.string(),
      category: z.string(),
      item: z.string(),
      month_idx: monthIdxShape,
      current_value: z.number().optional(),
      requested_value: z.number(),
      reason: z.string().optional(),
      requested_by: z.string(),
      requested_by_email: z.string(),
    },
    createBudgetRequest);
  reg('bulk_create_budget_requests',
    'Bulk-create budget request lines.',
    {
      requests: z.array(z.unknown()),
      requested_by: z.string(),
      requested_by_email: z.string(),
    },
    bulkCreateBudgetRequests);
  reg('approve_budget_request',
    'Approve a single budget request (auto-updates the budget line).',
    {
      id: z.string().uuid(),
      reviewed_by: z.string(),
      reviewed_by_email: z.string(),
      review_notes: z.string().optional(),
    },
    approveBudgetRequest);
  reg('reject_budget_request',
    'Reject a single budget request.',
    {
      id: z.string().uuid(),
      reviewed_by: z.string(),
      reviewed_by_email: z.string(),
      review_notes: z.string().optional(),
    },
    rejectBudgetRequest);
  reg('approve_budget_requests_by_dept',
    'Approve every budget request for a department/year.',
    {
      fiscal_year: z.number().int(),
      dept: z.string(),
      reviewed_by: z.string(),
      reviewed_by_email: z.string(),
    },
    approveBudgetRequestsByDept);
  reg('reject_budget_requests_by_dept',
    'Reject every budget request for a department/year.',
    {
      fiscal_year: z.number().int(),
      dept: z.string(),
      reviewed_by: z.string(),
      reviewed_by_email: z.string(),
      review_notes: z.string().optional(),
    },
    rejectBudgetRequestsByDept);
  reg('delete_budget_requests_by_dept',
    'Delete every budget request for a department/year (admin).',
    { fiscal_year: z.number().int(), dept: z.string() },
    deleteBudgetRequestsByDept);
  reg('delete_budget_request', 'Delete a single budget request (admin).', uuidShape, deleteBudgetRequest);

  // ---------------- Nutfruit ----------------
  reg('get_nutfruit', 'Get the Nutfruit budget matrix for a year.', yearShape, getNutfruit);
  reg('save_nutfruit_cell',
    'Save a single Nutfruit budget cell value (superadmin).',
    { ...yearShape, row_id: z.string().uuid(), month_idx: monthIdxShape, value: z.number() },
    saveNutfruitCell);
  reg('create_nutfruit_row',
    'Create a Nutfruit revenue row (superadmin).',
    { ...yearShape, item_name: z.string() },
    createNutfruitRow);
  reg('delete_nutfruit_row', 'Delete a Nutfruit row (superadmin).', uuidShape, deleteNutfruitRow);

  // ---------------- ICEX ----------------
  reg('get_icex', 'Get the ICEX budget matrix for a year.', yearShape, getIcex);
  reg('save_icex_cell',
    'Save a single ICEX budget cell value (superadmin).',
    { ...yearShape, row_id: z.string().uuid(), month_idx: monthIdxShape, value: z.number() },
    saveIcexCell);
  reg('create_icex_row',
    'Create an ICEX row (superadmin).',
    { ...yearShape, item_name: z.string() },
    createIcexRow);
  reg('delete_icex_row', 'Delete an ICEX row (superadmin).', uuidShape, deleteIcexRow);

  // ---------------- Profitability ----------------
  reg('get_clickup_status', 'Get ClickUp integration status.', {}, getClickupStatus);
  reg('refresh_clickup_cache',
    'Invalidate the ClickUp time-tracking cache for an optional year.',
    { year: z.number().int().optional() },
    refreshClickupCache);
  reg('list_clickup_spaces', 'List ClickUp spaces in the workspace.', {}, listClickupSpaces);
  reg('list_clickup_lists_for_space',
    'List ClickUp folders/lists inside a space.',
    { spaceId: z.string().describe('ClickUp space id (not a UUID)') },
    listClickupListsForSpace);
  reg('debug_clickup_entries',
    'Return raw ClickUp time entries for a period (debug).',
    yearMonthShape,
    debugClickupEntries);
  reg('clickup_lists_with_time',
    'List ClickUp lists that have time logged in the year.',
    yearShape,
    clickupListsWithTime);
  reg('list_clickup_members', 'List ClickUp workspace members.', {}, listClickupMembers);
  reg('auto_match_profitability_clients',
    'Auto-match ClickUp folders to clients for a year.',
    yearShape,
    autoMatchProfitabilityClients);
  reg('get_profitability_user_mappings',
    'Get user → cost/hour mappings.',
    {},
    getProfitabilityUserMappings);
  reg('get_profitability_auto_mapping',
    'Get auto-detected mapping suggestions for a year.',
    yearShape,
    getProfitabilityAutoMapping);
  reg('set_profitability_user_mappings',
    'Replace the user → cost/hour mappings (superadmin).',
    { mappings: z.array(z.unknown()) },
    setProfitabilityUserMappings);
  reg('get_profitability_client_lists',
    'Get the client ↔ ClickUp list associations.',
    {},
    getProfitabilityClientLists);
  reg('set_profitability_client_lists',
    'Replace the client ↔ ClickUp list associations.',
    { client_lists: z.array(z.unknown()) },
    setProfitabilityClientLists);
  reg('get_profitability_accounts',
    'Get profitability per account/client for a year.',
    yearShape,
    getProfitabilityAccounts);
  reg('list_manual_persons',
    'List manually-tracked persons (non-payroll).',
    { year: z.number().int().optional() },
    listManualPersons);
  reg('create_manual_person',
    'Create a manually-tracked person.',
    {
      name: z.string(),
      cost_per_hour: z.number(),
      department: z.string().optional(),
      notes: z.string().optional(),
    },
    createManualPerson);
  reg('update_manual_person',
    'Update a manually-tracked person.',
    {
      id: z.string().uuid(),
      name: z.string().optional(),
      cost_per_hour: z.number().optional(),
      department: z.string().optional(),
      notes: z.string().optional(),
    },
    updateManualPerson);
  reg('delete_manual_person', 'Delete a manually-tracked person.', uuidShape, deleteManualPerson);
  reg('list_manual_hours',
    'List manual-hours entries (optionally filtered).',
    { year: z.number().int().optional(), client_id: z.string().uuid().optional() },
    listManualHours);
  reg('upsert_manual_hours',
    'Insert or update a manual-hours entry.',
    {
      client_id: z.string().uuid(),
      manual_person_id: z.string().uuid(),
      year: z.number().int(),
      month: z.number().int().min(1).max(12),
      hours: z.number(),
    },
    upsertManualHours);
  reg('delete_manual_hours', 'Delete a manual-hours entry.', uuidShape, deleteManualHours);
  reg('list_profitability_hidden_items',
    'List hidden profitability items (optionally filtered by scope).',
    { scope: z.string().optional() },
    listProfitabilityHiddenItems);
  reg('hide_profitability_item',
    'Hide a profitability item by scope/ref_id.',
    { scope: z.string(), ref_id: z.string() },
    hideProfitabilityItem);
  reg('unhide_profitability_item',
    'Unhide a profitability item by scope/ref_id.',
    { scope: z.string(), ref_id: z.string() },
    unhideProfitabilityItem);

  // ---------------- Payment Links ----------------
  reg('create_payment_link_from_invoice',
    'Create a Stripe payment link from an existing Holded invoice.',
    {
      holded_invoice_id: z.string().optional(),
      holded_doc_number: z.string().optional(),
      concept: z.string(),
      amount_cents: z.number().int(),
      currency: z.string().optional(),
      customer_email: z.string().optional(),
      client_name: z.string().optional(),
      client_tax_id: z.string().optional(),
      vertical: z.string().optional(),
      internal_note: z.string().optional(),
      expires_in_days: z.number().int().optional(),
    },
    createPaymentLinkFromInvoice);
  reg('create_manual_payment_link',
    'Create a standalone Stripe payment link (not linked to a Holded invoice).',
    {
      concept: z.string(),
      amount_cents: z.number().int(),
      currency: z.string().optional(),
      vertical: z.string().optional(),
      client_name: z.string().optional(),
      client_tax_id: z.string().optional(),
      customer_email: z.string().optional(),
      internal_note: z.string().optional(),
      expires_in_days: z.number().int().optional(),
    },
    createManualPaymentLink);
  reg('list_payment_links',
    'List payment links with optional filters.',
    {
      status: z.string().optional(),
      vertical: z.string().optional(),
      from: z.string().optional().describe('ISO date YYYY-MM-DD'),
      to: z.string().optional().describe('ISO date YYYY-MM-DD'),
      limit: z.number().int().optional(),
    },
    listPaymentLinks);
  reg('get_payment_link', 'Get a payment link by id.', uuidShape, getPaymentLink);
  reg('send_payment_link_email',
    'Email a payment link to a recipient.',
    {
      id: z.string().uuid(),
      to: z.string(),
      subject: z.string().optional(),
      body_html: z.string().optional(),
    },
    sendPaymentLinkEmail);
  reg('cancel_payment_link', 'Cancel a payment link.', uuidShape, cancelPaymentLink);

  // ---------------- Events (billing-service) ----------------
  reg('record_invoice_issued',
    'Record an invoice-issued event in the billing-service ledger.',
    {
      contract_id: z.string().uuid(),
      invoice_number: z.string(),
      invoice_date: z.string().describe('ISO date YYYY-MM-DD'),
      base_amount: z.number(),
      client_name: z.string().optional(),
      description: z.string().optional(),
      metadata: z.unknown().optional(),
    },
    recordInvoiceIssued);
  reg('events_health', 'Health check for the billing-service events module.', {}, eventsHealth);

  // ---------------- Commissions (extras — partners) ----------------
  reg('create_partner',
    'Create a commission partner.',
    {
      name: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
      department_id: z.string().uuid().optional(),
      default_commission_rate: z.number().optional(),
      payment_info: z.unknown().optional(),
      notes: z.string().optional(),
    },
    createPartner);
  reg('assign_client_to_partner',
    'Assign a client to a partner with a commission percentage.',
    {
      id: z.string().uuid().describe('Partner UUID'),
      client_id: z.string().uuid(),
      commission_percentage: z.number(),
      effective_from: z.string().optional(),
      notes: z.string().optional(),
    },
    assignClientToPartner);
  reg('delete_partner', 'Delete a partner.', uuidShape, deletePartner);
  reg('calculate_partner_commissions',
    'Calculate (and optionally save) partner commissions for a period.',
    { ...fiscalShape, save: z.boolean().optional() },
    calculatePartnerCommissions);
  reg('create_partner_commission',
    'Manually create a partner commission record.',
    {
      partner_id: z.string().uuid(),
      client_id: z.string().uuid(),
      ...fiscalShape,
      client_billing_amount: z.number(),
      commission_rate: z.number(),
      commission_amount: z.number(),
      is_paid: z.boolean().optional(),
      client_is_paid: z.boolean().optional(),
      paid_date: z.string().optional(),
      notes: z.string().optional(),
    },
    createPartnerCommission);
  reg('update_partner_commission',
    'Update a partner commission record.',
    {
      id: z.string().uuid(),
      fiscal_month: z.number().int().min(1).max(12).optional(),
      client_id: z.string().uuid().optional(),
      client_billing_amount: z.number().optional(),
      commission_rate: z.number().optional(),
      commission_amount: z.number().optional(),
      is_paid: z.boolean().optional(),
      client_is_paid: z.boolean().optional(),
      paid_date: z.string().optional(),
      notes: z.string().optional(),
    },
    updatePartnerCommission);

  // ---------------- Platforms ----------------
  reg('list_platforms',
    'List media/ad platforms used for commission tracking.',
    { is_active: z.boolean().optional() },
    listPlatforms);
  reg('create_platform',
    'Create a platform.',
    {
      name: z.string(),
      platform_type: z.string().optional(),
      default_commission_percentage: z.number().optional(),
      payment_frequency: z.string().optional(),
      contact_email: z.string().optional(),
      notes: z.string().optional(),
    },
    createPlatform);
  reg('create_platform_commission',
    'Register a commission earned from a platform for a period.',
    {
      platform_id: z.string().uuid(),
      ...fiscalShape,
      total_client_spending: z.number(),
      commission_percentage: z.number(),
      commission_earned: z.number(),
      payment_status: z.string().optional(),
      notes: z.string().optional(),
    },
    createPlatformCommission);
  reg('get_platform_commissions',
    'Get platform commissions for a period (optional filters).',
    {
      ...yearMonthShape,
      platform_id: z.string().uuid().optional(),
      payment_status: z.string().optional(),
    },
    getPlatformCommissions);
  reg('update_platform_commission',
    'Update a platform commission record.',
    {
      id: z.string().uuid(),
      total_client_spending: z.number().optional(),
      commission_percentage: z.number().optional(),
      commission_earned: z.number().optional(),
      payment_status: z.string().optional(),
      payment_date: z.string().optional(),
      notes: z.string().optional(),
    },
    updatePlatformCommission);
  reg('mark_platform_commission_received',
    'Mark a platform commission as received.',
    {
      id: z.string().uuid(),
      payment_date: z.string().describe('ISO date YYYY-MM-DD'),
      payment_reference: z.string().optional(),
    },
    markPlatformCommissionReceived);

  // ---------------- Payment Requests ----------------
  reg('create_payment_request',
    'Create a partner payment request (JSON only — invoice file upload not supported via MCP).',
    {
      partner_id: z.string().uuid(),
      partner_email: z.string().optional(),
      ...fiscalShape,
      total_amount: z.number(),
      notes: z.string().optional(),
    },
    createPaymentRequest);
  reg('list_payment_requests',
    'List partner payment requests with optional filters.',
    {
      partner_id: z.string().uuid().optional(),
      status: z.string().optional(),
      year: z.number().int().optional(),
      month: z.number().int().min(1).max(12).optional(),
    },
    listPaymentRequests);
  reg('get_payment_request', 'Get a partner payment request by id.', uuidShape, getPaymentRequest);
  reg('update_payment_request',
    'Update a partner payment request (status / admin notes).',
    {
      id: z.string().uuid(),
      status: z.string().optional(),
      admin_notes: z.string().optional(),
      reviewed_by: z.string().optional(),
    },
    updatePaymentRequest);
  reg('delete_payment_request', 'Delete a partner payment request.', uuidShape, deletePaymentRequest);

  // ---------------- Payroll & Employees (extras) ----------------
  reg('list_employees_filtered',
    'List employees, optionally filtered by active state and department.',
    { is_active: z.boolean().optional(), department_id: z.string().uuid().optional() },
    listEmployeesFiltered);
  reg('create_employee',
    'Create an employee.',
    {
      employee_code: z.string().optional(),
      first_name: z.string(),
      last_name: z.string(),
      email: z.string().optional(),
      hire_date: z.string().describe('ISO date YYYY-MM-DD'),
      current_salary: z.number(),
      position: z.string().optional(),
      primary_department_id: z.string().uuid(),
      is_active: z.boolean().optional(),
      currency: z.string().optional(),
    },
    createEmployee);
  reg('update_employee_salary',
    "Update an employee's salary (creates a history record).",
    {
      id: z.string().uuid(),
      new_salary: z.number(),
      effective_from: z.string().describe('ISO date YYYY-MM-DD'),
      change_reason: z.string().optional(),
      approved_by: z.string().optional(),
    },
    updateEmployeeSalary);
  reg('update_employee',
    'Update general employee data.',
    {
      id: z.string().uuid(),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      email: z.string().optional(),
      position: z.string().optional(),
      primary_department_id: z.string().uuid().optional(),
      is_active: z.boolean().optional(),
      employee_code: z.string().optional(),
      currency: z.string().optional(),
    },
    updateEmployee);
  reg('delete_employee_permanent',
    'Permanently delete an employee and their salary history.',
    uuidShape,
    deleteEmployeePermanent);
  reg('delete_employee', 'Soft-delete (deactivate) an employee.', uuidShape, deleteEmployee);
  reg('create_payroll',
    'Create a monthly payroll record (with optional auto department-splits).',
    {
      employee_id: z.string().uuid(),
      ...fiscalShape,
      gross_salary: z.number(),
      social_security_company: z.number().optional(),
      other_benefits: z.number().optional(),
      total_company_cost: z.number().optional(),
      payment_date: z.string().optional(),
      notes: z.string().optional(),
      auto_split: z.boolean().optional(),
    },
    createPayroll);
  reg('update_payroll',
    'Update a payroll record.',
    {
      id: z.string().uuid(),
      gross_salary: z.number().optional(),
      social_security_company: z.number().optional(),
      other_benefits: z.number().optional(),
      total_company_cost: z.number().optional(),
      payment_date: z.string().optional(),
      notes: z.string().optional(),
    },
    updatePayroll);
  reg('set_payroll_splits',
    'Replace department splits for a payroll record.',
    { id: z.string().uuid(), splits: z.array(z.unknown()) },
    setPayrollSplits);
}
