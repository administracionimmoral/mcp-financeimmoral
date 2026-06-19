/**
 * Periods tools
 * Service: admin
 * - close_period
 * - reopen_period
 * - get_period_status
 * - list_periods
 */

import { executeTool } from '@/src/tools/executor';
import type { ToolResponse } from '@/src/types';

export async function closePeriod(params: { fiscal_year: number; fiscal_month: number; closed_by: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'close_period',
    params,
    path: '/admin/periods/close',
    method: 'POST',
    body: params,
  });
}

export async function reopenPeriod(params: { fiscal_year: number; fiscal_month: number; reopened_by: string }): Promise<ToolResponse> {
  return executeTool({
    tool: 'reopen_period',
    params,
    path: '/admin/periods/reopen',
    method: 'POST',
    body: params,
  });
}

export async function getPeriodStatus(params: { year: number; month: number }): Promise<ToolResponse> {
  return executeTool({
    tool: 'get_period_status',
    params,
    path: `/admin/periods/${params.year}/${params.month}/status`,
  });
}

export async function listPeriods(): Promise<ToolResponse> {
  return executeTool({
    tool: 'list_periods',
    params: {},
    path: '/admin/periods/',
  });
}
