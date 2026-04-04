/**
 * Billing tools
 * Service: admin
 * - get_billing_matrix
 * - get_billing_records
 */

import { executeTool } from '@/src/tools/executor';
import type { ToolResponse } from '@/src/types';

export async function getBillingMatrix(params: { year: number; month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_billing_matrix',
    params: { year: params.year, month: params.month },
    path: '/admin/billing/matrix',
    queryParams: { year: params.year, month: params.month },
  });
}

export async function getBillingRecords(params: { year: number; month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_billing_records',
    params: { year: params.year, month: params.month },
    path: '/admin/billing',
    queryParams: { year: params.year, month: params.month },
  });
}
