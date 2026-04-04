/**
 * Expenses tools
 * Service: admin
 * - get_expenses_by_month
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
