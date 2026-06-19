/**
 * Expenses tools
 * Service: admin
 * - get_expenses_by_month
 * - prorate_expenses_preview
 * - prorate_expenses_execute
 * - create_expense
 * - update_expense
 * - delete_expense
 */

import { executeTool } from '@/src/tools/executor';
import type { ToolResponse } from '@/src/types';

export async function getExpensesByMonth(params: { year: number; month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_expenses_by_month',
    params: { year: params.year, month: params.month },
    path: `/admin/expenses/${params.year}/${params.month}`,
  });
}

export async function prorateExpensesPreview(params: { fiscal_year: number; fiscal_month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'prorate_expenses_preview',
    params,
    path: '/admin/expenses/prorate-preview',
    method: 'POST',
    body: params,
  });
}

export async function prorateExpensesExecute(params: { fiscal_year: number; fiscal_month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'prorate_expenses_execute',
    params,
    path: '/admin/expenses/prorate-execute',
    method: 'POST',
    body: params,
  });
}

export async function createExpense(params: {
  fiscal_year: number;
  fiscal_month: number;
  department_id: string;
  expense_category_id: string;
  amount: number;
  description?: string;
  payment_date?: string;
  vendor?: string;
  invoice_number?: string;
  reference_type?: string;
  reference_id?: string;
}): Promise<ToolResponse> {
  return executeTool({
    tool: 'create_expense',
    params,
    path: '/admin/expenses/',
    method: 'POST',
    body: params,
  });
}

export async function updateExpense(params: {
  id: string;
  amount?: number;
  description?: string;
  payment_date?: string;
  vendor?: string;
  invoice_number?: string;
}): Promise<ToolResponse> {
  const { id, ...body } = params;
  return executeTool({
    tool: 'update_expense',
    params,
    path: `/admin/expenses/${id}`,
    method: 'PATCH',
    body,
  });
}

export async function deleteExpense(params: { id: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'delete_expense',
    params,
    path: `/admin/expenses/${params.id}`,
    method: 'DELETE',
  });
}
