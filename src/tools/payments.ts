/**
 * Payment tools
 * Service: admin
 * - get_payment_schedule
 * - list_payment_beneficiaries
 * - get_payment_summary
 */

import { executeTool } from '@/src/tools/executor';
import type { ToolResponse } from '@/src/types';

export async function getPaymentSchedule(params: { year: number; month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_payment_schedule',
    params: { year: params.year, month: params.month },
    path: `/admin/payments/schedule/${params.year}/${params.month}`,
  });
}

export async function listPaymentBeneficiaries(): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_payment_beneficiaries',
    params: {},
    path: '/admin/payments/beneficiaries',
  });
}

export async function getPaymentSummary(params: { year: number; month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_payment_summary',
    params: { year: params.year, month: params.month },
    path: `/admin/payments/summary/${params.year}/${params.month}`,
  });
}
